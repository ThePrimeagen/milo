import net from "net";
import {
    normalizeBuffer,
    normalizeBufferLen,
    normalizeUint8Array,
    normalizeUint8ArrayLen,
    toUint8Array,
    createNonCopyBuffer,
} from './utils';

import {
    NetworkPipe,
    OnData,
    OnClose,
    OnError,
    DnsResult,
    IDataBuffer,
    CreateTCPNetworkPipeOptions
} from "../types";

import DataBuffer from "./DataBuffer";

enum State {
    Connecting = "Connecting",
    Alive = "Alive",
    Destroyed = "Destroyed",
};

class NodeTCPNetworkPipe implements NetworkPipe {
    private sock?: net.Socket;
    private bufferPool: Buffer[];
    private bufferIdx: number;
    private state: State;

    public ipAddress: string = "the ip address!";
    public dns: string = "the dns type!";
    public dnsChannel?: string;
    public ondata?: OnData;
    public onclose?: OnClose;
    public onerror?: OnError;
    public idle: boolean;
    public forbidReuse: boolean;
    public hostname: string;
    public port: number;

    get ssl() { return false; }

    // FIXME
    public readonly closed: boolean = false;

    public connection: Promise<NodeTCPNetworkPipe>;

    constructor(host: string, port: number, onConnect?: () => void) {
        this.idle = false;
        this.forbidReuse = false;
        this.bufferIdx = 0;
        this.state = State.Connecting;
        this.bufferPool = [];
        this.hostname = host;
        this.port = port;

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
                        this.bufferPool.push(copiedBuf);

                        if (this.ondata) {
                            this.ondata();
                        }

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
                if (this.onclose) {
                    this.onclose();
                }
            });

            this.sock.on('error', e => {
                this.state = State.Destroyed;
                rej(e);
                if (this.onerror) {
                    this.onerror(-1, e.toString());
                }
            });
        });
    }

    // @ts-ignore
    get fd() {
        return -1; // called for logging reasons throw new Error("Not supported in Node.");
    }

    removeEventHandlers() {
        this.ondata = undefined;
        this.onclose = undefined;
        this.onerror = undefined;
    }

    // @ts-ignore
    write(buf: Uint8Array | ArrayBuffer | string, offset?: number, length?: number): void {
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
        this.sock.write(normalizeUint8ArrayLen(buf, offset || 0, length));
    }

    read(buf: IDataBuffer | ArrayBuffer, offset: number, length: number): number {
        if (this.state != State.Alive) {
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
            const b = this.bufferPool[0];
            const bufRemaining = b.byteLength - this.bufferIdx;
            const localReadAmount = Math.min(length - writeAmount, bufRemaining);

            writeAmount += localReadAmount;

            b.copy(writeBuf, currentIdx, this.bufferIdx, this.bufferIdx + localReadAmount);

            currentIdx += localReadAmount;
            this.bufferIdx += localReadAmount;

            // TODO: remove first........... . . . . .  . . . .
            if (localReadAmount === bufRemaining) {
                this.bufferPool.shift();
                this.bufferIdx = 0;
            }

        } while (writeAmount < length && this.bufferPool.length);

        return writeAmount;
    }

    unread(buf: ArrayBuffer | Uint8Array | ArrayBuffer): void {
        throw new Error("Must imprement this");
        //assert(false, "Must implement this");
    }

    close(): void {
        // successfully destroy socket.
        //assert(this.sock !== undefined, "Must have sock");
        if (!this.sock) {
            throw new Error("Must have sock");
        }

        this.sock.destroy();
    }
};

// TODO: We only allow ipv4
// we should create an opts
export default function createTCPNetworkPipe(options: CreateTCPNetworkPipeOptions): Promise<NetworkPipe> {
    return new Promise((res, rej) => {
        // @ts-ignore
        const pipe = new NodeTCPNetworkPipe(options.host, options.port);
        // @ts-ignore
        pipe.connection.then(res).catch(rej);
    });
};


