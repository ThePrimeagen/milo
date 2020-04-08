import IDataBuffer from "../IDataBuffer";
import IPlatform from "../IPlatform";
import IUnorderedMap from "../IUnorderedMap";
import N = nrdsocket;
import NrdpBoundSSLFunctions from "./NrdpBoundSSLFunctions";
import UnorderedMap from "./UnorderedMap";
import ICreateSSLNetworkPipeOptions from "../ICreateSSLNetworkPipeOptions";
import assert from '../utils/assert.macro';

type SSL_CTX_verify_callback_type = (preverifyOk: number, x509Ctx: N.Struct) => number;
export interface X509Data {
    certsubjectname?: string;
    certissuername?: string;
    certsernum?: string;
    notbefore?: string;
    notafter?: string;
    errreason?: string;
};

export default class NrdpSSL {
    private platform: IPlatform;
    private trustStoreHash?: string;
    private cipherList?: string;
    private maxProtoVersion: number;
    private sslCtx?: N.Struct;

    private verifyCallbackSSLs: IUnorderedMap<N.Struct, SSL_CTX_verify_callback_type>;
    private sslCtxVerifyCallback: N.DataPointer;

    public g: NrdpBoundSSLFunctions; // g for generated!

    constructor(platform: IPlatform) {
        this.platform = platform;
        this.maxProtoVersion = 0;
        this.g = new NrdpBoundSSLFunctions();

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

    public createSSL(options: ICreateSSLNetworkPipeOptions, verifyCallback?: SSL_CTX_verify_callback_type): N.Struct {
        let maxProtoVersion;
        if (typeof options.tlsv13 !== "undefined") {
            maxProtoVersion = options.tlsv13 ? this.g.TLS1_3_VERSION : this.g.TLS1_2_VERSION
        } else {
            maxProtoVersion = this.platform.tlsv13SmallAssetsEnabled ? this.g.TLS1_3_VERSION : this.g.TLS1_2_VERSION
        }
        if (!this.sslCtx
            || this.trustStoreHash !== nrdp.trustStoreHash
            || this.cipherList !== nrdp.cipherList
            || maxProtoVersion !== this.maxProtoVersion) {
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
            this.cipherList = nrdp.cipherList;
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

    ERR_error_string(error: number, buf: IDataBuffer): string {
        this.g.ERR_error_string_n(error, buf, buf.byteLength);
        let i = buf.indexOf(0);
        if (i === -1)
            i = buf.byteLength;
        return buf.toString(undefined, 0, i);
    }

    x509Data(x509: N.Struct, bio: N.Struct, buf: IDataBuffer): X509Data {
        const certsubjectname = this.x509_NAME_toString(this.g.X509_get_subject_name(x509), buf);
        const certissuername = this.x509_NAME_toString(this.g.X509_get_issuer_name(x509), buf);
        const notbefore = this.ASN1_UTCTIME_toString(this.g.X509_get0_notBefore(x509), bio, buf);
        const notafter = this.ASN1_UTCTIME_toString(this.g.X509_get0_notAfter(x509), bio, buf);
        let certsernum: string | undefined;

        const serNum = this.g.X509_get_serialNumber(x509);
        if (serNum) {
            const bn = this.g.ASN1_INTEGER_to_BN(serNum, undefined);
            if (bn) {
                const bnStr = this.g.BN_bn2hex(bn);
                if (bnStr) {
                    certsernum = bnStr.stringify();
                    this.g.CRYPTO_free(bnStr, "NrdpSSL.ts", 0);
                    bnStr.release();
                }

                this.g.BN_free(bn);
                bn.release();
            }
            serNum.release();
        }

        return { certsubjectname, certissuername, notbefore, notafter, certsernum };
    }
    private x509_NAME_toString(n: N.Struct | undefined, buf: IDataBuffer): string | undefined {
        let ret: string | undefined;
        if (n) {
            const str = this.g.X509_NAME_oneline(n, buf, buf.byteLength);
            if (str) {
                ret = str.stringify();
                str.release();
            }
            n.release();
        }
        return ret;
    }
    private ASN1_UTCTIME_toString(utc: N.Struct | undefined, bio: N.Struct, buf: IDataBuffer): string | undefined {
        let ret: string | undefined;
        if (utc) {
            if (this.g.ASN1_UTCTIME_check(utc) === 1) {
                this.g.ASN1_UTCTIME_print(bio, utc);
                const read = this.g.BIO_read(bio, buf, 0, buf.byteLength);
                if (read > 0) {
                    ret = buf.toString(undefined, 0, read);
                }
            }
            utc.release();
        }
        return ret;
    };
};
