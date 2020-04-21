import DataBuffer from "../DataBuffer";
import IConnectionDataSSL from "../IConnectionDataSSL";
import ICreateSSLNetworkPipeOptions from "../ICreateSSLNetworkPipeOptions";
import IDataBuffer from "../IDataBuffer";
import INetworkError from "../INetworkError";
import IPipeResult from "../IPipeResult";
import N = nrdsocket;
import NetworkError from "../NetworkError";
import NetworkPipe from "../NetworkPipe";
import assert from '../utils/assert.macro';
import { NetworkErrorCode } from "../types";
import { NrdpPlatform } from "./Platform";
import { X509Data } from "./NrdpSSL";

interface SSLVerifyErrorMessage {
    traceArea: string;
    type: string;
    tags: { [key: string]: any };
};

class NrdpSSLNetworkPipe extends NetworkPipe {
    private sslInstance: N.Struct;
    private trustStoreHash: string;
    private inputBio: N.Struct;
    private outputBio: N.Struct;
    private pipe: NetworkPipe;
    private connected: boolean;
    private connectedCallback?: (error?: INetworkError, connData?: IConnectionDataSSL) => void;
    private connectStartTime: number;

    constructor(platform: NrdpPlatform, options: ICreateSSLNetworkPipeOptions,
                callback: (error?: INetworkError, connData?: IConnectionDataSSL) => void) {
        super(platform);

        this.connectedCallback = callback;
        this.connected = false;
        this.bytesRead = this.bytesWritten = 0;

        this.pipe = options.pipe;
        const memMethod = platform.ssl.g.BIO_s_mem();
        assert(memMethod, "gotta have memMethod");
        this.trustStoreHash = nrdp.trustStoreHash;
        this.sslInstance = platform.ssl.createSSL(options, (preverifyOk: number, x509StoreContext: N.Struct) => {
            // platform.log("got preverifyOk", preverifyOk);
            if (preverifyOk !== 1) {
                const chain = [];
                const message: SSLVerifyErrorMessage = {
                    traceArea: "RESOURCEMANAGER",
                    type: "certstatuserror",
                    tags: {
                        nwerr: "untrustedcert",
                        ipAddress: this.pipe.ipAddress,
                        truststorehash: this.trustStoreHash
                    },
                };

                const xChain = platform.ssl.g.X509_STORE_CTX_get0_chain(x509StoreContext);
                if (xChain) {
                    const b = platform.ssl.g.BIO_new(memMethod);
                    if (b) {
                        const num = platform.ssl.g.OPENSSL_sk_num(xChain);

                        for (let i = 0; i < num; ++i) {
                            const x509 = platform.ssl.g.OPENSSL_sk_value(xChain, i);
                            if (x509) {
                                const x509Data = platform.ssl.x509Data(x509, b, platform.scratch);
                                chain.push(x509Data);
                                if (!i) {
                                    Object.assign(message.tags, x509Data);
                                    const err: number = platform.ssl.g.X509_STORE_CTX_get_error(x509StoreContext);
                                    const errorString = platform.ssl.g.X509_verify_cert_error_string(err);
                                    message.tags.errreason = `${errorString.stringify()} code: ${err}`;
                                    errorString.release();
                                }
                            }
                        }
                        b.release();
                    }
                    xChain.release();
                }
                message.tags.chain = JSON.stringify(chain);
                nrdp.l.error(message);

                if (!nrdp.options.ssl_peer_verification) {
                    preverifyOk = 1;
                }
            }
            return preverifyOk;
        });

        let bio = platform.ssl.g.BIO_new(memMethod);
        assert(bio, "gotta have inputBio");
        this.inputBio = bio;
        platform.ssl.g.BIO_ctrl(this.inputBio, platform.ssl.g.BIO_C_SET_BUF_MEM_EOF_RETURN, -1, undefined);

        bio = platform.ssl.g.BIO_new(memMethod);
        assert(bio, "gotta have outputBio");
        this.outputBio = bio;

        platform.ssl.g.BIO_ctrl(this.outputBio, platform.ssl.g.BIO_C_SET_BUF_MEM_EOF_RETURN, -1, undefined);
        this.pipe.on("data", this._onData.bind(this));
        this.pipe.on("close", this.emit.bind(this, "close"));
        this.pipe.on("error", this._error.bind(this));

        platform.ssl.g.SSL_set_bio(this.sslInstance, this.inputBio, this.outputBio);
        this.connectStartTime = this.platform.mono();
        this._connect();
    }

    get ipAddress() { return this.pipe.ipAddress; }
    get closed() { return this.pipe.closed; }
    get hostname() { return this.pipe.hostname; }
    get port() { return this.pipe.port; }
    get ssl() { return true; }
    get socket() { return this.pipe.socket; }
    get firstByteRead() { return this.pipe.firstByteRead; }
    get firstByteWritten() { return this.pipe.firstByteWritten; }

    public bytesRead: number;
    public bytesWritten: number;

    clearStats() {
        this.bytesRead = this.bytesWritten = 0;
        this.pipe.clearStats();
    }

    removeEventHandlers() {
        this.removeAllListeners();
    }

    write(buf: IDataBuffer | string, offset?: number, length?: number): void {
        const platform: NrdpPlatform = this.platform as NrdpPlatform;

        if (typeof buf === 'string') {
            buf = new DataBuffer(buf);
            length = buf.byteLength;
        } else if (length === undefined) {
            length = buf.byteLength;
        }
        offset = offset || 0;

        if (!length)
            throw new Error("0 length write");

        platform.trace("write called", buf, offset, length);

        if (!this.connected) {
            throw new Error("SSLNetworkPipe is not connected");
        }

        do {
            const written = platform.ssl.g.SSL_write(this.sslInstance, buf, offset, length);
            platform.trace("wrote to output bio", length, "=>", written);
            assert(written > 0, "If this happens we gotta write some code for it");

            this.bytesWritten += written;
            this._flushOutputBio();
            assert(written <= length, "Can't write more than we have");
            offset += written;
            length -= written;
        } while (length > 0);
    }

    read(buf: IDataBuffer, offset: number, length: number): number {
        if (this.hasStash()) {
            const ret = this.unstash(buf, offset, length);
            if (ret !== -1) {
                return ret;
            }
        }

        const platform: NrdpPlatform = this.platform as NrdpPlatform;
        platform.trace("someone's calling read on ", this.pipe.socket, length,
                       platform.ssl.g.SSL_pending(this.sslInstance));
        const read = platform.ssl.g.SSL_read(this.sslInstance, buf, offset, length);
        if (read <= 0) {
            const err = platform.ssl.g.SSL_get_error(this.sslInstance, read);
            // platform.error("got err", err);
            this._flushOutputBio();
            switch (err) {
            case platform.ssl.g.SSL_ERROR_NONE:
                platform.error("got error none");
                break;
            case platform.ssl.g.SSL_ERROR_SSL:
                platform.error("got error ssl");
                break;
            case platform.ssl.g.SSL_ERROR_WANT_READ:
                platform.trace("got error want read");
                break;
            case platform.ssl.g.SSL_ERROR_WANT_WRITE:
                platform.trace("got error want write");
                break;
            case platform.ssl.g.SSL_ERROR_WANT_X509_LOOKUP:
                platform.error("got error want x509 lookup");
                break;
            case platform.ssl.g.SSL_ERROR_SYSCALL:
                platform.error("got error syscall");
                break;
            case platform.ssl.g.SSL_ERROR_ZERO_RETURN:
                // this shouldn't really close the tcp socket
                this.close();
                platform.trace("got error zero return");
                break;
            case platform.ssl.g.SSL_ERROR_WANT_CONNECT:
                platform.error("got error want connect");
                break;
            case platform.ssl.g.SSL_ERROR_WANT_ACCEPT:
                platform.error("got error want accept");
                break;
            case platform.ssl.g.SSL_ERROR_WANT_ASYNC:
                platform.error("got error want async");
                break;
            case platform.ssl.g.SSL_ERROR_WANT_ASYNC_JOB:
                platform.error("got error want async job");
                break;
            case platform.ssl.g.SSL_ERROR_WANT_CLIENT_HELLO_CB:
                platform.error("got error want client hello cb");
                break;
            default:
                platform.error("got error other", err);
                break;
            }
        } else {
            this.bytesRead += read;
        }


        // platform.trace("SSL_read called", read);
        return read;
    }

    close(): void {
        this.pipe.close();
    }

    private _flushOutputBio() {
        const platform: NrdpPlatform = this.platform as NrdpPlatform;
        const pending = platform.ssl.g.BIO_ctrl_pending(this.outputBio);
        // assert(pending <= this.scratch.byteLength,
        //        "Pending too large. Probably have to increase scratch buffer size");
        if (pending > 0) {
            // should maybe pool these arraybuffers
            const buf = new ArrayBuffer(pending);
            const read = platform.ssl.g.BIO_read(this.outputBio, buf, 0, pending);
            assert(read === pending, "Read should be pending");
            // this.platform.trace("writing", read, platform.ssl.g.BIO_ctrl_pending(this.outputBio));
            this.pipe.write(buf, 0, read);
            // this.platform
        }
    }

    private _connect() {
        const platform: NrdpPlatform = this.platform as NrdpPlatform;

        // ### connectedCallback?
        assert(this.connectedCallback, "must have connectedCallback");
        const ret = platform.ssl.g.SSL_connect(this.sslInstance);
        // platform.trace("CALLED CONNECT", ret);
        if (ret <= 0) {
            // this.platform.trace("GOT ERROR FROM SSL_CONNECT", err);
            if (platform.ssl.g.SSL_get_error(this.sslInstance, ret) === platform.ssl.g.SSL_ERROR_WANT_READ) {
                this._flushOutputBio();
            } else {
                this.platform.error("BIG FAILURE", platform.ssl.g.SSL_get_error(this.sslInstance, ret), N.errno);
                this.connectedCallback(new NetworkError(NetworkErrorCode.SSLConnectFailure, `SSL_connect failure ${platform.ssl.g.SSL_get_error(this.sslInstance, ret)} ${N.errno}`));
                this.connectedCallback = undefined;
            }
        } else {
            // this.platform.trace("sheeeet", ret);
            assert(ret === 1, "This should be 1");
            // this.platform.trace("we're connected");
            this.connected = true;
            const version = platform.ssl.g.SSL_get_version(this.sslInstance);
            const data = {
                sslHandshakeTime: this.platform.mono() - this.connectStartTime,
                sslVersion: version ? version.stringify() : "",
                sslSessionResumed: platform.ssl.g.SSL_session_reused(this.sslInstance) !== 0
            } as IConnectionDataSSL;
            this.connectedCallback(undefined, data);
            this.connectedCallback = undefined;
        }
    }

    private _onData() {
        const platform = this.platform as NrdpPlatform;
        while (!this.pipe.closed) {
            const read = this.pipe.read(platform.scratch, 0, platform.scratch.byteLength);
            // platform.log("read return", read, this.pipe.socket);
            if (read === -1) {
                assert(
                    N.errno === N.EWOULDBLOCK || N.errno === N.EAGAIN || this.pipe.closed,
                    "Should be closed already");
                return;
            }

            if (read === 0) {
                assert(this.pipe.closed, "Should be closed already");
                return;
            }
            platform.trace("got data", read);
            const written = platform.ssl.g.BIO_write(this.inputBio, platform.scratch, 0, read);
            platform.trace("wrote", read, "bytes to inputBio =>", written);
            if (!this.connected && this.connectedCallback) {
                this._connect();
            }
            if (this.connected) {
                const pending = platform.ssl.g.BIO_ctrl_pending(this.inputBio);
                if (pending) {
                    this.emit("data");
                }
            }
        }
    }

    private _error(error: INetworkError): void {
        // ### have to shut down all sorts of ssl stuff
        this.emit("error", error);
    }
};

export default function createSSLNetworkPipe(platform: NrdpPlatform,
                                             options: ICreateSSLNetworkPipeOptions): Promise<IPipeResult> {
    return new Promise<IPipeResult>((resolve, reject) => {
        const cb = (error?: INetworkError, connData?: IConnectionDataSSL) => {
            // platform.trace("connected or something", error);
            if (error) {
                reject(error);
            } else {
                if (connData) {
                    assert(typeof connData.sslHandshakeTime !== "undefined", "must have ssl hand shake time");
                    assert(connData.sslVersion, "must have ssl version");
                    assert(typeof connData.sslSessionResumed !== "undefined", "must have ssl session resumedness");
                    options.sslHandshakeTime = connData.sslHandshakeTime;
                    options.sslVersion = connData.sslVersion;
                    options.sslSessionResumed = connData.sslSessionResumed;
                }
                options.pipe = pipe;
                resolve(options);
            }
        };

        const pipe = new NrdpSSLNetworkPipe(platform, options, cb);
    });
}
