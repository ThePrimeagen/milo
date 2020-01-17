import net from 'net';
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
    DnsResult
} from "../types";

enum State {
    Connecting = "Connecting",
    Alive = "Alive",
    Destroyed = "Destroyed",
};

class NrdpTCPNetworkPipe implements NetworkPipe
{
    private sock: net.Socket;
    private bufferPool: Buffer[];
    private bufferIdx: number;
    private state: State;

    public ondata: OnData;
    public onclose: OnClose;
    public onerror: OnError;

    constructor(host: string, port: number, onConnect?: () => void) {
        this.bufferIdx = 0;
        this.state = State.Connecting;

        // it defaults to tcp socket
        this.sock = net.connect({
            host,
            port,
            onread: {
                // Reuses a 16KiB Buffer for every read from the socket.
                buffer: Buffer.alloc(16 * 1024),
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
            onConnect();
        });

        this.sock.on('end', () => {
            this.state = State.Destroyed;
            if (this.onclose) {
                this.onclose();
            }
        });

        this.sock.on('error', function(e) {
            this.state = State.Destroyed;
            if (this.onerror) {
                this.onerror(e);
            }
        });
    }

    get fd() {
        throw new Error("Not supported in Node.");
    }

    write(buf: Uint8Array | ArrayBuffer | string, offset?: number, length?: number): void {
        if (this.state != State.Alive) {
            throw new Error(`Unable to write sockets in current state, ${this.state}`);
        }

        this.sock.write(normalizeUint8ArrayLen(buf, offset, length));
    }

    read(buf: Uint8Array | ArrayBuffer, offset: number, length: number): number {
        if (this.state != State.Alive) {
            throw new Error(`Unable to read sockets in current state, ${this.state}`);
        }

        if (this.bufferPool.length === 0) {
            return 0;
        }

        const endIdx = offset + length;
        const writeBuf = createNonCopyBuffer(buf, offset, length);

        let writeAmount = 0;
        let currentIdx = 0;

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

    close(): void {
        // successfully destroy socket.
        this.sock.destroy();
    }
};

// TODO: We only allow ipv4
// we should create an opts
export default function createTCPNetworkPipe(host: string, port: number): Promise<NetworkPipe> {
    return new Promise((res, rej) => {
    });
};


