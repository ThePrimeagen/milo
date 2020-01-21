import { NetworkPipe, OnData, OnClose, OnError, DnsResult, Platform, CreateSSLNetworkPipeOptions } from "../types";
import { NrdpPlatform } from "./NrdpPlatform";
import N from "./ScriptSocket";
import nrdp from "./nrdp";
import { assert } from "../utils";

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
    private platform: NrdpPlatform
    private connected: boolean;
    private writeBuffers: (Uint8Array|ArrayBuffer|string)[];
    private writeBufferOffsets: number[];
    private writeBufferLengths: number[];

    constructor(options: CreateSSLNetworkPipeOptions, platform: Platform)
    {
        this.connected = false;
        this.platform = <NrdpPlatform>(platform);
        this.writeBuffers = [];
        this.writeBufferOffsets = [];
        this.writeBufferLengths = [];

        this.pipe = options.pipe;
        const meth = this.platform.TLS_client_method();
        this.ssl_ctx = this.platform.SSL_CTX_new(meth);
        this.ssl_ctx.free = "SSL_CTX_free";
        let ret = this.platform.SSL_CTX_ctrl(this.ssl_ctx, this.platform.SSL_CTRL_MODE, this.platform.SSL_MODE_RELEASE_BUFFERS, undefined);
        this.platform.log("BALLS", ret);
        /* SSL_SET_OPTION(0); */
        let ctx_options = this.platform.SSL_OP_NO_SSLv3;
        ret = this.platform.SSL_CTX_set_options(this.ssl_ctx, ctx_options);
        this.platform.log("BALLS 2", ret);
        const cert_store = this.platform.SSL_CTX_get_cert_store(this.ssl_ctx);
        const shit = this.platform.trustStore();
        this.platform.log("BALLS3", typeof shit);
        this.platform.trustStore().forEach((x509: N.Struct) => {
            this.platform.X509_STORE_add_cert(cert_store, x509);
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
            this.platform.log("FAEN");
            const read = this.pipe.read(this.platform.scratch, 0, this.platform.scratch.byteLength);
            if (!read) {
                assert(this.pipe.closed, "Should be closed already");
                return;
            }
            this.platform.log("got data", read);
            this.platform.assert(read > 0, "This should be > 0");
            nrdp.l("wrote", read, "bytes to inputBio");
            this.platform.BIO_write(this.inputBio, this.platform.scratch, read);
            if (!this.connected) {
                this._connect();
            } else {
                this._readFromBIO();
            }
        };
        this.pipe.onclose = () => {
            this.platform.log("got close", this.platform.stacktrace());
        };
        this.pipe.onerror = (code: number, message?: string) => {
            this.platform.log("got error", code, message || "");
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

        if (!this.connected) {
            throw new Error("SSLNetworkPipe is not connected");
        }
        if (this.writeBuffers.length) {
            this.writeBuffers.push(buf);
            this.writeBufferOffsets.push(offset || 0);
            this.writeBufferLengths.push(offset || 0);
        } else {

        }
    }

    read(buf: Uint8Array | ArrayBuffer, offset: number, length: number): number
    {
        return -1;
    }

    close(): void
    {

    }

    private _readFromBIO()
    {

    }

    private _connect()
    {
        let ret = this.platform.SSL_connect(this.ssl);
        this.platform.log("CALLED CONNECT", ret);
        if (ret <= 0) {
            this.platform.log("GOT ERROR FROM SSL_CONNECT", this.platform.SSL_get_error(this.ssl, ret),
                              this.platform.ERR_error_string(this.platform.SSL_get_error(this.ssl, ret)));
            if (this.platform.SSL_get_error(this.ssl, ret) == this.platform.SSL_ERROR_WANT_READ) {
                const pending = this.platform.BIO_ctrl_pending(this.outputBio);
                // this.platform.assert(pending <= this.scratch.byteLength, "Pending too large. Probably have to increase scratch buffer size");
                if (pending > 0) {
                    const buf = new ArrayBuffer(pending);
                    let read = this.platform.BIO_read(this.outputBio, buf, pending);
                    this.platform.assert(read === pending, "Read should be pending");
                    this.pipe.write(buf, 0, read);
                    // this.platform
                }
                this.platform.log("got pending", pending);
                // N.setFD(sock, N.READ, onConnected.bind(this, host));
            } else {
                this.platform.log("BIG FAILURE", this.platform.SSL_get_error(this.ssl, ret), N.errno);
                this.platform.quit(1);
            }
        } else {
            this.platform.log("sheeeet", ret);
            this.platform.assert(ret === 1, "This should be 1");
            this.platform.log("we're connected");
            this.connected = true;
        }
    }

    ondata?: OnData;
    onclose?: OnClose;
    onerror?: OnError;
};


export default function connectSSLNetworkPipe(options: CreateSSLNetworkPipeOptions, platform: Platform): Promise<NetworkPipe> {
    return new Promise<NetworkPipe>((resolve, reject) => {
        const sslPipe = new NrdpSSLNetworkPipe(options, platform);

    });
};
