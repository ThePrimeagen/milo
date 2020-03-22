import DataBuffer from "./DataBuffer";
import IDataBuffer from "../IDataBuffer";
import IPlatform from "../IPlatform";
import IUnorderedMap from "../IUnorderedMap";
import N = nrdsocket;
import NrdpSSLBoundFunctions from "./NrdpSSLBoundFunctions";
import UnorderedMap from "./UnorderedMap";

function assert(platform: IPlatform, condition: any, msg?: string): asserts condition {
    platform.assert(condition, msg);
}

type SSL_CTX_verify_callback_type = (preverifyOk: number, x509Ctx: N.Struct) => number;
type X509Data = {
    certsubjectname?: string;
    certissuername?: string;
    certsernum?: string;
    notbefore?: string;
    notafter?: string;
};

export default class NrdpSSL {
    private platform: IPlatform;
    private trustStoreHash: string;
    private x509s: N.Struct[];
    private sslCtx?: N.Struct;
    private ERRstringBuf: IDataBuffer;

    private verifyCallbackSSLs: IUnorderedMap<N.Struct, SSL_CTX_verify_callback_type>;
    private sslCtxVerifyCallback: N.DataPointer;

    public g: NrdpSSLBoundFunctions; // g for generated!

    constructor(platform: IPlatform) {
        this.platform = platform;
        this.ERRstringBuf = new DataBuffer(128);
        this.trustStoreHash = "";
        this.x509s = [];
        this.g = new NrdpSSLBoundFunctions();

        this.sslCtxVerifyCallback = N.setSSLCallback("SSL_verify_cb", (preverifyOk: number, x509Ctx: N.Struct) => {
            const ssl = this.g.X509_STORE_CTX_get_ex_data(x509Ctx, this.g.SSL_get_ex_data_X509_STORE_CTX_idx());
            assert(platform, ssl, "gotta have ssl");
            const cb = this.verifyCallbackSSLs.get(ssl);
            if (cb) {
                preverifyOk = cb(preverifyOk, x509Ctx);
            }
            return preverifyOk;
        });

        this.verifyCallbackSSLs = new UnorderedMap();
    }

    public createSSL(verifyCallback?: SSL_CTX_verify_callback_type) {
        if (!this.sslCtx || this.trustStoreHash !== nrdp.trustStoreHash) {
            const meth = this.g.TLS_client_method();
            assert(this.platform, meth, "gotta have meth");
            this.sslCtx = this.g.SSL_CTX_new(meth);
            assert(this.platform, this.sslCtx, "gotta have sslCtx");
            this.sslCtx.free = "SSL_CTX_free";
            this.g.SSL_CTX_set_verify(this.sslCtx, this.g.SSL_VERIFY_PEER, this.sslCtxVerifyCallback);
            this.platform.trace("cipher", nrdp.cipherList);
            this.g.SSL_CTX_set_cipher_list(this.sslCtx, nrdp.cipherList);
            // ### should check return value
            this.g.SSL_CTX_ctrl(this.sslCtx, this.g.SSL_CTRL_MODE,
                                this.g.SSL_MODE_RELEASE_BUFFERS | this.g.SSL_MODE_ACCEPT_MOVING_WRITE_BUFFER,
                                // | this.g.SSL_MODE_AUTO_RETRY,
                                undefined);
            const ctxOptions = (this.g.SSL_OP_ALL |
                                this.g.SSL_OP_NO_TLSv1 |
                                this.g.SSL_OP_NO_SSLv2 |
                                this.g.SSL_OP_NO_SSLv3 |
                                this.g.SSL_OP_CIPHER_SERVER_PREFERENCE);

            const retVal = this.g.SSL_CTX_set_options(this.sslCtx, ctxOptions);

            const certStore = this.g.SSL_CTX_get_cert_store(this.sslCtx);
            assert(this.platform, certStore, "gotta have certStore");
            const trustStoreData = nrdp.trustStore;
            const trustBIO = this.g.BIO_new_mem_buf(trustStoreData, trustStoreData.byteLength);
            assert(this.platform, trustBIO, "gotta have trustBIO");
            while (true) {
                const x509 = this.g.PEM_read_bio_X509(trustBIO, undefined, undefined, undefined);
                if (!x509)
                    break;
                x509.free = "X509_free";
                this.g.X509_STORE_add_cert(certStore, x509);
            }
            this.g.BIO_free(trustBIO);
            this.trustStoreHash = nrdp.trustStoreHash;
        }

        const param = this.g.X509_VERIFY_PARAM_new();
        assert(this.platform, param, "gotta have param");
        this.g.X509_VERIFY_PARAM_set_time(param, Math.round(nrdp.now() / 1000));
        this.g.SSL_CTX_set1_param(this.sslCtx, param);
        this.g.X509_VERIFY_PARAM_free(param);

        const ret = this.g.SSL_new(this.sslCtx);
        assert(this.platform, ret, "gotta have ssl");
        if (verifyCallback) {
            assert(this.platform, !this.verifyCallbackSSLs.has(ret), "only once please");
            this.verifyCallbackSSLs.set(ret, verifyCallback);
        }

        this.g.SSL_set_default_read_buffer_len(ret, 16384);
        this.g.SSL_set_read_ahead(ret, 1);
        ret.free = "SSL_free";
        return ret;
    }

    ERR_error_string(error: number): string {
        this.g.ERR_error_string_n(error, this.ERRstringBuf, this.ERRstringBuf.byteLength);
        // nrdp.l.success("error", error, ERRstringBuf);
        let i;
        for (i = 0; i < this.ERRstringBuf.byteLength; ++i) {
            if (!this.ERRstringBuf.get(i)) {
                break;
            }
        }
        // nrdp.l.success("balle", i);
        return nrdp.utf8toa(this.ERRstringBuf, 0, i);
    }

    x509Data(x509: N.Struct): X509Data {
        const ret = {};
        return {};
    }
};
