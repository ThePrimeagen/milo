import { Platform, IpVersion, DnsResult } from "../types";
import nrdp from "./nrdp";
import N from "./ScriptSocket";
import createNrdpTCPNetworkPipe from "./NrdpTCPNetworkPipe";
import createNrdpSSLNetworkPipe from "./NrdpSSLNetworkPipe";
import nrdp_platform from "./nrdp_platform";

export class NrdpPlatform implements Platform {

    private trustStoreHash: string;
    private x509s: N.Struct[];
    private ERR_stringBuf: Uint8Array = new Uint8Array(128);

    public BIO_new_mem_buf: (buf: ArrayBuffer|Uint8Array, len: number) => N.Struct;
    public BIO_new_socket: (sock: number, close_flag: number) => N.Struct;
    public SSL_new: (ctx: N.Struct) => N.Struct;
    public SSL_CTX_new: (method: N.Struct) => N.Struct;
    public PEM_read_bio_X509: (bp: N.Struct, x: N.DataPointer, cb: N.Struct, u: ArrayBuffer|Uint8Array) => N.Struct;
    public SSL_CTX_get_cert_store: (ctx: N.Struct) => N.Struct;
    public X509_VERIFY_PARAM_new: () => N.Struct;
    public TLS_client_method: () => N.Struct;
    public BIO_free: (a: N.Struct) => number;
    public SSL_CTX_set1_param: (ctx: N.Struct, vpm: N.Struct) => number;
    public SSL_connect: (ssl: N.Struct) => number;
    public SSL_up_ref: (s: N.Struct) => number;
    public SSL_write: (ssl: N.Struct, buf: ArrayBuffer|Uint8Array, num: number) => number;
    public X509_STORE_add_cert: (ctx: N.Struct, x: N.Struct) => number;
    public BIO_int_ctrl: (bp: N.Struct, cmd: number, larg: number, iarg: number) => number;
    public SSL_CTX_ctrl: (ctx: N.Struct, cmd: number, larg: number, parg: ArrayBuffer|Uint8Array) => number;
    public SSL_CTX_set_options: (ctx: N.Struct, options: number) => number;
    public SSL_CTX_free: (ctx: N.Struct) => void;
    public SSL_set_bio: (ssl: N.Struct, rbio: N.Struct|N.BIO, wbio: N.Struct|N.BIO) => void;
    public SSL_set_default_read_buffer_len: (s: N.Struct, len: number) => void;
    public SSL_set_read_ahead: (s: N.Struct, yes: number) => void;
    public X509_VERIFY_PARAM_free: (param: N.Struct) => void;
    public X509_VERIFY_PARAM_set_time: (param: N.Struct, t: number) => void;
    public SSL_get_error: (ssl: N.Struct, ret: number) => number;
    public SSL_read: (ssl: N.Struct, buf: ArrayBuffer|Uint8Array, num: number) => number;
    public ERR_error_string_n: (e: number, buf: ArrayBuffer|Uint8Array, len: number) => void;

    public readonly SSL_CTRL_MODE: number = 33;
    public readonly SSL_MODE_RELEASE_BUFFERS = 0x00000010
    public readonly SSL_OP_NO_SSLv3: number = 0x02000000;

    constructor()
    {
        this.BIO_new_mem_buf = <(buf: ArrayBuffer|Uint8Array, len: number) => N.Struct>N.bindFunction("BIO *BIO_new_mem_buf(const void *buf, int len);");
        this.BIO_new_socket = <(sock: number, close_flag: number) => N.Struct>N.bindFunction("BIO *BIO_new_socket(int sock, int close_flag);");
        this.SSL_new = <(ctx: N.Struct) => N.Struct>N.bindFunction("SSL *SSL_new(SSL_CTX *ctx);");
        this.SSL_CTX_new = <(method: N.Struct) => N.Struct>N.bindFunction("SSL_CTX *SSL_CTX_new(const SSL_METHOD *method);");
        this.PEM_read_bio_X509 = <(bp: N.Struct, x: N.DataPointer, cb: N.Struct, u: ArrayBuffer|Uint8Array) => N.Struct>N.bindFunction("X509 *PEM_read_bio_X509(BIO *bp, X509 **x, pem_password_cb *cb, void *u);");
        this.SSL_CTX_get_cert_store = <(ctx: N.Struct) => N.Struct>N.bindFunction("X509_STORE *SSL_CTX_get_cert_store(const SSL_CTX *ctx);");
        this.X509_VERIFY_PARAM_new = <() => N.Struct>N.bindFunction("X509_VERIFY_PARAM *X509_VERIFY_PARAM_new(void);");
        this.TLS_client_method = <() => N.Struct>N.bindFunction("const SSL_METHOD *TLS_client_method(void);");
        this.BIO_free = <(a: N.Struct) => number>N.bindFunction("int BIO_free(BIO *a);");
        this.SSL_CTX_set1_param = <(ctx: N.Struct, vpm: N.Struct) => number>N.bindFunction("int SSL_CTX_set1_param(SSL_CTX *ctx, X509_VERIFY_PARAM *vpm)");
        this.SSL_connect = <(ssl: N.Struct) => number>N.bindFunction("int SSL_connect(SSL *ssl);");
        this.SSL_up_ref = <(s: N.Struct) => number>N.bindFunction("int SSL_up_ref(SSL *s);");
        this.SSL_write = <(ssl: N.Struct, buf: ArrayBuffer|Uint8Array, num: number) => number>N.bindFunction("int SSL_write(SSL *ssl, const void *buf, int num);");
        this.X509_STORE_add_cert = <(ctx: N.Struct, x: N.Struct) => number>N.bindFunction("int X509_STORE_add_cert(X509_STORE *ctx, X509 *x);");
        this.BIO_int_ctrl = <(bp: N.Struct, cmd: number, larg: number, iarg: number) => number>N.bindFunction("long BIO_int_ctrl(BIO *bp, int cmd, long larg, int iarg);");
        this.SSL_CTX_ctrl = <(ctx: N.Struct, cmd: number, larg: number, parg: ArrayBuffer|Uint8Array) => number>N.bindFunction("long SSL_CTX_ctrl(SSL_CTX *ctx, int cmd, long larg, void *parg);");
        this.SSL_CTX_set_options = <(ctx: N.Struct, options: number) => number>N.bindFunction("long SSL_CTX_set_options(SSL_CTX *ctx, long options);");
        this.SSL_CTX_free = <(ctx: N.Struct) => void>N.bindFunction("void SSL_CTX_free(SSL_CTX *ctx);");
        this.SSL_set_bio = <(ssl: N.Struct, rbio: N.Struct, wbio: N.Struct) => void>N.bindFunction("void SSL_set_bio(SSL *ssl, BIO *rbio, BIO *wbio);");
        this.SSL_set_default_read_buffer_len = <(s: N.Struct, len: number) => void>N.bindFunction("void SSL_set_default_read_buffer_len(SSL *s, size_t len);");
        this.SSL_set_read_ahead = <(s: N.Struct, yes: number) => void>N.bindFunction("void SSL_set_read_ahead(SSL *s, int yes);");
        this.X509_VERIFY_PARAM_free = <(param: N.Struct) => void>N.bindFunction("void X509_VERIFY_PARAM_free(X509_VERIFY_PARAM *param);");
        this.X509_VERIFY_PARAM_set_time = <(param: N.Struct, t: number) => void>N.bindFunction("void X509_VERIFY_PARAM_set_time(X509_VERIFY_PARAM *param, time_t t);");
        this.SSL_get_error = <(ssl: N.Struct, ret: number) => number>N.bindFunction("int SSL_get_error(const SSL *ssl, int ret);");
        this.SSL_read = <(ssl: N.Struct, buf: ArrayBuffer|Uint8Array, num: number) => number>N.bindFunction("int SSL_read(SSL *ssl, void *buf, int num);");
        this.ERR_error_string_n = <(e: number, buf: ArrayBuffer|Uint8Array, len: number) => void>N.bindFunction("void ERR_error_string_n(unsigned long e, char *buf, size_t len);");
    }

    get trustStore()
    {
        if (this.trustStoreHash != nrdp.trustStoreHash) {
            const trustStoreData = nrdp.trustStore;
            const trustBIO = this.BIO_new_mem_buf(trustStoreData, trustStoreData.byteLength);
            while (true) {
                const x509 = this.PEM_read_bio_X509(trustBIO, undefined, undefined, undefined);
                if (x509)
                    break;
                this.x509s.push(x509);
            }
            this.BIO_free(trustBIO);
            this.trustStoreHash = nrdp.trustStoreHash;
        }
        return this.x509s;
    }

    ERR_error_string(error:number): string
    {
        this.ERR_error_string_n(error, this.ERR_stringBuf, this.ERR_stringBuf.byteLength);
        // nrdp.l("error", error, ERR_stringBuf);
        let i;
        for (i=0; i<this.ERR_stringBuf.byteLength; ++i) {
            if (!this.ERR_stringBuf[i]) {
                break;
            }
        }
        // nrdp.l("balle", i);
        return nrdp.utf8toa(this.ERR_stringBuf, 0, i);
    }

    sha1(input: string): Uint8Array { return nrdp.hash("sha1", input); }

    log = nrdp.l;
    assert = nrdp.assert;
    btoa = nrdp.btoa;
    atob = nrdp.atob;
    atoutf8 = nrdp.atoutf8;
    utf8toa = nrdp.utf8toa;
    randomBytes = nrdp_platform.random;

    createTCPNetworkPipe = createNrdpTCPNetworkPipe;
    concatBuffers(...args: ArrayBuffer[]|Uint8Array[]) {
        // @ts-ignore
        return ArrayBuffer.concat(...args);
    }
    bufferIndexOf = nrdp_platform.indexOf;
    bufferLastIndexOf = nrdp_platform.lastIndexOf;
    lookupDnsHost = nrdp.dns.lookupHost.bind(nrdp.dns);
};

export default new NrdpPlatform;
