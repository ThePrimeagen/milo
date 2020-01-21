import { NetworkPipe, OnData, OnClose, OnError, DnsResult } from "../types";
import { NrdpPlatform } from "./NrdpPlatform";
import N from "./ScriptSocket";
import nrdp from "./nrdp";

class NrdpSSLNetworkPipe implements NetworkPipe
{
    private ssl: N.Struct;
    private ssl_ctx: N.Struct;
    private bio: N.BIO
    private pipe: NetworkPipe;
    private platform: NrdpPlatform

    constructor(pipe: NetworkPipe, platform: NrdpPlatform)
    {
        this.pipe = pipe;
        this.platform = platform;
        const meth = platform.TLS_client_method();
        this.ssl_ctx = platform.SSL_CTX_new(meth);
        this.ssl_ctx.free = "SSL_CTX_free";
        let ret = platform.SSL_CTX_ctrl(this.ssl_ctx, platform.SSL_CTRL_MODE, platform.SSL_MODE_RELEASE_BUFFERS, undefined);
        platform.log("BALLS", ret);
        /* SSL_SET_OPTION(0); */
        let ctx_options = platform.SSL_OP_NO_SSLv3;
        ret = platform.SSL_CTX_set_options(this.ssl_ctx, ctx_options);
        platform.log("BALLS 2", ret);
        const cert_store = platform.SSL_CTX_get_cert_store(this.ssl_ctx);
        platform.trustStore.forEach((x509: N.Struct) => {
            platform.X509_STORE_add_cert(cert_store, x509);
        });
        const param = platform.X509_VERIFY_PARAM_new();
        platform.X509_VERIFY_PARAM_set_time(param, Math.round(nrdp.now() / 1000));
        platform.SSL_CTX_set1_param(this.ssl_ctx, param);
        platform.X509_VERIFY_PARAM_free(param);

        this.ssl = platform.SSL_new(this.ssl_ctx);
        platform.SSL_set_default_read_buffer_len(this.ssl, 16384);
        platform.SSL_up_ref(this.ssl);
        platform.SSL_set_read_ahead(this.ssl, 1);
        if (0) {
            // this.bio = platform.BIO_new_socket(sock, platform.BIO_NOCLOSE);
            // this.bio.free = "BIO_free";
            // // platform.BIO_set_read_buffer_size(this.bio, 16384);
            // nrdp.l("ball", platform.BIO_int_ctrl(this.bio, platform.BIO_C_SET_BUFF_SIZE, 16384, 0));

            // platform.SSL_set_bio(this.ssl, this.bio, this.bio);
        } else {
            this.bio = new N.BIO;
            this.bio.onread = function(this: N.BIO, len: number) {
                nrdp.l("got called", len);
                // ### GOTTA write the
                return -1;
            };
            this.bio.onwrite = function(this: N.BIO, len: number) {
                // nrdp.l("fucking here", len, this, this.bio, this === this.bio);
                var ab = new ArrayBuffer(len);
                nrdp.l("fucking here2", len);
                // how to get
                this.readData(0, ab, 0, len);
                nrdp.l("fucking here3", len, ab);
                // addSocketWriteBytes(ab);
                nrdp.l("fucking here4", len);
                // nrdp.l("got called write", len, ab, socketWriteBuf);
                return len;
            };

            this.bio.onctrl = function(this: N.BIO, cmd: number, num: number, ptr: N.DataPointer|undefined) {
                nrdp.l("fucking ctrl", cmd, num, ptr);
                return 1;
            };

            platform.SSL_set_bio(this.ssl, this.bio, this.bio);
        }
    }

    write(buf: Uint8Array | ArrayBuffer | string, offset?: number, length?: number): void
    {

    }

    read(buf: Uint8Array | ArrayBuffer, offset: number, length: number): number
    {
        return -1;
    }

    close(): void
    {

    }

    ondata: OnData;
    onclose: OnClose;
    onerror: OnError;
};


export default function connectSSLNetworkPipe(pipe: NetworkPipe, platform: NrdpPlatform): Promise<NetworkPipe> {
    return new Promise<NetworkPipe>((resolve, reject) => {
        const sslPipe = new NrdpSSLNetworkPipe(pipe, platform);


    });
};
