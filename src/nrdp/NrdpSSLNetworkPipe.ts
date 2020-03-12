import {
    CreateSSLNetworkPipeOptions, NetworkPipe,
    OnClose, OnData, OnError, IDataBuffer
} from "../types";
import { NrdpPlatform } from "./Platform";
import N = nrdsocket;

let platform: NrdpPlatform | undefined;
function assert(condition: any, msg?: string): asserts condition {
    if (!condition && platform) {
        platform.assert(condition, msg);
    }
}

function set_mem_eof_return(platform: NrdpPlatform, bio: N.Struct) {
    platform.BIO_ctrl(bio, platform.BIO_C_SET_BUF_MEM_EOF_RETURN, -1, undefined);
}

class NrdpSSLNetworkPipe implements NetworkPipe {
    private ssl: N.Struct;
    private ssl_ctx: N.Struct;
    // private bio: N.BIO;
    private inputBio: N.Struct;
    private outputBio: N.Struct;
    private pipe: NetworkPipe;
    private connected: boolean;
    private writeBuffers: (Uint8Array | ArrayBuffer | string | IDataBuffer)[];
    private writeBufferOffsets: number[];
    private writeBufferLengths: number[];
    private connectedCallback?: (error?: Error) => void;
    private platform: NrdpPlatform;
    private buffer?: IDataBuffer;

    public firstByteRead?: number;
    public firstByteWritten?: number;

    constructor(options: CreateSSLNetworkPipeOptions, p: NrdpPlatform, callback: (error?: Error) => void) {
        platform = p;
        this.platform = p;
        this.connectedCallback = callback;
        this.connected = false;
        this.writeBuffers = [];
        this.writeBufferOffsets = [];
        this.writeBufferLengths = [];

        this.pipe = options.pipe;
        const meth = this.platform.TLS_client_method();
        this.ssl_ctx = this.platform.SSL_CTX_new(meth);
        this.ssl_ctx.free = "SSL_CTX_free";
        const cb = N.setSSLCallback("SSL_verify_cb", (preverify_ok: number, x509_ctx: N.Struct) => {
            this.platform.log("got verify", preverify_ok);
            return preverify_ok;
        });
        this.platform.SSL_CTX_set_verify(this.ssl_ctx, this.platform.SSL_VERIFY_PEER, cb);
        this.platform.trace("cipher", nrdp.cipherList);
        this.platform.SSL_CTX_set_cipher_list(this.ssl_ctx, nrdp.cipherList);
        let ret = this.platform.SSL_CTX_ctrl(this.ssl_ctx, this.platform.SSL_CTRL_MODE,
                                             this.platform.SSL_MODE_RELEASE_BUFFERS,//|this.platform.SSL_MODE_AUTO_RETRY,
                                             undefined);
        const ctx_options = (this.platform.SSL_OP_ALL |
                             this.platform.SSL_OP_NO_TLSv1 |
                             this.platform.SSL_OP_NO_SSLv2 |
                             this.platform.SSL_OP_NO_SSLv3 |
                             this.platform.SSL_OP_CIPHER_SERVER_PREFERENCE);

        ret = this.platform.SSL_CTX_set_options(this.ssl_ctx, ctx_options);
        this.platform.trace("BALLS 2", ret);

        const cert_store = this.platform.SSL_CTX_get_cert_store(this.ssl_ctx);
        this.platform.trustStore().forEach((x509: N.Struct) => {
            this.platform.X509_STORE_add_cert(cert_store, x509);
        });
        const param = this.platform.X509_VERIFY_PARAM_new();
        this.platform.X509_VERIFY_PARAM_set_time(param, Math.round(nrdp.now() / 1000));
        this.platform.SSL_CTX_set1_param(this.ssl_ctx, param);
        this.platform.X509_VERIFY_PARAM_free(param);

        this.ssl = this.platform.SSL_new(this.ssl_ctx);
        this.platform.SSL_set_default_read_buffer_len(this.ssl, 16384);
        this.platform.SSL_set_read_ahead(this.ssl, 1);
        this.ssl.free = "SSL_free";

        const memMethod = this.platform.BIO_s_mem();
        this.inputBio = this.platform.BIO_new(memMethod);
        set_mem_eof_return(this.platform, this.inputBio);

        this.outputBio = this.platform.BIO_new(memMethod);

        set_mem_eof_return(this.platform, this.outputBio);
        this.pipe.ondata = () => {
            const read = this.pipe.read(this.platform.scratch, 0, this.platform.scratch.byteLength);
            if (read === -1) {
                assert(N.errno === N.EWOULDBLOCK || N.errno === N.EAGAIN || this.pipe.closed, "Should be closed already");
                return;
            }

            if (read === 0) {
                assert(this.pipe.closed, "Should be closed already");
                return;
            }
            this.platform.trace("got data", read);
            // throw new Error("fiskball");
            const written = this.platform.BIO_write(this.inputBio, this.platform.scratch, 0, read);
            this.platform.trace("wrote", read, "bytes to inputBio =>", written);
            if (!this.connected) {
                this._connect();
            }
            if (this.connected) {
                const pending = this.platform.BIO_ctrl_pending(this.inputBio);
                if (pending && this.ondata) {
                    this.ondata();
                }
            }
        };
        this.pipe.onclose = () => {
            if (this.onclose)
                this.onclose();
        };
        this.pipe.onerror = (code: number, message?: string) => {
            this.platform.error("got error", code, message || "");
            this._error
        };

        this.platform.SSL_set_bio(this.ssl, this.inputBio, this.outputBio);
        this._connect();
    }

    get ipAddress() { return this.pipe.ipAddress; }
    get dns() { return this.pipe.dns; }
    get dnsChannel() { return this.pipe.dnsChannel; }
    get closed() { return this.pipe.closed; }

    write(buf: IDataBuffer | string, offset?: number, length?: number): void {
        if (typeof buf === 'string') {
            length = buf.length;
        } else if (length === undefined) {
            length = buf.byteLength;
        }
        offset = offset || 0;

        if (!length)
            throw new Error("0 length write");

        this.platform.trace("write called", buf, offset, length);

        if (!this.connected) {
            throw new Error("SSLNetworkPipe is not connected");
        }

        const written = this.writeBuffers.length ? -1 : this.platform.SSL_write(this.ssl, buf, offset, length);
        this.platform.trace("wrote to output bio", length, "=>", written);

        if (written === -1) {
            this.writeBuffers.push(buf);
            this.writeBufferOffsets.push(offset || 0);
            this.writeBufferLengths.push(length);
        } else {
            this._flushOutputBio();
        }
    }

    read(buf: IDataBuffer, offset: number, length: number): number {
        let bufferRead = 0;
        if (this.buffer) {
            const byteLength = this.buffer.byteLength;
            if (length >= byteLength) {
                this.platform.bufferSet(buf, offset, this.buffer, 0, byteLength);
                this.buffer = undefined;
                return byteLength;
                bufferRead = byteLength;
            } else {
                this.platform.bufferSet(buf, offset, this.buffer, 0, length);
                this.buffer = this.buffer.slice(length);
                return length;
            }
        }

        this.platform.trace("someone's calling read", length, this.platform.SSL_pending(this.ssl));
        const read = this.platform.SSL_read(this.ssl, buf, offset, length);
        if (read <= 0) {
            const err = this.platform.SSL_get_error(this.ssl, read);
            // this.platform.error("got err", err);
            this._flushOutputBio();
            switch (err) {
            case this.platform.SSL_ERROR_NONE:
                this.platform.error("got error none");
                break;
            case this.platform.SSL_ERROR_SSL:
                this.platform.error("got error ssl");
                break;
            case this.platform.SSL_ERROR_WANT_READ:
                this.platform.trace("got error want read");
                break;
            case this.platform.SSL_ERROR_WANT_WRITE:
                this.platform.trace("got error want write");
                break;
            case this.platform.SSL_ERROR_WANT_X509_LOOKUP:
                this.platform.error("got error want x509 lookup");
                break;
            case this.platform.SSL_ERROR_SYSCALL:
                this.platform.error("got error syscall");
                break;
            case this.platform.SSL_ERROR_ZERO_RETURN:
                this.close();
                this.platform.trace("got error zero return");
                break;
            case this.platform.SSL_ERROR_WANT_CONNECT:
                this.platform.error("got error want connect");
                break;
            case this.platform.SSL_ERROR_WANT_ACCEPT:
                this.platform.error("got error want accept");
                break;
            case this.platform.SSL_ERROR_WANT_ASYNC:
                this.platform.error("got error want async");
                break;
            case this.platform.SSL_ERROR_WANT_ASYNC_JOB:
                this.platform.error("got error want async job");
                break;
            case this.platform.SSL_ERROR_WANT_CLIENT_HELLO_CB:
                this.platform.error("got error want client hello cb");
                break;
            default:
                this.platform.error("got error other", err);
                break;
            }
        }

        // this.platform.trace("SSL_read called", read);
        return read + bufferRead;
    }

    unread(buf: ArrayBuffer | Uint8Array | IDataBuffer): void {
        if (this.buffer) {
            this.buffer.bufferLength = this.buffer.byteLength + buf.byteLength;
            this.buffer.set(0, buf);
        } else if (buf instanceof DataBuffer) {
            this.buffer = buf;
        } else {
            this.buffer = new DataBuffer(buf);
        }
        if (this.ondata)
            this.ondata();
    }

    close(): void {
        this.pipe.close();
    }

    private _flushOutputBio() {
        const pending = this.platform.BIO_ctrl_pending(this.outputBio);
        // assert(pending <= this.scratch.byteLength, "Pending too large. Probably have to increase scratch buffer size");
        if (pending > 0) {
            // should maybe pool these arraybuffers
            const buf = new ArrayBuffer(pending);
            let read = this.platform.BIO_read(this.outputBio, buf, 0, pending);
            assert(read === pending, "Read should be pending");
            // this.platform.trace("writing", read, this.platform.BIO_ctrl_pending(this.outputBio));
            this.pipe.write(buf, 0, read);
            // Platform
        }
    }

    private _connect() {
        assert(this.connectedCallback);
        let ret = this.platform.SSL_connect(this.ssl);
        // this.platform.trace("CALLED CONNECT", ret);
        if (ret <= 0) {
            const err = this.platform.SSL_get_error(this.ssl, ret);
            // this.platform.trace("GOT ERROR FROM SSL_CONNECT", err);
            if (this.platform.SSL_get_error(this.ssl, ret) == this.platform.SSL_ERROR_WANT_READ) {
                this._flushOutputBio();
            } else {
                this.platform.error("BIG FAILURE", this.platform.SSL_get_error(this.ssl, ret), N.errno);
                this.connectedCallback(new Error(`SSL_connect failure ${this.platform.SSL_get_error(this.ssl, ret)} ${N.errno}`));
                this.connectedCallback = undefined;
            }
        } else {
            // this.platform.trace("sheeeet", ret);
            assert(ret === 1, "This should be 1");
            // this.platform.trace("we're connected");
            this.connected = true;
            this.firstByteWritten = this.pipe.firstByteWritten;
            this.firstByteRead = this.pipe.firstByteRead;
            assert(this.connectedCallback);
            this.connectedCallback();
            this.connectedCallback = undefined;
        }
    }

    private _error(code: number, message: string): void {
        // ### have to shut down all sorts of ssl stuff
        if (this.onerror)
            this.onerror(code, message);
    }

    ondata?: OnData;
    onclose?: OnClose;
    onerror?: OnError;
};


export default function createSSLNetworkPipe(options: CreateSSLNetworkPipeOptions, platform: NrdpPlatform): Promise<NetworkPipe> {
    return new Promise<NetworkPipe>((resolve, reject) => {
        const sslPipe = new NrdpSSLNetworkPipe(options, platform, (error?: Error) => {
            // platform.trace("connected or something", error);
            if (error) {
                reject(error);
            } else {
                resolve(sslPipe);
            }
        });
    });
};
