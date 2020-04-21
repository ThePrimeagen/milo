import DataBuffer from "../DataBuffer";
import ICreateTCPNetworkPipeOptions from "../ICreateTCPNetworkPipeOptions";
import IDataBuffer from "../IDataBuffer";
import IDnsResult from "../IDnsResult";
import INetworkError from "../INetworkError";
import IPipeResult from "../IPipeResult";
import N = nrdsocket;
import NetworkError from "../NetworkError";
import NetworkPipe from "../NetworkPipe";
import assert from '../utils/assert.macro';
import { DnsType, NetworkErrorCode } from "../types";
import { NrdpPlatform } from "./Platform";

export class NrdpTCPNetworkPipe extends NetworkPipe {
    private sock: number;
    private writeBuffers: (Uint8Array | ArrayBuffer | IDataBuffer)[];
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

    write(buf: IDataBuffer | ArrayBuffer | Uint8Array | string, offset?: number, length?: number): void {
        if (typeof buf === "string") {
            buf = new DataBuffer(buf);
            length = buf.byteLength;
        }
        offset = offset || 0;
        if (!length)
            throw new NetworkError(NetworkErrorCode.ZeroLengthWrite, "0 length write");

        assert(this.writeBuffers.length === this.writeBufferLengths.length,
               "These should be the same length");
        if (this.writeBuffers.length) {
            this.writeBuffers.push(buf);
            this.writeBufferOffsets.push(offset);
            this.writeBufferLengths.push(length);
            assert(this.selectMode === N.READWRITE, "select mode must be readwrite");
        } else {
            this._writeBuffer(buf, offset, length);
        }
    }

    read(buf: IDataBuffer, offset: number, length: number): number {
        assert(this.sock !== -1, "Noone should call read if the socket is closed");
        if (this.hasStash()) {
            const ret = this.unstash(buf, offset, length);
            if (ret !== -1) {
                return ret;
            }
        }

        const read = N.read(this.sock, buf, offset, length);
        switch (read) {
        case 0:
            N.close(this.sock);
            this.sock = -1;
            this.emit("close");
            break;
        case -1:
            if (N.errno !== N.EWOULDBLOCK)
                this._error(new NetworkError(NetworkErrorCode.SocketReadError, `read error, errno: ${N.errno} ${N.strerror()}`));
            return -1; //
        default:
            if (!this.firstByteRead)
                this.firstByteRead = this.platform.mono();
            break;
        }
        assert(read >= 0, "Should not be negative");
        this.bytesRead += read;
        return read;
    }

    close(): void {
        assert(this.sock !== -1, "must have socket");
        N.close(this.sock); // ### error checking?
        this.sock = -1;
        this.emit("close");
    }

    // this logic is mostly duplicated from _write.
    // Since this is the core of the whole networking operation I
    // think it's worth optimizing for both cases.
    private _writeBuffer(buf: Uint8Array | ArrayBuffer | IDataBuffer, off: number, len: number): void {
        assert(!this.writeBuffers.length, "This function shouldn't be called if you have writeBuffers");
        assert(len > 0, "Nothing to write");
        while (len) {
            assert(len > 0, "Nothing to write");
            const written = N.write(this.sock, buf, off, len);
            this.platform.trace("wrote", written, "of", len, "for", this.sock);
            if (written > 0) {
                if (!this.firstByteWritten)
                    this.firstByteWritten = this.platform.mono();
                this.bytesWritten += written;
                off += written;
                len -= written;
            } else if (N.errno === N.EWOULDBLOCK) {
                break;
            } else {
                this._error(new NetworkError(NetworkErrorCode.SocketWriteError,
                                             `write error, errno: ${N.errno} ${N.strerror()}`));
                return;
            }
        }
        let mode = N.READ;
        if (len) {
            this.writeBuffers.push(buf);
            this.writeBufferOffsets.push(off);
            this.writeBufferLengths.push(len);
            mode = N.READWRITE;
        }
        if (mode !== this.selectMode) {
            this.selectMode = mode;
            N.setFD(this.sock, mode, this._onSelect.bind(this));
            assert(!(mode & N.WRITE) || this.writeBuffers.length, "Should have write buffers now");
        }
    }

    private _onSelect(sock: number, mode: number): void {
        this.platform.trace(`NrdpTCPNetworkPipe(${this.id}._onSelect(${sock}, ${mode}`);
        if (mode & N.READ) {
            this.emit("data");
        }

        if (mode & N.WRITE) {
            assert(this.writeBuffers.length, "Should have write buffers " + this.sock);
            assert(this.writeBuffers.length === this.writeBufferOffsets.length,
                   `writeBuffers and writeBufferOffsets should have the same length ${this.writeBuffers.length} vs ${this.writeBufferOffsets}.length`);
            assert(this.writeBuffers.length === this.writeBufferLengths.length,
                   `writeBuffers and writeBufferLengths have the same length ${this.writeBuffers.length} vs ${this.writeBufferLengths}.length`);
            while (this.writeBuffers.length) {
                assert(this.writeBufferLengths[0] > 0, "Nothing to write");
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
                    this._error(new NetworkError(NetworkErrorCode.SocketWriteError, `write error, errno: ${N.errno} ${N.strerror()}`));
                    return;
                }
            }
            const newMode = this.writeBuffers.length ? N.READWRITE : N.READ;
            if (newMode !== this.selectMode) {
                this.selectMode = newMode;
                N.setFD(this.sock, newMode, this._onSelect.bind(this));
                assert(!(newMode & N.WRITE) || this.writeBuffers.length, "Should have write buffers now");
            }
        }
    }

    private _error(error: INetworkError): void {
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
            let ipAddress = options.ipAddresses ? options.ipAddresses[0] : options.hostname;
            if (typeof options.port !== "undefined")
                ipAddress += ":" + options.port;

            if (options.ipVersion !== 4 && options.ipVersion !== 6) {
                reject(new NetworkError(NetworkErrorCode.InvalidIpVersion,
                                        "Invalid ip version in options"));
            }

            let sockAddr: N.Sockaddr;
            try {
                sockAddr = new N.Sockaddr(ipAddress);
                if (sockAddr.ipVersion !== options.ipVersion) {
                    reject(new NetworkError(NetworkErrorCode.InvalidIpVersion,
                                            "Invalid ip version in ip address"));
                }
                dnsType = options.ipAddresses ? "preresolved" : "literal";
                innerResolve(sockAddr);
            } catch (err) {
                dnsStartTime = platform.mono();
                nrdp.dns.lookupHost(options.hostname, options.ipVersion,
                                    options.dnsTimeout, (dnsResult: IDnsResult) => {
                                        // platform.log("got dns result", dnsResult);
                                        if (!dnsResult.addresses.length) {
                                            const str = `Failed to lookup host ${options.hostname} ${options.ipVersion}: ${dnsResult.error}`;
                                            reject(new NetworkError(NetworkErrorCode.DnsError, str));
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
                assert(sockAddr.ipAddress, "Gotta have an ip address at this point");
                assert(dnsType, "Must have dns here");
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
                const ret = N.connect(sock, sockAddr, options.hostname);
                if (!ret) {
                    connected();
                } else if (N.errno !== N.EINPROGRESS) {
                    throw new Error("Failed to connect " + N.errno + " " + N.strerror());
                } else {
                    const connectTimeoutId = setTimeout(() => {
                        N.clearFD(sock);
                        N.close(sock);
                        sock = -1;
                        reject(new NetworkError(NetworkErrorCode.ConnectTimeout,
                                                "Timed out connecting to host " + options.hostname));
                    }, options.connectTimeout);
                    /* tslint:disable:no-shadowed-variable */
                    N.setFD(sock, N.WRITE, (sock: number, mode: number) => {
                        const ret = N.getsockopt(sock, N.SOL_SOCKET, N.SO_ERROR, platform.scratch);
                        if (ret === -1) {
                            reject(new NetworkError(NetworkErrorCode.ConnectFailure,
                                                    `Failed to connect to host ${options.hostname}:${options.port} errno: ${N.errno}`));
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
                            reject(new NetworkError(NetworkErrorCode.ConnectFailure,
                                                    `Failed to connect to host ${options.hostname}:${options.port} errno: ${N.errno}`));
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
