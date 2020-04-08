import DataBuffer from "./DataBuffer";
import IDataBuffer from "../IDataBuffer";
import IPlatform from "../IPlatform";
import IUnorderedMap from "../IUnorderedMap";
import N = nrdsocket;
import NrdpSSLBoundFunctions from "./NrdpSSLBoundFunctions";
import UnorderedMap from "./UnorderedMap";
import ICreateSSLNetworkPipeOptions from "../ICreateSSLNetworkPipeOptions";
import assert from '../utils/assert.macro';

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
    private maxProtoVersion: number;
    private sslCtx?: N.Struct;
    private ERRstringBuf: IDataBuffer;

    private verifyCallbackSSLs: IUnorderedMap<N.Struct, SSL_CTX_verify_callback_type>;
    private sslCtxVerifyCallback: N.DataPointer;

    public g: NrdpSSLBoundFunctions; // g for generated!

    constructor(platform: IPlatform) {
        this.platform = platform;
        this.ERRstringBuf = new DataBuffer(128);
        this.trustStoreHash = "";
        this.maxProtoVersion = 0;
        this.g = new NrdpSSLBoundFunctions();

        this.sslCtxVerifyCallback = N.setSSLCallback("SSL_verify_cb", (preverifyOk: number, x509Ctx: N.Struct) => {
            const ssl = this.g.X509_STORE_CTX_get_ex_data(x509Ctx, this.g.SSL_get_ex_data_X509_STORE_CTX_idx());
            assert(ssl, "gotta have ssl");
            const cb = this.verifyCallbackSSLs.get(ssl);
            if (cb) {
                preverifyOk = cb(preverifyOk, x509Ctx);
            }
            return preverifyOk;
        });

        this.verifyCallbackSSLs = new UnorderedMap();
    }

    public createSSL(options: ICreateSSLNetworkPipeOptions, verifyCallback?: SSL_CTX_verify_callback_type) {
        let maxProtoVersion;
        if (typeof options.tlsv13 !== "undefined") {
            maxProtoVersion = options.tlsv13 ? this.g.TLS1_3_VERSION : this.g.TLS1_2_VERSION
        } else {
            maxProtoVersion = this.platform.tlsv13SmallAssetsEnabled ? this.g.TLS1_3_VERSION : this.g.TLS1_2_VERSION
        }
        if (!this.sslCtx || this.trustStoreHash !== nrdp.trustStoreHash || maxProtoVersion !== this.maxProtoVersion) {
            const meth = this.g.TLS_client_method();
            assert(meth, "gotta have meth");
            this.sslCtx = this.g.SSL_CTX_new(meth);
            assert(this.sslCtx, "gotta have sslCtx");
            this.sslCtx.free = "SSL_CTX_free";
            this.g.SSL_CTX_set_verify(this.sslCtx, this.g.SSL_VERIFY_PEER, this.sslCtxVerifyCallback);
            this.platform.trace("cipher", nrdp.cipherList);
            if (!this.g.SSL_CTX_set_cipher_list(this.sslCtx, nrdp.cipherList)) {
                this.platform.error(`Failure: SSL_CTX_set_cipher_list(${nrdp.cipherList})`);
            }
            this.g.SSL_CTX_ctrl(this.sslCtx, this.g.SSL_CTRL_MODE,
                                this.g.SSL_MODE_RELEASE_BUFFERS | this.g.SSL_MODE_ACCEPT_MOVING_WRITE_BUFFER,
                                // | this.g.SSL_MODE_AUTO_RETRY,
                                undefined);
            if (!this.g.SSL_CTX_ctrl(this.sslCtx, this.g.SSL_CTRL_SET_MAX_PROTO_VERSION,
                                     maxProtoVersion, undefined)) {
                this.platform.error(`Failure: SSL_CTX_set_max_proto_version(${maxProtoVersion})`);
            }

            const ctxOptions = (this.g.SSL_OP_ALL |
                                this.g.SSL_OP_NO_TLSv1 |
                                this.g.SSL_OP_NO_SSLv2 |
                                this.g.SSL_OP_NO_SSLv3 |
                                this.g.SSL_OP_CIPHER_SERVER_PREFERENCE);

            this.g.SSL_CTX_set_options(this.sslCtx, ctxOptions);

            const certStore = this.g.SSL_CTX_get_cert_store(this.sslCtx);
            assert(certStore, "gotta have certStore");
            const trustStoreData = nrdp.trustStore;
            const trustBIO = this.g.BIO_new_mem_buf(trustStoreData, trustStoreData.byteLength);
            assert(trustBIO, "gotta have trustBIO");
            while (true) {
                const x509 = this.g.PEM_read_bio_X509(trustBIO, undefined, undefined, undefined);
                if (!x509)
                    break;
                x509.free = "X509_free";
                this.g.X509_STORE_add_cert(certStore, x509);
            }
            this.g.BIO_free(trustBIO);
            this.trustStoreHash = nrdp.trustStoreHash;
            this.maxProtoVersion = maxProtoVersion;
        }

        const param = this.g.X509_VERIFY_PARAM_new();
        assert(param, "gotta have param");
        this.g.X509_VERIFY_PARAM_set_time(param, Math.round(nrdp.now() / 1000));
        if (!this.g.SSL_CTX_set1_param(this.sslCtx, param)) {
            this.platform.error("Failure: SSL_CTX_set1_param(param)");
        }
        this.g.X509_VERIFY_PARAM_free(param);

        const ret = this.g.SSL_new(this.sslCtx);
        assert(ret, "gotta have ssl");
        if (verifyCallback) {
            assert(!this.verifyCallbackSSLs.has(ret), "only once please");
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
