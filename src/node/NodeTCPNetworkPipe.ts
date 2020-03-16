import net from "net";

import {
    Pool,
    PoolItem,
    PoolFreeFunction,
} from '../pool';

import NetworkPipe from "../NetworkPipe";

import {
    INetworkPipe,
    IDnsResult,
    IDataBuffer,
    ICreateTCPNetworkPipeOptions
} from "../types";

import DataBuffer from "./DataBuffer";

enum State {
    Connecting = "Connecting",
    Alive = "Alive",
    Destroyed = "Destroyed",
};

type ReadBufferItem = {
    idx: number,
    len: number,
    offset: number,
    readBuf: Buffer,
};
const EMPTY_BUFFER = Buffer.alloc(0);

function createReadBufferPool(): Pool<ReadBufferItem> {
    function factory(freeFn: PoolFreeFunction<ReadBufferItem>): PoolItem<ReadBufferItem> {
        const item = {
            idx: 0,
            len: 0,
            offset: 0,
            readBuf: EMPTY_BUFFER,
        };

        const poolItem = {
            item,
            free: () => {
                freeFn(poolItem);
            }
        };

        return poolItem;
    }
    return new Pool<ReadBufferItem>(factory);
}

class NodeTCPNetworkPipe extends NetworkPipe implements INetworkPipe {
    private sock?: net.Socket;
    private bufferPool: PoolItem<ReadBufferItem>[];
    private state: State;
    private pool: Pool<ReadBufferItem>;

    public ipAddress: string = "the ip address!";
    public dns: string = "the dns type!";
    public dnsChannel?: string;
    public hostname: string;
    public port: number;

    public dnsTime: number;
    public connectTime: number;

    get ssl() { return false; }

    // FIXME
    public readonly closed: boolean = false;

    public connection: Promise<NodeTCPNetworkPipe>;

    constructor(host: string, port: number, onConnect?: () => void) {
        super();
        this.dnsTime = -1;
        this.connectTime = -1;
        this.state = State.Connecting;
        this.bufferPool = [];
        this.hostname = host;
        this.port = port;
        this.pool = createReadBufferPool();

        this.connection = new Promise((res, rej) => {
            // it defaults to tcp socket
            this.sock = net.connect({
                host,
                port,
                onread: {
                    // Reuses a 16KiB Buffer for every read from the socket.
                    buffer: Buffer.alloc(32 * 1024),
                    callback: (nread: number, buf: Buffer): boolean => {
                        const copiedBuf = Buffer.allocUnsafe(nread);
                        buf.copy(copiedBuf, 0, 0, nread);

                        const item = this.pool.get();
                        item.item.offset = 0;
                        item.item.idx = 0;
                        item.item.len = nread;
                        item.item.readBuf = copiedBuf;

                        this.bufferPool.push(item);

                        this.emit("data");

                        return true;
                    }
                }
            }, () => {
                this.state = State.Alive;
                res(this);
            });

            this.sock.on('end', () => {
                console.log("tcp sock end");
                this.state = State.Destroyed;
                this.emit("close");
            });

            this.sock.on('error', e => {
                this.state = State.Destroyed;
                rej(e);
                this.emit("error", e);
            });
        });
    }

    get fd() {
        return -1; // called for logging reasons throw new Error("Not supported in Node.");
    }

    removeEventHandlers() {
        this.removeAllListeners();
    }

    write(buf: IDataBuffer | ArrayBuffer | string, offset: number = 0, length?: number): void {
        if (this.state != State.Alive) {
            throw new Error(`Unable to write sockets in current state, ${this.state}`);
        }

        /*
          if (typeof buf === 'string') {
          this.sock.write(buf);
          }
        */

        if (!this.sock) {
            throw new Error("Must have sock");
        }

        // TODO: This is slow and stupid, stop it
        let write: string | Uint8Array;
        if (buf instanceof ArrayBuffer) {
            write = new Uint8Array(buf).subarray(offset, length);
        }
        else if (typeof buf === 'string') {
            write = buf;
        }
        else {
            // TODO: This is the slow case, it is annoying.
            write = (buf.slice(offset, length) as DataBuffer).buffer;
        }

        this.sock.write(write);
    }

    read(buf: IDataBuffer | ArrayBuffer, offset: number, length: number): number {
        if (this.state !== State.Alive) {
            throw new Error(`Unable to read sockets in current state, ${this.state}`);
        }

        if (this.bufferPool.length === 0) {
            return 0;
        }

        const endIdx = offset + length;

        let writeAmount = 0;
        let currentIdx = 0;
        let writeBuf: Buffer;

        if (buf instanceof ArrayBuffer) {
            writeBuf = Buffer.from(buf);
        }
        else {
            writeBuf = (buf as DataBuffer).buffer;
            currentIdx = buf.byteOffset;
        }

        do {
            const pItem = this.bufferPool[0];
            const readItem = pItem.item;
            const rIdx = readItem.idx + readItem.offset;
            const bufRemaining = readItem.len - readItem.idx;
            const localReadAmount = Math.min(length - writeAmount, bufRemaining);

            writeAmount += localReadAmount;

            readItem.readBuf.copy(
                writeBuf, currentIdx, rIdx, rIdx + localReadAmount);

            currentIdx += localReadAmount;
            readItem.idx += localReadAmount;

            // TODO: remove first........... . . . . .  . . . .
            if (localReadAmount === bufRemaining) {
                const removedItem = this.bufferPool.shift();
                if (removedItem) {
                    removedItem.free();
                }
            }

        } while (writeAmount < length && this.bufferPool.length);

        return writeAmount;
    }

    unread(buf: IDataBuffer | ArrayBuffer, offset: number = 0, length?: number) {
        if (length === undefined) {
            length = buf.byteLength - offset;
        }

        const item = this.pool.get();
        item.item.offset = offset;
        item.item.idx = 0;
        item.item.len = length;

        let readBuf: Buffer;
        if (buf instanceof ArrayBuffer) {
            readBuf = Buffer.from(buf);
        }
        else {
            readBuf = (buf as DataBuffer).buffer;
            item.item.offset += buf.byteOffset;
        }

        item.item.readBuf = readBuf;
        this.bufferPool.push(item);
    }

    close(): void {
        if (!this.sock) {
            throw new Error("Must have sock");
        }

        this.sock.destroy();
    }
};

// TODO: We only allow ipv4
// we should create an opts
export default function createTCPNetworkPipe(options: ICreateTCPNetworkPipeOptions): Promise<INetworkPipe> {
    return new Promise((res, rej) => {
        // @ts-ignore
        const pipe = new NodeTCPNetworkPipe(options.host, options.port);
        // @ts-ignore
        pipe.connection.then(res).catch(rej);
    });
};


