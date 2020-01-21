import { NetworkPipe, OnData, OnClose, OnError, DnsResult, Platform, CreateSSLNetworkPipeOptions } from "../types";
import { NrdpPlatform } from "./NrdpPlatform";
import N from "./ScriptSocket";
import nrdp from "./nrdp";

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
    private connected: boolean = false;

    constructor(options: CreateSSLNetworkPipeOptions, platform: Platform)
    {
        this.platform = <NrdpPlatform>(platform);
        platform.log("shit");
        platform.log("shit", Object.keys(platform));
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

            // this.platform.SSL_set_bio(this.ssl, this.inputBio, this.inputBio);
        // } else if (0) {
            // const that = this;
            // this.bio = new N.BIO;
            // this.bio.onread = function(this: N.BIO, len: number) {
            //     that.platform.log("got called", len);
            //      // ### GOTTA write the
            //     return -1;
            // };
            // this.bio.onwrite = function(this: N.BIO, len: number) {
            //     // 	this.platform.log("fucking here", len, this, this.bio, this === this.bio);
            //     var ab = new ArrayBuffer(len);
            //     that.platform.log("fucking here2", len);
            //     // how to get
            //     this.readData(0, ab, 0, len);
            //     that.platform.log("fucking here3", len, ab);
            //     // addSocketWriteBytes(ab);
            //     that.platform.log("fucking here4", len);
            //     // 	this.platform.log("got called write", len, ab, socketWriteBuf);
            //     return len;
            // };

            // this.bio.onctrl = function(this: N.BIO, cmd: number, num: number, ptr: N.DataPointer|undefined) {
            //     that.platform.log("fucking ctrl", cmd, num, ptr);
            //     return 1;
            // };

            // this.platform.SSL_set_bio(this.ssl, this.bio, this.bio);
        // } else {
            const memMethod = this.platform.BIO_s_mem();
            this.inputBio = this.platform.BIO_new(memMethod);
            set_mem_eof_return(this.platform, this.inputBio);

            this.inputBio.free = "BIO_free";

            this.outputBio = this.platform.BIO_new(memMethod);
            set_mem_eof_return(this.platform, this.outputBio);
            this.outputBio.free = "BIO_free";
            this.pipe.ondata = () => {
                this.platform.log("got data");
                const read = this.pipe.read(this.platform.scratch, 0, this.platform.scratch.byteLength);
                this.platform.assert(read > 0, "This should be > 0");
                nrdp.l("wrote", read, "bytes to inputBio");
                this.platform.BIO_write(this.inputBio, this.platform.scratch, read);
                if (!this.connected) {
                    this.connect();
                }
            };
            this.pipe.onclose = () => {
                this.platform.log("got close");
            };
            this.pipe.onerror = (code: number, message?: string) => {
                this.platform.log("got error", code, message || "");
            };

            this.platform.SSL_set_bio(this.ssl, this.inputBio, this.outputBio);
        // }
        this.connect();
    }

    write(buf: Uint8Array | ArrayBuffer | string, offset?: number, length?: number): void
    {
        this.writeToNetworkPipe();
    }

    read(buf: Uint8Array | ArrayBuffer, offset: number, length: number): number
    {
        return -1;
    }

    close(): void
    {

    }

    private writeToNetworkPipe()
    {


    }

    private connect()
    {
        let ret = this.platform.SSL_connect(this.ssl);
        this.platform.log("CALLED CONNECT", ret);
        if (ret < 0) {
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
                // this.platform.quit(1);
            }
        } else {
            this.platform.assert(ret === 0, "This should be 0");
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
