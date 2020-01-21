import { Platform, IpVersion, DnsResult, CreateTCPNetworkPipeOptions, CreateSSLNetworkPipeOptions, NetworkPipe } from "../types";
import nrdp from "./nrdp";
import N from "./ScriptSocket";
import createNrdpTCPNetworkPipe from "./NrdpTCPNetworkPipe";
import createNrdpSSLNetworkPipe from "./NrdpSSLNetworkPipe";
import nrdp_platform from "./nrdp_platform";

type BIO_ctrl_pending_type = (b: N.Struct) => number;
type BIO_ctrl_type = (bp: N.Struct, cmd: number, larg: number, parg: N.DataPointer | undefined) => number;
type BIO_ctrl_wpending_type = (b: N.Struct) => number;
type BIO_free_type = (a: N.Struct) => number;
type BIO_int_ctrl_type = (bp: N.Struct, cmd: number, larg: number, iarg: number) => number;
type BIO_new_mem_buf_type = (buf: ArrayBuffer | Uint8Array, len: number) => N.Struct;
type BIO_new_socket_type = (sock: number, close_flag: number) => N.Struct;
type BIO_new_type = (ctx: N.Struct) => N.Struct;
type BIO_read_type = (b: N.Struct, data: ArrayBuffer | Uint8Array, dlen: number) => number;
type BIO_s_mem_type = () => N.Struct;
type BIO_write_type = (b: N.Struct, data: ArrayBuffer | Uint8Array | string, dlen: number) => number;
type ERR_error_string_n_type = (e: number, buf: ArrayBuffer | Uint8Array, len: number) => void;
type PEM_read_bio_X509_type = (bp: N.Struct, x: N.DataPointer | undefined, cb: N.Struct | undefined, u: ArrayBuffer | Uint8Array | undefined) => N.Struct;
type SSL_CTX_ctrl_type = (ctx: N.Struct, cmd: number, larg: number, parg: ArrayBuffer | Uint8Array | undefined) => number;
type SSL_CTX_free_type = (ctx: N.Struct) => void;
type SSL_CTX_get_cert_store_type = (ctx: N.Struct) => N.Struct;
type SSL_CTX_new_type = (method: N.Struct) => N.Struct;
type SSL_CTX_set1_param_type = (ctx: N.Struct, vpm: N.Struct) => number;
type SSL_CTX_set_options_type = (ctx: N.Struct, options: number) => number;
type SSL_connect_type = (ssl: N.Struct) => number;
type SSL_get_error_type = (ssl: N.Struct, ret: number) => number;
type SSL_new_type = (ctx: N.Struct) => N.Struct;
type SSL_read_type = (ssl: N.Struct, buf: ArrayBuffer | Uint8Array, num: number) => number;
type SSL_set_bio_type = (ssl: N.Struct, rbio: N.Struct | N.BIO, wbio: N.Struct | N.BIO) => void;
type SSL_set_default_read_buffer_len_type = (s: N.Struct, len: number) => void;
type SSL_set_read_ahead_type = (s: N.Struct, yes: number) => void;
type SSL_up_ref_type = (s: N.Struct) => number;
type SSL_write_type = (ssl: N.Struct, buf: ArrayBuffer | Uint8Array, num: number) => number;
type TLS_client_method_type = () => N.Struct;
type X509_STORE_add_cert_type = (ctx: N.Struct, x: N.Struct) => number;
type X509_VERIFY_PARAM_free_type = (param: N.Struct) => void;
type X509_VERIFY_PARAM_new_type = () => N.Struct;
type X509_VERIFY_PARAM_set_time_type = (param: N.Struct, t: number) => void;

export class NrdpPlatform implements Platform {

    private trustStoreHash: string;
    private x509s: N.Struct[];
    private ERR_stringBuf: Uint8Array;

    public BIO_ctrl: BIO_ctrl_type;
    public BIO_ctrl_pending: BIO_ctrl_pending_type;
    public BIO_ctrl_wpending: BIO_ctrl_wpending_type;
    public BIO_free: BIO_free_type;
    public BIO_int_ctrl: BIO_int_ctrl_type;
    public BIO_new: BIO_new_type;
    public BIO_new_mem_buf: BIO_new_mem_buf_type;
    public BIO_new_socket: BIO_new_socket_type;
    public BIO_read: BIO_read_type;
    public BIO_s_mem: BIO_s_mem_type;
    public BIO_write: BIO_write_type;
    public ERR_error_string_n: ERR_error_string_n_type;
    public PEM_read_bio_X509: PEM_read_bio_X509_type;
    public SSL_CTX_ctrl: SSL_CTX_ctrl_type;
    public SSL_CTX_free: SSL_CTX_free_type;
    public SSL_CTX_get_cert_store: SSL_CTX_get_cert_store_type;
    public SSL_CTX_new: SSL_CTX_new_type;
    public SSL_CTX_set1_param: SSL_CTX_set1_param_type;
    public SSL_CTX_set_options: SSL_CTX_set_options_type;
    public SSL_connect: SSL_connect_type;
    public SSL_get_error: SSL_get_error_type;
    public SSL_new: SSL_new_type;
    public SSL_read: SSL_read_type;
    public SSL_set_bio: SSL_set_bio_type;
    public SSL_set_default_read_buffer_len: SSL_set_default_read_buffer_len_type;
    public SSL_set_read_ahead: SSL_set_read_ahead_type;
    public SSL_up_ref: SSL_up_ref_type;
    public SSL_write: SSL_write_type;
    public TLS_client_method: TLS_client_method_type;
    public X509_STORE_add_cert: X509_STORE_add_cert_type;
    public X509_VERIFY_PARAM_free: X509_VERIFY_PARAM_free_type;
    public X509_VERIFY_PARAM_new: X509_VERIFY_PARAM_new_type;
    public X509_VERIFY_PARAM_set_time: X509_VERIFY_PARAM_set_time_type;

    public readonly SSL_CTRL_MODE = 33;
    public readonly SSL_MODE_RELEASE_BUFFERS = 0x00000010
    public readonly SSL_OP_NO_SSLv3 = 0x02000000;

    public readonly BIO_C_SET_BUF_MEM_EOF_RETURN = 130;

    public readonly SSL_ERROR_NONE = 0;
    public readonly SSL_ERROR_SSL = 1;
    public readonly SSL_ERROR_WANT_READ = 2;
    public readonly SSL_ERROR_WANT_WRITE = 3;
    public readonly SSL_ERROR_WANT_X509_LOOKUP = 4;
    public readonly SSL_ERROR_SYSCALL = 5;

    constructor()
    {
        this.ERR_stringBuf = new Uint8Array(128);
        this.trustStoreHash = "";
        this.x509s = [];
         // this.BIO_set_mem_eof_return = <BIO_set_mem_eof_return_type>N.bindFunction("void BIO_set_mem_eof_return(BIO *b, int v);");
        this.BIO_ctrl = <BIO_ctrl_type>N.bindFunction("long BIO_ctrl(BIO *bp, int cmd, long larg, void *parg);");
        this.BIO_ctrl_pending = <BIO_ctrl_pending_type>N.bindFunction("size_t BIO_ctrl_pending(BIO *b);");
        this.BIO_ctrl_wpending = <BIO_ctrl_wpending_type>N.bindFunction("size_t BIO_ctrl_wpending(BIO *b);");
        this.BIO_free = <BIO_free_type>N.bindFunction("int BIO_free(BIO *a);");
        this.BIO_int_ctrl = <BIO_int_ctrl_type>N.bindFunction("long BIO_int_ctrl(BIO *bp, int cmd, long larg, int iarg);");
        this.BIO_new = <BIO_new_type>N.bindFunction("BIO *BIO_new(const BIO_METHOD *type);");
        this.BIO_new_mem_buf = <BIO_new_mem_buf_type>N.bindFunction("BIO *BIO_new_mem_buf(const void *buf, int len);");
        this.BIO_new_socket = <BIO_new_socket_type>N.bindFunction("BIO *BIO_new_socket(int sock, int close_flag);");
        this.BIO_read = <BIO_read_type>N.bindFunction("int BIO_read(BIO *b, void *data, int dlen);");
        this.BIO_s_mem = <BIO_s_mem_type>N.bindFunction("const BIO_METHOD *BIO_s_mem();");
        this.BIO_write = <BIO_write_type>N.bindFunction("int BIO_write(BIO *b, const void *data, int dlen);");
        this.ERR_error_string_n = <ERR_error_string_n_type>N.bindFunction("void ERR_error_string_n(unsigned long e, char *buf, size_t len);");
        this.PEM_read_bio_X509 = <PEM_read_bio_X509_type>N.bindFunction("X509 *PEM_read_bio_X509(BIO *bp, X509 **x, pem_password_cb *cb, void *u);");
        this.SSL_CTX_ctrl = <SSL_CTX_ctrl_type>N.bindFunction("long SSL_CTX_ctrl(SSL_CTX *ctx, int cmd, long larg, void *parg);");
        this.SSL_CTX_free = <SSL_CTX_free_type>N.bindFunction("void SSL_CTX_free(SSL_CTX *ctx);");
        this.SSL_CTX_get_cert_store = <SSL_CTX_get_cert_store_type>N.bindFunction("X509_STORE *SSL_CTX_get_cert_store(const SSL_CTX *ctx);");
        this.SSL_CTX_new = <SSL_CTX_new_type>N.bindFunction("SSL_CTX *SSL_CTX_new(const SSL_METHOD *method);");
        this.SSL_CTX_set1_param = <SSL_CTX_set1_param_type>N.bindFunction("int SSL_CTX_set1_param(SSL_CTX *ctx, X509_VERIFY_PARAM *vpm)");
        this.SSL_CTX_set_options = <SSL_CTX_set_options_type>N.bindFunction("long SSL_CTX_set_options(SSL_CTX *ctx, long options);");
        this.SSL_connect = <SSL_connect_type>N.bindFunction("int SSL_connect(SSL *ssl);");
        this.SSL_get_error = <SSL_get_error_type>N.bindFunction("int SSL_get_error(const SSL *ssl, int ret);");
        this.SSL_new = <SSL_new_type>N.bindFunction("SSL *SSL_new(SSL_CTX *ctx);");
        this.SSL_read = <SSL_read_type>N.bindFunction("int SSL_read(SSL *ssl, void *buf, int num);");
        this.SSL_set_bio = <SSL_set_bio_type>N.bindFunction("void SSL_set_bio(SSL *ssl, BIO *rbio, BIO *wbio);");
        this.SSL_set_default_read_buffer_len = <SSL_set_default_read_buffer_len_type>N.bindFunction("void SSL_set_default_read_buffer_len(SSL *s, size_t len);");
        this.SSL_set_read_ahead = <SSL_set_read_ahead_type>N.bindFunction("void SSL_set_read_ahead(SSL *s, int yes);");
        this.SSL_up_ref = <SSL_up_ref_type>N.bindFunction("int SSL_up_ref(SSL *s);");
        this.SSL_write = <SSL_write_type>N.bindFunction("int SSL_write(SSL *ssl, const void *buf, int num);");
        this.TLS_client_method = <TLS_client_method_type>N.bindFunction("const SSL_METHOD *TLS_client_method(void);");
        this.X509_STORE_add_cert = <X509_STORE_add_cert_type>N.bindFunction("int X509_STORE_add_cert(X509_STORE *ctx, X509 *x);");
        this.X509_VERIFY_PARAM_free = <X509_VERIFY_PARAM_free_type>N.bindFunction("void X509_VERIFY_PARAM_free(X509_VERIFY_PARAM *param);");
        this.X509_VERIFY_PARAM_new = <X509_VERIFY_PARAM_new_type>N.bindFunction("X509_VERIFY_PARAM *X509_VERIFY_PARAM_new(void);");
        this.X509_VERIFY_PARAM_set_time = <X509_VERIFY_PARAM_set_time_type>N.bindFunction("void X509_VERIFY_PARAM_set_time(X509_VERIFY_PARAM *param, time_t t);");
        this.scratch = new ArrayBuffer(4096);
    }

    trustStore(): N.Struct[]
    {
        if (this.trustStoreHash != nrdp.trustStoreHash) {
            const trustStoreData = nrdp.trustStore;
            const trustBIO = this.BIO_new_mem_buf(trustStoreData, trustStoreData.byteLength);
            this.x509s = [];
            while (true) {
                const x509 = this.PEM_read_bio_X509(trustBIO, undefined, undefined, undefined);
                if (!x509)
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

    public readonly scratch: ArrayBuffer;

    log = nrdp.l;
    assert = nrdp.assert;
    btoa = nrdp.btoa;
    atob = nrdp.atob;
    atoutf8 = nrdp.atoutf8;
    utf8toa = nrdp.utf8toa;
    randomBytes = nrdp_platform.random;
    stacktrace = nrdp.stacktrace;

    createTCPNetworkPipe(options: CreateTCPNetworkPipeOptions): Promise<NetworkPipe> {
        return createNrdpTCPNetworkPipe(options, this);
    }
    createSSLNetworkPipe(options: CreateSSLNetworkPipeOptions): Promise<NetworkPipe> {
        return createNrdpSSLNetworkPipe(options, this);
    }
    concatBuffers(...args: ArrayBuffer[] | Uint8Array[]) {
        // @ts-ignore
        return ArrayBuffer.concat(...args);
    }
    bufferIndexOf = nrdp_platform.indexOf;
    bufferLastIndexOf = nrdp_platform.lastIndexOf;
    lookupDnsHost = nrdp.dns.lookupHost.bind(nrdp.dns);

    get UILanguages(): string[] { return nrdp.device.UILanguages; }
    get location(): string { return nrdp.gibbon.location; }

    quit(exitCode: number = 0): void { nrdp.exit(exitCode); }
};

export default new NrdpPlatform;
