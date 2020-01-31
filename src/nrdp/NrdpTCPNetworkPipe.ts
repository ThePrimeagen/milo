import { CreateTCPNetworkPipeOptions, DnsResult, NetworkPipe, OnClose, OnData, OnError } from "../types";
import { NrdpPlatform } from "./Platform";
import N = nrdsocket;

let platform: NrdpPlatform | undefined;
function assert(condition: any, msg?: string): asserts condition {
    if (!condition && platform) {
        platform.assert(condition, msg);
    }
}

export class NrdpTCPNetworkPipe implements NetworkPipe {
    private sock: number;
    private writeBuffers: (Uint8Array | ArrayBuffer | string)[];
    private writeBufferOffsets: number[];
    private writeBufferLengths: number[];
    private selectMode: number;
    private platform: NrdpPlatform;
    private buffer?: ArrayBuffer;

    constructor(p: NrdpPlatform, socket: number, ipAddress: string, connectTime: number, dnsTime: number, dns: string, dnsChannel?: string) {
        this.platform = p;
        platform = p;
        this.sock = socket;
        this.ipAddress = ipAddress;
        this.writeBuffers = [];
        this.writeBufferOffsets = [];
        this.writeBufferLengths = [];
        this.selectMode = 0;
        this.dnsTime = dnsTime;
        this.dns = dns;
        this.dnsChannel = dnsChannel;
        this.connectTime = connectTime;
    }

    public firstByteRead?: number;
    public firstByteWritten?: number;
    public dnsTime: number;
    public dns: string;
    public dnsChannel?: string;
    public connectTime: number;
    public ipAddress: string;

    get fd() { return this.sock; }

    get closed() { return this.sock === -1; }

    write(buf: Uint8Array | ArrayBuffer | string, offset?: number, length?: number): void {
        if (typeof buf === "string") {
            const u8: Uint8Array = nrdp.atoutf8(buf);
            length = u8.byteLength;
            buf = u8;
        }
        offset = offset || 0;

        if (!length)
            throw new Error("0 length write");

        assert(this.writeBuffers.length == this.writeBufferOffsets.length, "These should be the same length");
        assert(this.writeBuffers.length == this.writeBufferLengths.length, "These should be the same length");
        this.writeBuffers.push(buf);
        this.writeBufferOffsets.push(offset);
        this.writeBufferLengths.push(length);
        if (this.writeBuffers.length == 1) { // don't really need these arrays when writebuffers is empty
            this._write();
        } else {
            assert(this.selectMode == N.READWRITE);
        }
    }

    read(buf: Uint8Array | ArrayBuffer, offset: number, length: number): number {
        let bufferRead = 0;
        if (this.buffer) {
            const byteLength = this.buffer.byteLength;
            if (length >= byteLength) {
                this.platform.bufferSet(buf, offset, this.buffer, 0, byteLength);
                offset += byteLength;
                length -= byteLength;
                bufferRead = byteLength;
                this.buffer = undefined;
                // ### maybe pool these buffers?
            } else {
                this.platform.bufferSet(buf, offset, this.buffer, 0, length);
                this.buffer = this.buffer.slice(length);
                return length;
            }
        }
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
            return -1; //
        default:
            if (!this.firstByteRead)
                this.firstByteRead = this.platform.mono();
            break;
        }
        return read + bufferRead;
    }

    unread(buf: ArrayBuffer): void {
        if (this.buffer) {
            this.buffer = this.platform.bufferConcat(this.buffer, buf);
        } else {
            this.buffer = buf;
        }
        if (this.ondata)
            this.ondata();
    }

    close(): void {
        assert(this.sock !== -1);
        N.close(this.sock); // ### error checking?
        if (this.onclose)
            this.onclose();
    }

    public ondata?: OnData;
    public onclose?: OnClose;
    public onerror?: OnError;

    private _write(): void {
        assert(this.writeBuffers.length);
        assert(this.writeBuffers.length == this.writeBufferOffsets.length);
        assert(this.writeBuffers.length == this.writeBufferLengths.length);
        while (this.writeBuffers.length) {
            assert(this.writeBufferOffsets[0] < this.writeBufferLengths[0], "Nothing to write");
            const written = N.write(this.sock, this.writeBuffers[0], this.writeBufferOffsets[0], this.writeBufferLengths[0]);
            this.platform.trace("wrote", written, "of", this.writeBufferLengths[0]);
            if (written > 0) {
                if (!this.firstByteWritten)
                    this.firstByteWritten = this.platform.mono();
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
    private _onSelect(sock: number, mode: number): void {
        if (mode & N.READ && this.ondata) {
            this.ondata();
        }

        if (mode & N.WRITE) {
            this._write();
        }
    }

    private _error(code: number, reason: string): void {
        N.close(this.sock);
        this.sock = -1;
        if (this.onerror)
            this.onerror(code, reason);
    }
};

export default function createTCPNetworkPipe(options: CreateTCPNetworkPipeOptions, platform: NrdpPlatform): Promise<NetworkPipe> {
    let dnsStartTime = 0;
    let dns: string | undefined;
    let dnsChannel: string | undefined;
    return new Promise<NetworkPipe>((resolve, reject) => {
        new Promise<N.Sockaddr>(innerResolve => {
            let ipAddress = options.host;
            if (typeof options.port != "undefined")
                ipAddress += ":" + options.port;

            if (options.ipVersion !== 4 && options.ipVersion !== 6) {
                reject(new Error("Invalid ip version in options"));
            }

            let sockAddr: N.Sockaddr;
            try {
                sockAddr = new N.Sockaddr(ipAddress);
                if (sockAddr.ipVersion != options.ipVersion) {
                    reject(new Error("Invalid ip version in ip address"));
                }
                dns = "literal";
                innerResolve(sockAddr);
            } catch (err) {
                dnsStartTime = platform.mono();
                nrdp.dns.lookupHost(options.host, options.ipVersion, options.dnsTimeout, (dnsResult: DnsResult) => {
                    // console.log("got dns result");
                    if (!dnsResult.addresses.length) {
                        reject(new Error("Failed to lookup host"));
                        return;
                    }
                    try {
                        sockAddr = new N.Sockaddr(`${dnsResult.addresses[0]}:${options.port}`);
                        dns = dnsResult.type;
                        dnsChannel = dnsResult.channel;
                        innerResolve(sockAddr);
                    } catch (err) {
                        reject(new Error("Failed to parse ip address"));
                    }
                });
            }
        }).then((sockAddr: N.Sockaddr) => {
            const now = platform.mono();
            const dnsTime = dnsStartTime ? now - dnsStartTime : 0;
            let sock = -1;
            try {
                sock = N.socket(N.AF_INET, N.SOCK_STREAM, 0);
                const cur = N.fcntl(sock, N.F_GETFL);
                N.fcntl(sock, N.F_SETFL, cur | N.O_NONBLOCK);
                let ret = N.connect(sock, sockAddr);
                if (!ret) {
                    assert(sockAddr.ipAddress, "Gotta have an ip address at this point");
                    assert(dns, "Must have dns here");
                    resolve(new NrdpTCPNetworkPipe(platform, sock, sockAddr.ipAddress, platform.mono() - now, dnsTime, dns, dnsChannel));
                } else if (N.errno != N.EINPROGRESS) {
                    throw new Error("Failed to connect " + N.errno + " " + N.strerror());
                } else {
                    const connectTimeoutId = setTimeout(() => {
                        N.clearFD(sock);
                        N.close(sock);
                        sock = -1;
                        reject(new Error("Timed out connecting to host"));
                    }, options.connectTimeout);
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
                            clearTimeout(connectTimeoutId);
                            N.clearFD(sock);
                            assert(sockAddr.ipAddress, "Gotta have an ip address at this point");
                            assert(dns, "Must have dns here");
                            assert(dns, "Must have dns here");
                            resolve(new NrdpTCPNetworkPipe(platform, sock, sockAddr.ipAddress, platform.mono() - now, dnsTime, dns, dnsChannel));
                            break;
                        default:
                            reject(new Error(`Failed to connect to host ${errno}`));
                            break;
                        }
                    });
                }
            } catch (err) {
                if (sock != -1)
                    N.close(sock);
                reject(err);
            }
        });
    });
};
