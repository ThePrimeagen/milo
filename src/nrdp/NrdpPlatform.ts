import { CreateSSLNetworkPipeOptions, CreateTCPNetworkPipeOptions, IpConnectivityMode, NetworkPipe, Platform, RequestTimeouts } from "../types";
import nrdp from "./nrdp";
import createNrdpSSLNetworkPipe from "./NrdpSSLNetworkPipe";
import createNrdpTCPNetworkPipe from "./NrdpTCPNetworkPipe";
import nrdp_platform from "./nrdp_platform";
import N from "./ScriptSocket";

type BIO_ctrl_pending_type = (b: N.Struct) => number;
type BIO_ctrl_type = (bp: N.Struct, cmd: number, larg: number, parg: N.DataPointer | undefined) => number;
type BIO_ctrl_wpending_type = (b: N.Struct) => number;
type BIO_free_type = (a: N.Struct) => number;
type BIO_int_ctrl_type = (bp: N.Struct, cmd: number, larg: number, iarg: number) => number;
type BIO_new_mem_buf_type = (buf: ArrayBuffer | Uint8Array, len: number) => N.Struct;
type BIO_new_socket_type = (sock: number, close_flag: number) => N.Struct;
type BIO_new_type = (ctx: N.Struct) => N.Struct;
type BIO_read_type = (b: N.Struct, data: ArrayBuffer | Uint8Array, offset: number, dlen: number) => number;
type BIO_s_mem_type = () => N.Struct;
type BIO_write_type = (b: N.Struct, data: ArrayBuffer | Uint8Array | string, offset: number, dlen: number) => number;
type ERR_error_string_n_type = (e: number, buf: ArrayBuffer | Uint8Array, len: number) => void;
type PEM_read_bio_X509_type = (bp: N.Struct, x: N.DataPointer | undefined, cb: N.Struct | undefined, u: ArrayBuffer | Uint8Array | undefined) => N.Struct;
type SSL_CTX_ctrl_type = (ctx: N.Struct, cmd: number, larg: number, parg: ArrayBuffer | Uint8Array | undefined) => number;
type SSL_CTX_free_type = (ctx: N.Struct) => void;
type SSL_CTX_get_cert_store_type = (ctx: N.Struct) => N.Struct;
type SSL_CTX_new_type = (method: N.Struct) => N.Struct;
type SSL_CTX_set1_param_type = (ctx: N.Struct, vpm: N.Struct) => number;
type SSL_CTX_set_cipher_list_type = (ctx: N.Struct, str: string) => number;
type SSL_CTX_set_options_type = (ctx: N.Struct, options: number) => number;
type SSL_CTX_set_verify_type = (ctx: N.Struct, mode: number, verify_callback: (preverify_ok: number, x509_ctx: N.Struct) => void) => number;
type SSL_connect_type = (ssl: N.Struct) => number;
type SSL_free_type = (ssl: N.Struct) => void;
type SSL_get_error_type = (ssl: N.Struct, ret: number) => number;
type SSL_new_type = (ctx: N.Struct) => N.Struct;
type SSL_pending_type = (ssl: N.Struct) => number;
type SSL_read_type = (ssl: N.Struct, buf: ArrayBuffer | Uint8Array, offset: number, num: number) => number;
type SSL_set_bio_type = (ssl: N.Struct, rbio: N.Struct | N.BIO, wbio: N.Struct | N.BIO) => void;
type SSL_set_default_read_buffer_len_type = (s: N.Struct, len: number) => void;
type SSL_set_read_ahead_type = (s: N.Struct, yes: number) => void;
type SSL_up_ref_type = (s: N.Struct) => number;
type SSL_write_type = (ssl: N.Struct, buf: ArrayBuffer | Uint8Array | string, offset: number, num: number) => number;
type TLS_client_method_type = () => N.Struct;
type X509_STORE_add_cert_type = (ctx: N.Struct, x: N.Struct) => number;
type X509_VERIFY_PARAM_free_type = (param: N.Struct) => void;
type X509_VERIFY_PARAM_new_type = () => N.Struct;
type X509_VERIFY_PARAM_set_time_type = (param: N.Struct, t: number) => void;
type X509_free_type = (x509: N.Struct) => void;

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
    public SSL_CTX_set_cipher_list: SSL_CTX_set_cipher_list_type;
    public SSL_CTX_set_options: SSL_CTX_set_options_type;
    public SSL_CTX_set_verify: SSL_CTX_set_verify_type;
    public SSL_connect: SSL_connect_type;
    public SSL_free: SSL_free_type;
    public SSL_get_error: SSL_get_error_type;
    public SSL_new: SSL_new_type;
    public SSL_pending: SSL_pending_type;
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
    public X509_free: X509_free_type;

    public readonly SSL_CTRL_MODE = 33;

    public readonly SSL_OP_ALLOW_NO_DHE_KEX = 0x00000400;
    public readonly SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION = 0x00040000;
    public readonly SSL_OP_CIPHER_SERVER_PREFERENCE = 0x00400000;
    public readonly SSL_OP_CISCO_ANYCONNECT = 0x00008000;
    public readonly SSL_OP_COOKIE_EXCHANGE = 0x00002000;
    public readonly SSL_OP_CRYPTOPRO_TLSEXT_BUG = 0x80000000;
    public readonly SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS = 0x00000800;
    public readonly SSL_OP_ENABLE_MIDDLEBOX_COMPAT = 0x00100000;
    public readonly SSL_OP_LEGACY_SERVER_CONNECT = 0x00000004;
    public readonly SSL_OP_NO_ANTI_REPLAY = 0x01000000;
    public readonly SSL_OP_NO_COMPRESSION = 0x00020000;
    public readonly SSL_OP_NO_DTLSv1 = 0x04000000;
    public readonly SSL_OP_NO_DTLSv1_2 = 0x08000000;
    public readonly SSL_OP_NO_ENCRYPT_THEN_MAC = 0x00080000;
    public readonly SSL_OP_NO_EXTENDED_MASTER_SECRET = 0x00000001;
    public readonly SSL_OP_NO_QUERY_MTU = 0x00001000;
    public readonly SSL_OP_NO_RENEGOTIATION = 0x40000000;
    public readonly SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION = 0x00010000;
    public readonly SSL_OP_NO_SSLv2 = 0x0;
    public readonly SSL_OP_NO_SSLv3 = 0x02000000;
    public readonly SSL_OP_NO_TICKET = 0x00004000;
    public readonly SSL_OP_NO_TLSv1 = 0x04000000;
    public readonly SSL_OP_NO_TLSv1_1 = 0x10000000;
    public readonly SSL_OP_NO_TLSv1_2 = 0x08000000;
    public readonly SSL_OP_NO_TLSv1_3 = 0x20000000;
    public readonly SSL_OP_PRIORITIZE_CHACHA = 0x00200000;
    public readonly SSL_OP_SAFARI_ECDHE_ECDSA_BUG = 0x00000040;
    public readonly SSL_OP_TLSEXT_PADDING = 0x00000010;
    public readonly SSL_OP_TLS_ROLLBACK_BUG = 0x00800000;
    public readonly SSL_OP_ALL = (this.SSL_OP_CRYPTOPRO_TLSEXT_BUG |
                                  this.SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS |
                                  this.SSL_OP_LEGACY_SERVER_CONNECT |
                                  this.SSL_OP_TLSEXT_PADDING |
                                  this.SSL_OP_SAFARI_ECDHE_ECDSA_BUG);

    public readonly BIO_C_SET_BUF_MEM_EOF_RETURN = 130;

    public readonly SSL_ERROR_NONE = 0;
    public readonly SSL_ERROR_SSL = 1;
    public readonly SSL_ERROR_WANT_READ = 2;
    public readonly SSL_ERROR_WANT_WRITE = 3;
    public readonly SSL_ERROR_WANT_X509_LOOKUP = 4;
    public readonly SSL_ERROR_SYSCALL = 5;
    public readonly SSL_ERROR_ZERO_RETURN = 6;
    public readonly SSL_ERROR_WANT_CONNECT = 7;
    public readonly SSL_ERROR_WANT_ACCEPT = 8;
    public readonly SSL_ERROR_WANT_ASYNC = 9;
    public readonly SSL_ERROR_WANT_ASYNC_JOB = 10;
    public readonly SSL_ERROR_WANT_CLIENT_HELLO_CB = 11;

    public readonly SSL_MODE_ENABLE_PARTIAL_WRITE = 0x00000001;
    public readonly SSL_MODE_ACCEPT_MOVING_WRITE_BUFFER = 0x00000002;
    public readonly SSL_MODE_AUTO_RETRY = 0x00000004;
    public readonly SSL_MODE_NO_AUTO_CHAIN = 0x00000008;
    public readonly SSL_MODE_RELEASE_BUFFERS = 0x00000010;
    public readonly SSL_MODE_SEND_CLIENTHELLO_TIME = 0x00000020;
    public readonly SSL_MODE_SEND_SERVERHELLO_TIME = 0x00000040;
    public readonly SSL_MODE_SEND_FALLBACK_SCSV = 0x00000080;
    public readonly SSL_MODE_ASYNC = 0x00000100;
    public readonly SSL_MODE_NO_KTLS_TX = 0x00000200;
    public readonly SSL_MODE_DTLS_SCTP_LABEL_LENGTH_BUG = 0x00000400;
    public readonly SSL_MODE_NO_KTLS_RX = 0x00000800;

    constructor() {
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
        this.BIO_read = <BIO_read_type>N.bindFunction("int BIO_read(BIO *b, Buffer *data);");
        this.BIO_s_mem = <BIO_s_mem_type>N.bindFunction("const BIO_METHOD *BIO_s_mem();");
        this.BIO_write = <BIO_write_type>N.bindFunction("int BIO_write(BIO *b, const Buffer *buf);");
        this.ERR_error_string_n = <ERR_error_string_n_type>N.bindFunction("void ERR_error_string_n(unsigned long e, char *buf, size_t len);");
        this.PEM_read_bio_X509 = <PEM_read_bio_X509_type>N.bindFunction("X509 *PEM_read_bio_X509(BIO *bp, X509 **x, pem_password_cb *cb, void *u);");
        this.SSL_CTX_ctrl = <SSL_CTX_ctrl_type>N.bindFunction("long SSL_CTX_ctrl(SSL_CTX *ctx, int cmd, long larg, void *parg);");
        this.SSL_CTX_free = <SSL_CTX_free_type>N.bindFunction("void SSL_CTX_free(SSL_CTX *ctx);");
        this.SSL_CTX_get_cert_store = <SSL_CTX_get_cert_store_type>N.bindFunction("X509_STORE *SSL_CTX_get_cert_store(const SSL_CTX *ctx);");
        this.SSL_CTX_new = <SSL_CTX_new_type>N.bindFunction("SSL_CTX *SSL_CTX_new(const SSL_METHOD *method);");
        this.SSL_CTX_set1_param = <SSL_CTX_set1_param_type>N.bindFunction("int SSL_CTX_set1_param(SSL_CTX *ctx, X509_VERIFY_PARAM *vpm)");
        this.SSL_CTX_set_cipher_list = <SSL_CTX_set_cipher_list_type>N.bindFunction("int SSL_CTX_set_cipher_list(SSL_CTX *ctx, const char *str);");
        this.SSL_CTX_set_options = <SSL_CTX_set_options_type>N.bindFunction("long SSL_CTX_set_options(SSL_CTX *ctx, long options);");
        this.SSL_CTX_set_verify = <SSL_CTX_set_verify_type>N.bindFunction("void SSL_CTX_set_verify(SSL_CTX *ctx, int mode, SSL_verify_cb verify_callback);");
        this.SSL_connect = <SSL_connect_type>N.bindFunction("int SSL_connect(SSL *ssl);");
        this.SSL_free = <SSL_free_type>N.bindFunction("void SSL_free(SSL *ssl);");
        this.SSL_get_error = <SSL_get_error_type>N.bindFunction("int SSL_get_error(const SSL *ssl, int ret);");
        this.SSL_new = <SSL_new_type>N.bindFunction("SSL *SSL_new(SSL_CTX *ctx);");
        this.SSL_pending = <SSL_pending_type>N.bindFunction("int SSL_pending(const SSL *ssl);");
        this.SSL_read = <SSL_read_type>N.bindFunction("int SSL_read(SSL *ssl, Buffer *buf);");
        this.SSL_set_bio = <SSL_set_bio_type>N.bindFunction("void SSL_set_bio(SSL *ssl, BIO *rbio, BIO *wbio);");
        this.SSL_set_default_read_buffer_len = <SSL_set_default_read_buffer_len_type>N.bindFunction("void SSL_set_default_read_buffer_len(SSL *s, size_t len);");
        this.SSL_set_read_ahead = <SSL_set_read_ahead_type>N.bindFunction("void SSL_set_read_ahead(SSL *s, int yes);");
        this.SSL_up_ref = <SSL_up_ref_type>N.bindFunction("int SSL_up_ref(SSL *s);");
        this.SSL_write = <SSL_write_type>N.bindFunction("int SSL_write(SSL *ssl, const Buffer *buf);");
        this.TLS_client_method = <TLS_client_method_type>N.bindFunction("const SSL_METHOD *TLS_client_method(void);");
        this.X509_STORE_add_cert = <X509_STORE_add_cert_type>N.bindFunction("int X509_STORE_add_cert(X509_STORE *ctx, X509 *x);");
        this.X509_VERIFY_PARAM_free = <X509_VERIFY_PARAM_free_type>N.bindFunction("void X509_VERIFY_PARAM_free(X509_VERIFY_PARAM *param);");
        this.X509_VERIFY_PARAM_new = <X509_VERIFY_PARAM_new_type>N.bindFunction("X509_VERIFY_PARAM *X509_VERIFY_PARAM_new(void);");
        this.X509_VERIFY_PARAM_set_time = <X509_VERIFY_PARAM_set_time_type>N.bindFunction("void X509_VERIFY_PARAM_set_time(X509_VERIFY_PARAM *param, time_t t);");
        this.X509_free = <X509_free_type>N.bindFunction("void X509_free(X509 *a);");

        this.scratch = new ArrayBuffer(16 * 1024);
    }

    trustStore(): N.Struct[] {
        if (this.trustStoreHash != nrdp.trustStoreHash) {
            const trustStoreData = nrdp.trustStore;
            const trustBIO = this.BIO_new_mem_buf(trustStoreData, trustStoreData.byteLength);
            this.x509s = [];
            while (true) {
                const x509 = this.PEM_read_bio_X509(trustBIO, undefined, undefined, undefined);
                if (!x509)
                    break;
                x509.free = "X509_free";
                this.x509s.push(x509);
            }
            this.BIO_free(trustBIO);
            this.trustStoreHash = nrdp.trustStoreHash;
        }
        return this.x509s;
    }

    ERR_error_string(error: number): string {
        this.ERR_error_string_n(error, this.ERR_stringBuf, this.ERR_stringBuf.byteLength);
        // nrdp.l.success("error", error, ERR_stringBuf);
        let i;
        for (i = 0; i < this.ERR_stringBuf.byteLength; ++i) {
            if (!this.ERR_stringBuf[i]) {
                break;
            }
        }
        // nrdp.l.success("balle", i);
        return nrdp.utf8toa(this.ERR_stringBuf, 0, i);
    }

    sha1(input: string): Uint8Array { return nrdp.hash("sha1", input); }

    public readonly scratch: ArrayBuffer;

    log(...args: any[]): void {
        args.unshift({ traceArea: "MILO" });
        nrdp.l.success.apply(nrdp.l, args);
    }
    error(...args: any[]): void {
        args.unshift({ traceArea: "MILO" });
        nrdp.l.error.apply(nrdp.l, args);
    }
    trace(...args: any[]): void {
        args.unshift({ traceArea: "MILO" });
        nrdp.l.trace.apply(nrdp.l, args);
    }

    get ipConnectivityMode(): IpConnectivityMode {
        switch (nrdp.device.ipConnectivityMode) {
        case "4":
            break;
        case "6":
            return 6;
        case "dual":
            return 10;
        case "invalid":
            return 0;
        }
        return 4;
    }

    get defaultRequestTimeouts(): RequestTimeouts {
        const opts = nrdp.options;
        return {
            timeout: opts.default_network_timeout,
            connectTimeout: opts.default_network_connect_timeout,
            dnsTimeout: opts.default_network_dns_timeout,
            dnsFallbackTimeoutWaitFor4: opts.default_network_dns_fallback_timeout_wait_for_4,
            dnsFallbackTimeoutWaitFor6: opts.default_network_dns_fallback_timeout_wait_for_6,
            happyEyeballsHeadStart: opts.default_network_happy_eyeballs_head_start,
            lowSpeedLimit: opts.default_network_low_speed_limit,
            lowSpeedTime: opts.default_network_low_speed_time,
            delay: opts.default_network_delay
        };
    }

    mono = nrdp.mono;
    assert = nrdp.assert;
    btoa = nrdp.btoa;
    atob = nrdp.atob;
    atoutf8 = nrdp.atoutf8;
    utf8toa = nrdp.utf8toa;
    randomBytes = nrdp_platform.random;
    stacktrace = nrdp.stacktrace;

    writeFile(fileName: string, contents: Uint8Array | ArrayBuffer | string): boolean {
        const fd = N.open(fileName, N.O_CREAT | N.O_WRONLY, 0o0664);
        if (fd === -1) {
            this.error(`Failed to open ${fileName} for writing`, N.errno, N.strerror());
            return false;
        }
        const len = typeof contents === "string" ? contents.length : contents.byteLength;
        const w = N.write(fd, contents);
        N.close(fd);
        if (w != len) {
            this.error(`Failed to write to ${fileName} for writing ${w} vs ${len}`, N.errno, N.strerror());
            return false;
        }
        return true;
    }

    createTCPNetworkPipe(options: CreateTCPNetworkPipeOptions): Promise<NetworkPipe> {
        return createNrdpTCPNetworkPipe(options, this);
    }
    createSSLNetworkPipe(options: CreateSSLNetworkPipeOptions): Promise<NetworkPipe> {
        return createNrdpSSLNetworkPipe(options, this);
    }
    bufferConcat(...args: ArrayBuffer[] | Uint8Array[]) {
        // @ts-ignore
        return ArrayBuffer.concat(...args);
    }

    bufferSet = nrdp_platform.bufferSet;
    bufferIndexOf = nrdp_platform.bufferIndexOf;
    bufferLastIndexOf = nrdp_platform.bufferLastIndexOf;
    lookupDnsHost = nrdp.dns.lookupHost.bind(nrdp.dns);

    get UILanguages(): string[] { return nrdp.device.UILanguages; }
    get location(): string { return nrdp.gibbon.location; }

    quit(exitCode: number = 0): void { nrdp.exit(exitCode); }
};

export default new NrdpPlatform;
