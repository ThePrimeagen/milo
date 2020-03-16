import { IDataBuffer, IUnorderedMap, IPlatform } from "../types";
import DataBuffer from "./DataBuffer";
import UnorderedMap from "./UnorderedMap";
import N = nrdsocket;

type BIO_ctrl_pending_type = (b: N.Struct) => number;
type BIO_ctrl_type = (bp: N.Struct, cmd: number, larg: number, parg: N.DataPointer | undefined) => number;
type BIO_ctrl_wpending_type = (b: N.Struct) => number;
type BIO_free_type = (a: N.Struct) => number;
type BIO_int_ctrl_type = (bp: N.Struct, cmd: number, larg: number, iarg: number) => number;
type BIO_new_mem_buf_type = (buf: ArrayBuffer | Uint8Array | IDataBuffer, len: number) => N.Struct;
type BIO_new_socket_type = (sock: number, closeFlag: number) => N.Struct;
type BIO_new_type = (ctx: N.Struct) => N.Struct;
type BIO_read_type = (b: N.Struct, data: ArrayBuffer | Uint8Array | IDataBuffer,
                      offset: number, dlen: number) => number;
type BIO_s_mem_type = () => N.Struct;
type BIO_write_type = (b: N.Struct, data: ArrayBuffer | Uint8Array | IDataBuffer | string,
                       offset: number, dlen: number) => number;
type ERR_error_string_n_type = (e: number, buf: ArrayBuffer | Uint8Array | IDataBuffer, len: number) => void;
type PEM_read_bio_X509_type = (bp: N.Struct, x: N.DataPointer | undefined, cb: N.Struct | undefined,
                               u: ArrayBuffer | Uint8Array | IDataBuffer | undefined) => N.Struct;
type SSL_CTX_ctrl_type = (ctx: N.Struct, cmd: number, larg: number,
                          parg: ArrayBuffer | Uint8Array | IDataBuffer | undefined) => number;
type SSL_CTX_free_type = (ctx: N.Struct) => void;
type SSL_CTX_get_cert_store_type = (ctx: N.Struct) => N.Struct;
type SSL_CTX_new_type = (method: N.Struct) => N.Struct;
type SSL_CTX_set1_param_type = (ctx: N.Struct, vpm: N.Struct) => number;
type SSL_CTX_set_cipher_list_type = (ctx: N.Struct, str: string) => number;
type SSL_CTX_set_options_type = (ctx: N.Struct, options: number) => number;
type SSL_CTX_set_verify_type = (ctx: N.Struct, mode: number, verifyCallback: N.DataPointer) => void;
type SSL_connect_type = (ssl: N.Struct) => number;
type SSL_free_type = (ssl: N.Struct) => void;
type SSL_get_error_type = (ssl: N.Struct, ret: number) => number;
type SSL_get_ex_data_X509_STORE_CTX_idx_type = () => number;
type SSL_get_SSL_CTX_type = (ssl: N.Struct) => N.Struct;
type SSL_new_type = (ctx: N.Struct) => N.Struct;
type SSL_pending_type = (ssl: N.Struct) => number;
type SSL_read_type = (ssl: N.Struct, buf: ArrayBuffer | Uint8Array | IDataBuffer,
                      offset: number, num: number) => number;
type SSL_set_bio_type = (ssl: N.Struct, rbio: N.Struct | N.BIO, wbio: N.Struct | N.BIO) => void;
type SSL_set_default_read_buffer_len_type = (s: N.Struct, len: number) => void;
type SSL_set_read_ahead_type = (s: N.Struct, yes: number) => void;
type SSL_up_ref_type = (s: N.Struct) => number;
type SSL_write_type = (ssl: N.Struct, buf: ArrayBuffer | Uint8Array | IDataBuffer | string,
                       offset: number, num: number) => number;
type TLS_client_method_type = () => N.Struct;
type X509_STORE_CTX_get_ex_data_type = (struct: N.Struct, idx: number) => N.Struct;
type X509_STORE_add_cert_type = (ctx: N.Struct, x: N.Struct) => number;
type X509_VERIFY_PARAM_free_type = (param: N.Struct) => void;
type X509_VERIFY_PARAM_new_type = () => N.Struct;
type X509_VERIFY_PARAM_set_time_type = (param: N.Struct, t: number) => void;
type X509_free_type = (x509: N.Struct) => void;

type SSL_CTX_verify_callback_type = (preverifyOk: number) => number;

export class NrdpSSL {

    private platform: IPlatform;
    private trustStoreHash: string;
    private x509s: N.Struct[];
    private sslCtx?: N.Struct;
    private ERRstringBuf: IDataBuffer;

    private verifyCallbackContexts: IUnorderedMap<N.Struct, SSL_CTX_verify_callback_type>;
    private sslCtxVerifyCallback: N.DataPointer;

    /* tslint:disable:variable-name */
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
    public SSL_get_ex_data_X509_STORE_CTX_idx: SSL_get_ex_data_X509_STORE_CTX_idx_type;
    public SSL_get_SSL_CTX: SSL_get_SSL_CTX_type;
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
    public X509_STORE_CTX_get_ex_data: X509_STORE_CTX_get_ex_data_type;
    public X509_VERIFY_PARAM_free: X509_VERIFY_PARAM_free_type;
    public X509_VERIFY_PARAM_new: X509_VERIFY_PARAM_new_type;
    public X509_VERIFY_PARAM_set_time: X509_VERIFY_PARAM_set_time_type;
    public X509_free: X509_free_type;

    public readonly SSL_CTRL_MODE = 33;

    public readonly X509_V_OK = 0;
    public readonly X509_V_ERR_UNSPECIFIED = 1;
    public readonly X509_V_ERR_UNABLE_TO_GET_ISSUER_CERT = 2;
    public readonly X509_V_ERR_UNABLE_TO_GET_CRL = 3;
    public readonly X509_V_ERR_UNABLE_TO_DECRYPT_CERT_SIGNATURE = 4;
    public readonly X509_V_ERR_UNABLE_TO_DECRYPT_CRL_SIGNATURE = 5;
    public readonly X509_V_ERR_UNABLE_TO_DECODE_ISSUER_PUBLIC_KEY = 6;
    public readonly X509_V_ERR_CERT_SIGNATURE_FAILURE = 7;
    public readonly X509_V_ERR_CRL_SIGNATURE_FAILURE = 8;
    public readonly X509_V_ERR_CERT_NOT_YET_VALID = 9;
    public readonly X509_V_ERR_CERT_HAS_EXPIRED = 10;
    public readonly X509_V_ERR_CRL_NOT_YET_VALID = 11;
    public readonly X509_V_ERR_CRL_HAS_EXPIRED = 12;
    public readonly X509_V_ERR_ERROR_IN_CERT_NOT_BEFORE_FIELD = 13;
    public readonly X509_V_ERR_ERROR_IN_CERT_NOT_AFTER_FIELD = 14;
    public readonly X509_V_ERR_ERROR_IN_CRL_LAST_UPDATE_FIELD = 15;
    public readonly X509_V_ERR_ERROR_IN_CRL_NEXT_UPDATE_FIELD = 16;
    public readonly X509_V_ERR_OUT_OF_MEM = 17;
    public readonly X509_V_ERR_DEPTH_ZERO_SELF_SIGNED_CERT = 18;
    public readonly X509_V_ERR_SELF_SIGNED_CERT_IN_CHAIN = 19;
    public readonly X509_V_ERR_UNABLE_TO_GET_ISSUER_CERT_LOCALLY = 20;
    public readonly X509_V_ERR_UNABLE_TO_VERIFY_LEAF_SIGNATURE = 21;
    public readonly X509_V_ERR_CERT_CHAIN_TOO_LONG = 22;
    public readonly X509_V_ERR_CERT_REVOKED = 23;
    public readonly X509_V_ERR_INVALID_CA = 24;
    public readonly X509_V_ERR_PATH_LENGTH_EXCEEDED = 25;
    public readonly X509_V_ERR_INVALID_PURPOSE = 26;
    public readonly X509_V_ERR_CERT_UNTRUSTED = 27;
    public readonly X509_V_ERR_CERT_REJECTED = 28;
    public readonly X509_V_ERR_SUBJECT_ISSUER_MISMATCH = 29;
    public readonly X509_V_ERR_AKID_SKID_MISMATCH = 30;
    public readonly X509_V_ERR_AKID_ISSUER_SERIAL_MISMATCH = 31;
    public readonly X509_V_ERR_KEYUSAGE_NO_CERTSIGN = 32;
    public readonly X509_V_ERR_UNABLE_TO_GET_CRL_ISSUER = 33;
    public readonly X509_V_ERR_UNHANDLED_CRITICAL_EXTENSION = 34;
    public readonly X509_V_ERR_KEYUSAGE_NO_CRL_SIGN = 35;
    public readonly X509_V_ERR_UNHANDLED_CRITICAL_CRL_EXTENSION = 36;
    public readonly X509_V_ERR_INVALID_NON_CA = 37;
    public readonly X509_V_ERR_PROXY_PATH_LENGTH_EXCEEDED = 38;
    public readonly X509_V_ERR_KEYUSAGE_NO_DIGITAL_SIGNATURE = 39;
    public readonly X509_V_ERR_PROXY_CERTIFICATES_NOT_ALLOWED = 40;
    public readonly X509_V_ERR_INVALID_EXTENSION = 41;
    public readonly X509_V_ERR_INVALID_POLICY_EXTENSION = 42;
    public readonly X509_V_ERR_NO_EXPLICIT_POLICY = 43;
    public readonly X509_V_ERR_DIFFERENT_CRL_SCOPE = 44;
    public readonly X509_V_ERR_UNSUPPORTED_EXTENSION_FEATURE = 45;
    public readonly X509_V_ERR_UNNESTED_RESOURCE = 46;
    public readonly X509_V_ERR_PERMITTED_VIOLATION = 47;
    public readonly X509_V_ERR_EXCLUDED_VIOLATION = 48;
    public readonly X509_V_ERR_SUBTREE_MINMAX = 49;
    public readonly X509_V_ERR_APPLICATION_VERIFICATION = 50;
    public readonly X509_V_ERR_UNSUPPORTED_CONSTRAINT_TYPE = 51;
    public readonly X509_V_ERR_UNSUPPORTED_CONSTRAINT_SYNTAX = 52;
    public readonly X509_V_ERR_UNSUPPORTED_NAME_SYNTAX = 53;
    public readonly X509_V_ERR_CRL_PATH_VALIDATION_ERROR = 54;
    public readonly X509_V_ERR_PATH_LOOP = 55;
    public readonly X509_V_ERR_SUITE_B_INVALID_VERSION = 56;
    public readonly X509_V_ERR_SUITE_B_INVALID_ALGORITHM = 57;
    public readonly X509_V_ERR_SUITE_B_INVALID_CURVE = 58;
    public readonly X509_V_ERR_SUITE_B_INVALID_SIGNATURE_ALGORITHM = 59;
    public readonly X509_V_ERR_SUITE_B_LOS_NOT_ALLOWED = 60;
    public readonly X509_V_ERR_SUITE_B_CANNOT_SIGN_P_384_WITH_P_256 = 61;
    public readonly X509_V_ERR_HOSTNAME_MISMATCH = 62;
    public readonly X509_V_ERR_EMAIL_MISMATCH = 63;
    public readonly X509_V_ERR_IP_ADDRESS_MISMATCH = 64;
    public readonly X509_V_ERR_DANE_NO_MATCH = 65;
    public readonly X509_V_ERR_EE_KEY_TOO_SMALL = 66;
    public readonly X509_V_ERR_CA_KEY_TOO_SMALL = 67;
    public readonly X509_V_ERR_CA_MD_TOO_WEAK = 68;
    public readonly X509_V_ERR_INVALID_CALL = 69;
    public readonly X509_V_ERR_STORE_LOOKUP = 70;
    public readonly X509_V_ERR_NO_VALID_SCTS = 71;
    public readonly X509_V_ERR_PROXY_SUBJECT_NAME_VIOLATION = 72;
    public readonly X509_V_ERR_OCSP_VERIFY_NEEDED = 73;
    public readonly X509_V_ERR_OCSP_VERIFY_FAILED = 74;
    public readonly X509_V_ERR_OCSP_CERT_UNKNOWN = 75;

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

    public readonly SSL_VERIFY_NONE = 0x00;
    public readonly SSL_VERIFY_PEER = 0x01;
    public readonly SSL_VERIFY_FAIL_IF_NO_PEER_CERT = 0x02;
    public readonly SSL_VERIFY_CLIENT_ONCE = 0x04;
    public readonly SSL_VERIFY_POST_HANDSHAKE = 0x08;

    constructor(platform: IPlatform) {
        this.platform = platform;
        this.ERRstringBuf = new DataBuffer(128);
        this.trustStoreHash = "";
        this.x509s = [];
        // this.BIO_set_mem_eof_return = <BIO_set_mem_eof_return_type>
        //                               N.bindFunction("void BIO_set_mem_eof_return(BIO *b, int v);");
        this.BIO_ctrl = N.bindFunction<BIO_ctrl_type>("long BIO_ctrl(BIO *bp, int cmd, long larg, void *parg);");
        this.BIO_ctrl_pending = N.bindFunction<BIO_ctrl_pending_type>("size_t BIO_ctrl_pending(BIO *b);");
        this.BIO_ctrl_wpending = N.bindFunction<BIO_ctrl_wpending_type>("size_t BIO_ctrl_wpending(BIO *b);");
        this.BIO_free = N.bindFunction<BIO_free_type>("int BIO_free(BIO *a);");
        this.BIO_int_ctrl = N.bindFunction<BIO_int_ctrl_type>("long BIO_int_ctrl(BIO *bp, int cmd, long larg, int iarg);");
        this.BIO_new = N.bindFunction<BIO_new_type>("BIO *BIO_new(const BIO_METHOD *type);");
        this.BIO_new_mem_buf = N.bindFunction<BIO_new_mem_buf_type>("BIO *BIO_new_mem_buf(const void *buf, int len);");
        this.BIO_new_socket = N.bindFunction<BIO_new_socket_type>("BIO *BIO_new_socket(int sock, int close_flag);");
        this.BIO_read = N.bindFunction<BIO_read_type>("int BIO_read(BIO *b, Buffer *data);");
        this.BIO_s_mem = N.bindFunction<BIO_s_mem_type>("const BIO_METHOD *BIO_s_mem();");
        this.BIO_write = N.bindFunction<BIO_write_type>("int BIO_write(BIO *b, const Buffer *buf);");
        this.ERR_error_string_n = N.bindFunction<ERR_error_string_n_type>("void ERR_error_string_n(unsigned long e, char *buf, size_t len);");
        this.PEM_read_bio_X509 = N.bindFunction<PEM_read_bio_X509_type>("X509 *PEM_read_bio_X509(BIO *bp, X509 **x, pem_password_cb *cb, void *u);");
        this.SSL_CTX_ctrl = N.bindFunction<SSL_CTX_ctrl_type>("long SSL_CTX_ctrl(SSL_CTX *ctx, int cmd, long larg, void *parg);");
        this.SSL_CTX_free = N.bindFunction<SSL_CTX_free_type>("void SSL_CTX_free(SSL_CTX *ctx);");
        this.SSL_CTX_get_cert_store = N.bindFunction<SSL_CTX_get_cert_store_type>("X509_STORE *SSL_CTX_get_cert_store(const SSL_CTX *ctx);");
        this.SSL_CTX_new = N.bindFunction<SSL_CTX_new_type>("SSL_CTX *SSL_CTX_new(const SSL_METHOD *method);");
        this.SSL_CTX_set1_param = N.bindFunction<SSL_CTX_set1_param_type>("int SSL_CTX_set1_param(SSL_CTX *ctx, X509_VERIFY_PARAM *vpm)");
        this.SSL_CTX_set_cipher_list = N.bindFunction<SSL_CTX_set_cipher_list_type>("int SSL_CTX_set_cipher_list(SSL_CTX *ctx, const char *str);");
        this.SSL_CTX_set_options = N.bindFunction<SSL_CTX_set_options_type>("long SSL_CTX_set_options(SSL_CTX *ctx, long options);");
        this.SSL_CTX_set_verify = N.bindFunction<SSL_CTX_set_verify_type>("void SSL_CTX_set_verify(SSL_CTX *ctx, int mode, SSL_verify_cb verify_callback);");
        this.SSL_connect = N.bindFunction<SSL_connect_type>("int SSL_connect(SSL *ssl);");
        this.SSL_free = N.bindFunction<SSL_free_type>("void SSL_free(SSL *ssl);");
        this.SSL_get_error = N.bindFunction<SSL_get_error_type>("int SSL_get_error(const SSL *ssl, int ret);");
        this.SSL_get_ex_data_X509_STORE_CTX_idx = N.bindFunction<SSL_get_ex_data_X509_STORE_CTX_idx_type>("int SSL_get_ex_data_X509_STORE_CTX_idx(void);");
        this.SSL_get_SSL_CTX = N.bindFunction<SSL_get_SSL_CTX_type>("SSL_CTX *SSL_get_SSL_CTX(const SSL *ssl);");
        this.SSL_new = N.bindFunction<SSL_new_type>("SSL *SSL_new(SSL_CTX *ctx);");
        this.SSL_pending = N.bindFunction<SSL_pending_type>("int SSL_pending(const SSL *ssl);");
        this.SSL_read = N.bindFunction<SSL_read_type>("int SSL_read(SSL *ssl, Buffer *buf);");
        this.SSL_set_bio = N.bindFunction<SSL_set_bio_type>("void SSL_set_bio(SSL *ssl, BIO *rbio, BIO *wbio);");
        this.SSL_set_default_read_buffer_len = N.bindFunction<SSL_set_default_read_buffer_len_type>("void SSL_set_default_read_buffer_len(SSL *s, size_t len);");
        this.SSL_set_read_ahead = N.bindFunction<SSL_set_read_ahead_type>("void SSL_set_read_ahead(SSL *s, int yes);");
        this.SSL_up_ref = N.bindFunction<SSL_up_ref_type>("int SSL_up_ref(SSL *s);");
        this.SSL_write = N.bindFunction<SSL_write_type>("int SSL_write(SSL *ssl, const Buffer *buf);");
        this.TLS_client_method = N.bindFunction<TLS_client_method_type>("const SSL_METHOD *TLS_client_method(void);");
        // we bind this one with struct pointers event though the API
        // actually takes void * because we spefically want it to find
        // our existing SSL *
        this.X509_STORE_CTX_get_ex_data = N.bindFunction<X509_STORE_CTX_get_ex_data_type>("Struct *X509_STORE_CTX_get_ex_data(Struct *struct, int idx);");
        this.X509_STORE_add_cert = N.bindFunction<X509_STORE_add_cert_type>("int X509_STORE_add_cert(X509_STORE *ctx, X509 *x);");
        this.X509_VERIFY_PARAM_free = N.bindFunction<X509_VERIFY_PARAM_free_type>("void X509_VERIFY_PARAM_free(X509_VERIFY_PARAM *param);");
        this.X509_VERIFY_PARAM_new = N.bindFunction<X509_VERIFY_PARAM_new_type>("X509_VERIFY_PARAM *X509_VERIFY_PARAM_new(void);");
        this.X509_VERIFY_PARAM_set_time = N.bindFunction<X509_VERIFY_PARAM_set_time_type>("void X509_VERIFY_PARAM_set_time(X509_VERIFY_PARAM *param, time_t t);");
        this.X509_free = N.bindFunction<X509_free_type>("void X509_free(X509 *a);");

        this.sslCtxVerifyCallback = N.setSSLCallback("SSL_verify_cb", (preverifyOk: number, x509Ctx: N.Struct) => {
            this.platform.log("ballsack", typeof x509Ctx,
                              this.SSL_get_ex_data_X509_STORE_CTX_idx(),
                              typeof this.SSL_get_ex_data_X509_STORE_CTX_idx());
            const ssl: N.Struct = this.X509_STORE_CTX_get_ex_data(x509Ctx, this.SSL_get_ex_data_X509_STORE_CTX_idx());
            nrdp.assert(ssl);
            const sslInitialCtx: N.Struct = this.SSL_get_SSL_CTX(ssl);
            nrdp.assert(sslInitialCtx);
            const cb = this.verifyCallbackContexts.get(sslInitialCtx);
            if (cb) {
                preverifyOk = cb(preverifyOk);
            }
            return preverifyOk;
        });

        this.verifyCallbackContexts = new UnorderedMap();
    }
    SSL_CTX_set_verify_callback(ctx: N.Struct, cb: (preverifyOk: number) => number): void {
        nrdp.assert(!this.verifyCallbackContexts.has(ctx));
        this.verifyCallbackContexts.set(ctx, cb);
        this.SSL_CTX_set_verify(ctx, this.SSL_VERIFY_PEER, this.sslCtxVerifyCallback);
    }

    public createSSL() {
        if (!this.sslCtx || this.trustStoreHash !== nrdp.trustStoreHash) {
            const meth = this.TLS_client_method();
            this.sslCtx = this.SSL_CTX_new(meth);
            this.sslCtx.free = "SSL_CTX_free";
            this.SSL_CTX_set_verify_callback(this.sslCtx, (preverifyOk: number) => {
                return preverifyOk;
            });
            this.platform.trace("cipher", nrdp.cipherList);
            this.SSL_CTX_set_cipher_list(this.sslCtx, nrdp.cipherList);
            let retVal = this.SSL_CTX_ctrl(this.sslCtx, this.SSL_CTRL_MODE,
                                           this.SSL_MODE_RELEASE_BUFFERS,
                                           // | this.platform.SSL_MODE_AUTO_RETRY,
                                           undefined);
            const ctxOptions = (this.SSL_OP_ALL |
                                this.SSL_OP_NO_TLSv1 |
                                this.SSL_OP_NO_SSLv2 |
                                this.SSL_OP_NO_SSLv3 |
                                this.SSL_OP_CIPHER_SERVER_PREFERENCE);

            retVal = this.SSL_CTX_set_options(this.sslCtx, ctxOptions);

            const certStore = this.SSL_CTX_get_cert_store(this.sslCtx);
            const trustStoreData = nrdp.trustStore;
            const trustBIO = this.BIO_new_mem_buf(trustStoreData, trustStoreData.byteLength);
            while (true) {
                const x509 = this.PEM_read_bio_X509(trustBIO, undefined, undefined, undefined);
                if (!x509)
                    break;
                x509.free = "X509_free";
                this.X509_STORE_add_cert(certStore, x509);
            }
            this.BIO_free(trustBIO);
            this.trustStoreHash = nrdp.trustStoreHash;
        }

        const param = this.X509_VERIFY_PARAM_new();
        this.X509_VERIFY_PARAM_set_time(param, Math.round(nrdp.now() / 1000));
        this.SSL_CTX_set1_param(this.sslCtx, param);
        this.X509_VERIFY_PARAM_free(param);

        const ret = this.SSL_new(this.sslCtx);
        this.SSL_set_default_read_buffer_len(ret, 16384);
        this.SSL_set_read_ahead(ret, 1);
        ret.free = "SSL_free";
        return ret;
    }

    ERR_error_string(error: number): string {
        this.ERR_error_string_n(error, this.ERRstringBuf, this.ERRstringBuf.byteLength);
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
};
