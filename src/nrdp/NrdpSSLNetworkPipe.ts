import { NetworkPipe, OnData, OnClose, OnError, DnsResult, CreateSSLNetworkPipeOptions } from "../types";
import { NrdpPlatform } from "./NrdpPlatform";
import N from "./ScriptSocket";
import nrdp from "./nrdp";

let platform: NrdpPlatform | undefined;
function assert(condition: any, msg?: string): asserts condition
{
    if (!condition && platform) {
        platform.assert(condition, msg);
    }
}

function set_mem_eof_return(platform: NrdpPlatform, bio: N.Struct) {
    platform.BIO_ctrl(bio, platform.BIO_C_SET_BUF_MEM_EOF_RETURN, -1, undefined);
}

class NrdpSSLNetworkPipe implements NetworkPipe
{
    private ssl: N.Struct;
    private ssl_ctx: N.Struct;
    // private bio: N.BIO;
    private inputBio: N.Struct;
    private outputBio: N.Struct;
    private pipe: NetworkPipe;
    private connected: boolean;
    private writeBuffers: (Uint8Array|ArrayBuffer|string)[];
    private writeBufferOffsets: number[];
    private writeBufferLengths: number[];
    private connectedCallback?: (error?: Error) => void;
    private platform: NrdpPlatform;

    constructor(options: CreateSSLNetworkPipeOptions, p: NrdpPlatform, callback: (error?: Error) => void)
    {
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
        let ret = this.platform.SSL_CTX_ctrl(this.ssl_ctx, this.platform.SSL_CTRL_MODE,
                                             this.platform.SSL_MODE_RELEASE_BUFFERS,//|this.platform.SSL_MODE_AUTO_RETRY,
                                             undefined);
        this.platform.log("BALLS", ret);
        /* SSL_SET_OPTION(0); */
        let ctx_options = this.platform.SSL_OP_NO_SSLv3;
        ret = this.platform.SSL_CTX_set_options(this.ssl_ctx, ctx_options);
        this.platform.log("BALLS 2", ret);

        const cert_store = this.platform.SSL_CTX_get_cert_store(this.ssl_ctx);
        const shit = this.platform.trustStore();
        this.platform.log("BALLS3", typeof shit);
        this.platform.trustStore().forEach((x509: N.Struct) => {
            // this.platform.X509_STORE_add_cert(cert_store, x509);
        });
        const param = this.platform.X509_VERIFY_PARAM_new();
        this.platform.X509_VERIFY_PARAM_set_time(param, Math.round(nrdp.now() / 1000));
        this.platform.SSL_CTX_set1_param(this.ssl_ctx, param);
        this.platform.X509_VERIFY_PARAM_free(param);

        this.ssl = this.platform.SSL_new(this.ssl_ctx);
        this.platform.SSL_set_default_read_buffer_len(this.ssl, 16384);
        this.platform.SSL_up_ref(this.ssl);
        this.platform.SSL_set_read_ahead(this.ssl, 1);
        // if (0) {
            // this.inputBio = this.platform.BIO_new_socket(sock, this.platform.BIO_NOCLOSE);
            // this.inputBio.free = "BIO_free";
            // // this.platform.BIO_set_read_buffer_size(this.bio, 16384);
            // 	this.platform.log("ball", this.platform.BIO_int_ctrl(this.bio, this.platform.BIO_C_SET_BUFF_SIZE, 16384, 0));

        const memMethod = this.platform.BIO_s_mem();
        this.inputBio = this.platform.BIO_new(memMethod);
        set_mem_eof_return(this.platform, this.inputBio);

        this.inputBio.free = "BIO_free";

        this.outputBio = this.platform.BIO_new(memMethod);
        set_mem_eof_return(this.platform, this.outputBio);
        this.outputBio.free = "BIO_free";
        this.pipe.ondata = () => {
            const read = this.pipe.read(this.platform.scratch, 0, this.platform.scratch.byteLength);
            this.platform.log("FAEN", read);
            if (!read) {
                assert(this.pipe.closed, "Should be closed already");
                return;
            }
            this.platform.log("got data", read);
            assert(read > 0, "This should be > 0");
            // throw new Error("fiskball");
            const written = this.platform.BIO_write(this.inputBio, this.platform.scratch, 0, read);
            this.platform.log("wrote", read, "bytes to inputBio =>", written);
            if (!this.connected) {
                this._connect();
            } else {
                const pending = this.platform.BIO_ctrl_pending(this.inputBio);
                if (pending && this.ondata) {
                    this.ondata();
                }
            }
        };
        this.pipe.onclose = () => {
            this.platform.log("got close", this.platform.stacktrace());
        };
        this.pipe.onerror = (code: number, message?: string) => {
            this.platform.error("got error", code, message || "");
        };

        this.platform.SSL_set_bio(this.ssl, this.inputBio, this.outputBio);
        this._connect();
    }

    get closed() { return this.pipe.closed; }

    write(buf: Uint8Array | ArrayBuffer | string, offset?: number, length?: number): void
    {
        if (typeof buf === 'string') {
            length = buf.length;
        } else if (length === undefined) {
            length = buf.byteLength;
        }
        offset = offset || 0;

        if (!length)
            throw new Error("0 length write");

        this.platform.log("write called", buf, offset, length);

        if (!this.connected) {
            throw new Error("SSLNetworkPipe is not connected");
        }

        const written = this.writeBuffers.length ? -1 : this.platform.SSL_write(this.ssl, buf, offset, length);
        this.platform.log("wrote to output bio", length, "=>", written);

        if (written === -1) {
            this.writeBuffers.push(buf);
            this.writeBufferOffsets.push(offset || 0);
            this.writeBufferLengths.push(length);
        } else {
            this._flushOutputBio();
        }
    }

    read(buf: Uint8Array | ArrayBuffer, offset: number, length: number): number
    {
        let retry = false;
        let read;
        do {
            retry = false;
            this.platform.log("someone's calling read", length, this.platform.SSL_pending(this.ssl));
            read = this.platform.SSL_read(this.ssl, buf, offset, length);
            if (read <= 0) {
                const err = this.platform.SSL_get_error(this.ssl, read);
                this._flushOutputBio();
                switch (err) {
                    case this.platform.SSL_ERROR_NONE:
                        this.platform.error("got error none");
                        break;
                    case this.platform.SSL_ERROR_SSL:
                        this.platform.error("got error ssl");
                        break;
                    case this.platform.SSL_ERROR_WANT_READ:
                        if (this.platform.BIO_ctrl_pending(this.inputBio))
                            retry = true;
                        this.platform.error("got error want read");
                        break;
                    case this.platform.SSL_ERROR_WANT_WRITE:
                        this.platform.error("got error want write");
                        break;
                    case this.platform.SSL_ERROR_WANT_X509_LOOKUP:
                        this.platform.error("got error want x509 lookup");
                        break;
                    case this.platform.SSL_ERROR_SYSCALL:
                        this.platform.error("got error syscall");
                        break;
                    case this.platform.SSL_ERROR_ZERO_RETURN:
                        this.platform.error("got error zero return");
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
        } while (retry);

        this.platform.log("SSL_read called", read);
        return read;
        // if (read != -1) {

        // }
        // let read = SSL_
        // return -1;
    }

    close(): void
    {

    }

    private _flushOutputBio()
    {
        const pending = this.platform.BIO_ctrl_pending(this.outputBio);
        // assert(pending <= this.scratch.byteLength, "Pending too large. Probably have to increase scratch buffer size");
        if (pending > 0) {
            // should maybe pool these arraybuffers
            const buf = new ArrayBuffer(pending);
            let read = this.platform.BIO_read(this.outputBio, buf, 0, pending);
            assert(read === pending, "Read should be pending");
            // this.platform.log("writing", read, this.platform.BIO_ctrl_pending(this.outputBio));
            this.pipe.write(buf, 0, read);
            // Platform
        }
    }

    private _connect()
    {
        assert(this.connectedCallback);
        let ret = this.platform.SSL_connect(this.ssl);
        this.platform.log("CALLED CONNECT", ret);
        if (ret <= 0) {
            this.platform.log("GOT ERROR FROM SSL_CONNECT", this.platform.SSL_get_error(this.ssl, ret),
                              this.platform.ERR_error_string(this.platform.SSL_get_error(this.ssl, ret)));
            if (this.platform.SSL_get_error(this.ssl, ret) == this.platform.SSL_ERROR_WANT_READ) {
                this._flushOutputBio();
            } else {
                this.platform.log("BIG FAILURE", this.platform.SSL_get_error(this.ssl, ret), N.errno);
                this.connectedCallback(new Error(`SSL_connect failure ${this.platform.SSL_get_error(this.ssl, ret)} ${N.errno}`));
                this.connectedCallback = undefined;
            }
        } else {
            this.platform.log("sheeeet", ret);
            assert(ret === 1, "This should be 1");
            this.platform.log("we're connected");
            this.connected = true;
            assert(this.connectedCallback);
            this.connectedCallback();
            this.connectedCallback = undefined;

        }
    }

    ondata?: OnData;
    onclose?: OnClose;
    onerror?: OnError;
};


export default function createSSLNetworkPipe(options: CreateSSLNetworkPipeOptions, platform: NrdpPlatform): Promise<NetworkPipe> {
    return new Promise<NetworkPipe>((resolve, reject) => {
        const sslPipe = new NrdpSSLNetworkPipe(options, platform, (error?: Error) => {
            platform.log("connected or something", error);
            if (error) {
                reject(error);
            } else {
                resolve(sslPipe);
            }
        });
    });
};
