import N from "./ScriptSocket";
import nrdp from "./nrdp";
import { NetworkPipe, OnData, OnClose, OnError, DnsResult, CreateTCPNetworkPipeOptions, Platform } from "../types";

export class NrdpTCPNetworkPipe implements NetworkPipe {
    private sock: number;
    private writeBuffers: (Uint8Array|ArrayBuffer|string)[];
    private writeBufferOffsets: number[];
    private writeBufferLengths: number[];
    private selectMode: number;

    constructor(socket: number)
    {
        this.sock = socket;
        this.writeBuffers = [];
        this.writeBufferOffsets = [];
        this.writeBufferLengths = [];
        this.selectMode = 0;
    }

    get fd() { return this.sock; }

    get closed() { return this.sock === -1; }

    write(buf: Uint8Array | ArrayBuffer | string, offset?: number, length?: number): void
    {
        if (typeof buf === "string") {
            const u8: Uint8Array = nrdp.atoutf8(buf);
            length = u8.byteLength;
            buf = u8;
        }
        offset = offset || 0;

        if (!length)
            throw new Error("0 length write");

        nrdp.assert(this.writeBuffers.length == this.writeBufferOffsets.length);
        nrdp.assert(this.writeBuffers.length == this.writeBufferLengths.length);
        this.writeBuffers.push(buf);
        this.writeBufferOffsets.push(offset);
        this.writeBufferLengths.push(length);
        if (this.writeBuffers.length == 1) { // don't really need these arrays when writebuffers is empty
            this._write();
        } else {
            nrdp.assert(this.selectMode == N.READWRITE);
        }
    }

    read(buf: Uint8Array | ArrayBuffer, offset: number, length: number): number
    {
        // ### loop?
        const read = N.read(this.sock, buf, offset, length);
        switch (read) {
            case 0:
                N.close(this.sock);
                this.sock = -1;
                if (this.onclose)
                    this.onclose();
                break;
            case -1:
                if (N.errno !== N.EWOULDBLOCK)
                    this._error(N.errno, N.strerror());
                break;
            default:
                break;
        }
        return read;
    }

    close(): void
    {
        nrdp.assert(this.sock !== -1);
        N.close(this.sock); // ### error checking?
        if (this.onclose)
            this.onclose();
    }

    public ondata?: OnData;
    public onclose?: OnClose;
    public onerror?: OnError;

    private _write(): void
    {
        nrdp.assert(this.writeBuffers.length);
        nrdp.assert(this.writeBuffers.length == this.writeBufferOffsets.length);
        nrdp.assert(this.writeBuffers.length == this.writeBufferLengths.length);
        while (this.writeBuffers.length) {
            nrdp.assert(this.writeBufferOffsets[0] < this.writeBufferLengths[0], "Nothing to write");
            const written = N.write(this.sock, this.writeBuffers[0], this.writeBufferOffsets[0], this.writeBufferLengths[0]);
            nrdp.l("wrote", written, "of", this.writeBufferLengths[0]);
            if (written > 0) {
                this.writeBufferOffsets[0] += written;
                this.writeBufferLengths[0] -= written;
                if (!this.writeBufferLengths[0]) {
                    this.writeBuffers.shift();
                    this.writeBufferOffsets.shift();
                    this.writeBufferLengths.shift();
                }
            } else if (N.errno === N.EWOULDBLOCK) {
                break;
            } else {
                this._error(N.errno, "Write failure " + N.strerror());
                return;
            }
        }
        const mode = this.writeBuffers.length ? N.READWRITE : N.READ;
        if (mode != this.selectMode) {
            this.selectMode = mode;
            N.setFD(this.sock, mode, this._onSelect.bind(this));
        }
    }
    private _onSelect(sock: number, mode: number): void
    {
        if (mode & N.READ && this.ondata) {
            this.ondata();
        }

        if (mode & N.WRITE) {
            this._write();
        }
    }

    private _error(code: number, reason: string): void
    {
        N.close(this.sock);
        this.sock = -1;
        if (this.onerror)
            this.onerror(code, reason);
    }
};

// TODO: We only allow ipv4
// we should create an opts
export default function connectTCPNetworkPipe(options: CreateTCPNetworkPipeOptions, platform: Platform): Promise<NetworkPipe> {
    return new Promise<NetworkPipe>((resolve, reject) => {
        new Promise<N.Sockaddr>(innerResolve => {
            let ipAddress = options.host;
            if (typeof options.port != "undefined")
                ipAddress += ":" + options.port;

            let sockAddr: N.Sockaddr;
            try {
                sockAddr = new N.Sockaddr(ipAddress);
                innerResolve(sockAddr);
            } catch (err) {
                nrdp.dns.lookupHost(options.host, 4, 10000, (dnsResult: DnsResult) => {
                    // console.log("got dns result");
                    if (!dnsResult.addresses.length) {
                        reject(new Error("Failed to lookup host"));
                        return;
                    }
                    try {
                        sockAddr = new N.Sockaddr(`${dnsResult.addresses[0]}:${options.port}`);
                        innerResolve(sockAddr);
                    } catch (err) {
                        reject(new Error("Failed to parse ip address"));
                    }
                });
            }
        }).then((sockAddr: N.Sockaddr) => {
            try {
                const sock = N.socket(N.AF_INET, N.SOCK_STREAM, 0);
                const cur = N.fcntl(sock, N.F_GETFL);
                N.fcntl(sock, N.F_SETFL, cur | N.O_NONBLOCK);
                let ret = N.connect(sock, sockAddr);
                if (!ret) {
                    resolve(new NrdpTCPNetworkPipe(sock));
                } else if (N.errno != N.EINPROGRESS) {
                    throw new Error("Failed to connect " + N.errno + " " + N.strerror());
                } else {
                    N.setFD(sock, N.WRITE, (sock: number, mode: number) => {
                        const buf = new Int32Array(2);
                        const ret = N.getsockopt(sock, N.SOL_SOCKET, N.SO_ERROR, buf);
                        if (ret == -1) {
                            reject(new Error(`Failed to connect to host ${N.errno}`));
                            return;
                        }

                        const errno = buf[0];
                        switch (errno) {
                            case N.EINPROGRESS:
                                break;
                            case N.EISCONN:
                            case 0:
                                N.clearFD(sock);
                                resolve(new NrdpTCPNetworkPipe(sock));
                                break;
                            default:
                                reject(new Error(`Failed to connect to host ${errno}`));
                                break;
                        }
                    });
                }
            } catch (err) {
                reject(err);
            }
        });
    });
};
