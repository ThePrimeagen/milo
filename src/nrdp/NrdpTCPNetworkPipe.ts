import DataBuffer from "../DataBuffer";
import ICreateTCPNetworkPipeOptions from "../ICreateTCPNetworkPipeOptions";
import IDataBuffer from "../IDataBuffer";
import IDnsResult from "../IDnsResult";
import IPipeResult from "../IPipeResult";
import IPlatform from "../IPlatform";
import N = nrdsocket;
import NetworkPipe from "../NetworkPipe";
import { DnsType } from "../types";
import { NrdpPlatform } from "./Platform";

function assert(platform: IPlatform, condition: any, msg?: string): asserts condition {
    platform.assert(condition, msg);
}

export class NrdpTCPNetworkPipe extends NetworkPipe {
    private sock: number;
    private writeBuffers: (Uint8Array | ArrayBuffer | IDataBuffer | string)[];
    private writeBufferOffsets: number[];
    private writeBufferLengths: number[];
    private selectMode: number;

    public ipAddress: string;
    public hostname: string;
    public port: number;
    public bytesRead: number;
    public bytesWritten: number;
    public firstByteRead: number;
    public firstByteWritten: number;

    constructor(platform: NrdpPlatform,
                socket: number,
                hostname: string,
                port: number,
                ipAddress: string) {
        super(platform);
        this.sock = socket;
        this.ipAddress = ipAddress;
        this.writeBuffers = [];
        this.writeBufferOffsets = [];
        this.writeBufferLengths = [];
        this.selectMode = 0;
        this.hostname = hostname;
        this.port = port;
        this.bytesRead = 0;
        this.bytesWritten = 0;
        this.firstByteRead = 0;
        this.firstByteWritten = 0;
    }

    get socket() { return this.sock; }

    get closed() { return this.sock === -1; }
    get ssl() { return false; }

    removeEventHandlers() {
        this.removeAllListeners();
        if (this.selectMode) {
            if (this.sock !== -1) {
                N.clearFD(this.sock);
            }
            this.selectMode = 0;
        }
    }

    clearStats() {
        this.bytesRead = 0;
        this.bytesWritten = 0;
        this.firstByteRead = 0;
        this.firstByteWritten = 0;
    }

    write(buf: IDataBuffer | string, offset?: number, length?: number): void {
        if (typeof buf === "string") {
            buf = new DataBuffer(buf);
            length = buf.byteLength;
        }
        offset = offset || 0;
        if (!length)
            throw new Error("0 length write");

        assert(this.platform,
               this.writeBuffers.length === this.writeBufferLengths.length,
               "These should be the same length");
        this.writeBuffers.push(buf);
        this.writeBufferOffsets.push(offset);
        this.writeBufferLengths.push(length);
        if (this.writeBuffers.length === 1) { // don't really need these arrays when writebuffers is empty
            this._write();
        } else {
            assert(this.platform, this.selectMode === N.READWRITE);
        }
    }

    read(buf: IDataBuffer, offset: number, length: number): number {
        let read = this.unstash(buf, offset, length);
        if (read === -1) {
            read = N.read(this.sock, buf, offset, length);
            switch (read) {
            case 0:
                N.close(this.sock);
                this.sock = -1;
                this.emit("close");
                break;
            case -1:
                if (N.errno !== N.EWOULDBLOCK)
                    this._error(new Error(`read error, errno: ${N.errno} ${N.strerror()}`));
                return -1; //
            default:
                if (!this.firstByteRead)
                    this.firstByteRead = this.platform.mono();
                break;
            }
        }
        assert(this.platform, read >= 0, "Should not be negative");
        this.bytesRead += read;
        return read;
    }

    close(): void {
        assert(this.platform, this.sock !== -1);
        N.close(this.sock); // ### error checking?
        this.sock = -1;
        this.emit("close");
    }

    private _write(): void {
        assert(this.platform, this.writeBuffers.length, "Should have write buffers " + this.sock);
        assert(this.platform, this.writeBuffers.length === this.writeBufferOffsets.length,
               `writeBuffers and writeBufferOffsets should have the same length ${this.writeBuffers.length} vs ${this.writeBufferOffsets}.length`);
        assert(this.platform, this.writeBuffers.length === this.writeBufferLengths.length,
               `writeBuffers and writeBufferLengths have the same length ${this.writeBuffers.length} vs ${this.writeBufferLengths}.length`);
        while (this.writeBuffers.length) {
            assert(this.platform, this.writeBufferOffsets[0] < this.writeBufferLengths[0], "Nothing to write");
            const written = N.write(this.sock, this.writeBuffers[0],
                                    this.writeBufferOffsets[0], this.writeBufferLengths[0]);
            this.platform.trace("wrote", written, "of", this.writeBufferLengths[0], "for", this.sock);
            if (written > 0) {
                if (!this.firstByteWritten)
                    this.firstByteWritten = this.platform.mono();
                this.bytesWritten += written;
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
                this._error(new Error(`write error, errno: ${N.errno} ${N.strerror()}`));
                return;
            }
        }
        const mode = this.writeBuffers.length ? N.READWRITE : N.READ;
        if (mode !== this.selectMode) {
            this.selectMode = mode;
            N.setFD(this.sock, mode, this._onSelect.bind(this));
            assert(this.platform, !(mode & N.WRITE) || this.writeBuffers.length, "Should have write buffers now");
        }
    }
    /* tslint:disable:no-shadowed-variable */
    private _onSelect(sock: number, mode: number): void {
        if (mode & N.READ) {
            this.emit("data");
        }

        if (mode & N.WRITE) {
            this._write();
        }
    }

    private _error(error: Error): void {
        N.close(this.sock);
        this.sock = -1;
        this.emit("error", error);
    }
};

export default function createTCPNetworkPipe(platform: NrdpPlatform,
                                             options: ICreateTCPNetworkPipeOptions): Promise<IPipeResult> {
    let dnsStartTime = 0;
    let dnsType: DnsType;
    let dnsChannel: string;
    let cname: string;
    let dnsWireTime: number;
    return new Promise<IPipeResult>((resolve, reject) => {
        new Promise<N.Sockaddr>(innerResolve => {
            let ipAddress = options.hostname;
            if (typeof options.port !== "undefined")
                ipAddress += ":" + options.port;

            if (options.ipVersion !== 4 && options.ipVersion !== 6) {
                reject(new Error("Invalid ip version in options"));
            }

            let sockAddr: N.Sockaddr;
            try {
                sockAddr = new N.Sockaddr(ipAddress);
                if (sockAddr.ipVersion !== options.ipVersion) {
                    reject(new Error("Invalid ip version in ip address"));
                }
                dnsType = "literal";
                innerResolve(sockAddr);
            } catch (err) {
                dnsStartTime = platform.mono();
                nrdp.dns.lookupHost(options.hostname, options.ipVersion,
                                    options.dnsTimeout, (dnsResult: IDnsResult) => {
                                        // platform.log("got dns result", dnsResult);
                                        if (!dnsResult.addresses.length) {
                                            reject(new Error("Failed to lookup host"));
                                            return;
                                        }
                                        try {
                                            // ### gotta do happy eyeballing, racing of tcp connections etc
                                            sockAddr = new N.Sockaddr(`${dnsResult.addresses[0]}:${options.port}`);
                                            dnsType = dnsResult.type;
                                            dnsChannel = dnsResult.channel;
                                            cname = dnsResult.name;
                                            dnsWireTime = dnsResult.time;
                                            innerResolve(sockAddr);
                                        } catch (err) {
                                            reject(new Error("Failed to parse ip address " + err.toString()));
                                        }
                                    });
            }
        }).then((sockAddr: N.Sockaddr) => {
            const now = platform.mono();
            const dnsTime = dnsStartTime ? now - dnsStartTime : 0;
            let sock = -1;
            function connected() {
                assert(platform, sockAddr.ipAddress, "Gotta have an ip address at this point");
                assert(platform, dnsType, "Must have dns here");
                resolve({
                    pipe: new NrdpTCPNetworkPipe(platform, sock, options.hostname, options.port, sockAddr.ipAddress),
                    socketReused: false,
                    connectTime: platform.mono() - now,
                    dnsWireTime,
                    dnsTime,
                    dnsChannel,
                    dnsType,
                    cname
                });
            }
            try {
                sock = N.socket(N.AF_INET, N.SOCK_STREAM, 0);
                const cur = N.fcntl(sock, N.F_GETFL);
                N.fcntl(sock, N.F_SETFL, cur | N.O_NONBLOCK);
                const ret = N.connect(sock, sockAddr);
                if (!ret) {
                    connected();
                } else if (N.errno !== N.EINPROGRESS) {
                    throw new Error("Failed to connect " + N.errno + " " + N.strerror());
                } else {
                    const connectTimeoutId = setTimeout(() => {
                        N.clearFD(sock);
                        N.close(sock);
                        sock = -1;
                        reject(new Error("Timed out connecting to host"));
                    }, options.connectTimeout);
                    /* tslint:disable:no-shadowed-variable */
                    N.setFD(sock, N.WRITE, (sock: number, mode: number) => {
                        // ### should use DataBuffer
                        const ret = N.getsockopt(sock, N.SOL_SOCKET, N.SO_ERROR, platform.scratch);
                        if (ret === -1) {
                            reject(new Error(`Failed to connect to host ${N.errno}`));
                            return;
                        }

                        const errno = platform.scratch.getInt32(0);
                        switch (errno) {
                        case N.EINPROGRESS:
                            break;
                        case N.EISCONN:
                        case 0:
                            clearTimeout(connectTimeoutId);
                            N.clearFD(sock);
                            connected();
                            break;
                        default:
                            reject(new Error(`Failed to connect to host ${options.hostname}:${options.port} ${errno}`));
                            break;
                        }
                    });
                }
            } catch (err) {
                if (sock !== -1)
                    N.close(sock);
                reject(err);
            }
        });
    });
};
