import IDataBuffer from "../IDataBuffer";
import IPlatform from "../IPlatform";
import IUnorderedMap from "../IUnorderedMap";
import N = nrdsocket;

type ASN1_INTEGER_to_BN_type = (ai: N.Struct, bn: N.Struct) => N.Struct | undefined;
type BIO_ctrl_type = (bp: N.Struct, cmd: number, larg: number, parg: N.DataPointer | undefined) => number;
type BIO_ctrl_pending_type = (b: N.Struct) => number;
type BIO_ctrl_wpending_type = (b: N.Struct) => number;
type BIO_free_type = (a: N.Struct) => number;
type BIO_int_ctrl_type = (bp: N.Struct, cmd: number, larg: number, iarg: number) => number;
type BIO_new_type = (ctx: N.Struct) => N.Struct | undefined;
type BIO_new_mem_buf_type = (buf: ArrayBuffer | Uint8Array | IDataBuffer, len: number) => N.Struct | undefined;
type BIO_new_socket_type = (sock: number, closeFlag: number) => N.Struct | undefined;
/* tslint:disable:max-line-length */
type BIO_read_type = (b: N.Struct, data: ArrayBuffer | Uint8Array | IDataBuffer, offset: number, length: number) => number;
type BIO_s_mem_type = () => N.Struct | undefined;
/* tslint:disable:max-line-length */
type BIO_write_type = (b: N.Struct, data: ArrayBuffer | Uint8Array | IDataBuffer | string, offset: number, length: number) => number;
type BN_bn2hex_type = (a: N.Struct) => N.DataPointer | undefined;
type BN_free_type = (a: N.Struct) => void;
type CRYPTO_free_type = (ptr: N.DataPointer|N.ConstDataPointer|N.Struct, file: string, line: number) => void;
type ERR_error_string_n_type = (e: number, buf: ArrayBuffer | Uint8Array | IDataBuffer, len: number) => void;
type OPENSSL_sk_num_type = (chain: N.Struct) => number;
type OPENSSL_sk_value_type = (chain: N.Struct, index: number) => N.Struct | undefined;
/* tslint:disable:max-line-length */
type PEM_read_bio_X509_type = (bp: N.Struct, x: N.DataPointer | undefined, cb: N.Struct | undefined, u: N.DataPointer | undefined) => N.Struct | undefined;
type SSL_connect_type = (ssl: N.Struct) => number;
type SSL_CTX_ctrl_type = (ctx: N.Struct, cmd: number, larg: number, parg: N.DataPointer | undefined) => number;
type SSL_CTX_free_type = (ctx: N.Struct) => void;
type SSL_CTX_get_cert_store_type = (ctx: N.Struct) => N.Struct | undefined;
type SSL_CTX_new_type = (method: N.Struct) => N.Struct | undefined;
type SSL_CTX_set_cipher_list_type = (ctx: N.Struct, str: string) => number;
type SSL_CTX_set_options_type = (ctx: N.Struct, options: number) => number;
type SSL_CTX_set_verify_type = (ctx: N.Struct, mode: number, verifyCallback: N.DataPointer | undefined) => void;
type SSL_CTX_set1_param_type = (ctx: N.Struct, vpm: N.Struct) => number;
type SSL_free_type = (ssl: N.Struct) => void;
type SSL_get_error_type = (ssl: N.Struct, ret: number) => number;
type SSL_get_ex_data_X509_STORE_CTX_idx_type = () => number;
type SSL_get_SSL_CTX_type = (ssl: N.Struct) => N.Struct | undefined;
type SSL_get_version_type = (ssl: N.Struct) => N.ConstDataPointer;
type SSL_new_type = (ctx: N.Struct) => N.Struct | undefined;
type SSL_pending_type = (ssl: N.Struct) => number;
/* tslint:disable:max-line-length */
type SSL_read_type = (ssl: N.Struct, buf: ArrayBuffer | Uint8Array | IDataBuffer, offset: number, length: number) => number;
type SSL_session_reused_type = (ssl: N.Struct) => number;
type SSL_set_bio_type = (ssl: N.Struct, rbio: N.Struct | N.BIO, wbio: N.Struct | N.BIO) => void;
type SSL_set_default_read_buffer_len_type = (s: N.Struct, len: number) => void;
type SSL_set_read_ahead_type = (s: N.Struct, yes: number) => void;
type SSL_up_ref_type = (s: N.Struct) => number;
/* tslint:disable:max-line-length */
type SSL_write_type = (ssl: N.Struct, buf: ArrayBuffer | Uint8Array | IDataBuffer | string, offset: number, num: number) => number;
type TLS_client_method_type = () => N.Struct | undefined;
type X509_free_type = (x509: N.Struct) => void;
type X509_get_issuer_name_type = (a: N.Struct) => N.Struct | undefined;
type X509_get_serialNumber_type = (a: N.Struct) => N.Struct | undefined;
type X509_get_subject_name_type = (a: N.Struct) => N.Struct | undefined;
type X509_getm_notAfter_type = (a: N.Struct) => N.Struct | undefined;
type X509_getm_notBefore_type = (a: N.Struct) => N.Struct | undefined;
/* tslint:disable:max-line-length */
type X509_NAME_oneline_type = (a: N.Struct, buf: ArrayBuffer | Uint8Array | IDataBuffer, size: number) => N.DataPointer | undefined;
type X509_STORE_add_cert_type = (ctx: N.Struct, x: N.Struct) => number;
type X509_STORE_CTX_get_ex_data_type = (struct: N.Struct, idx: number) => N.Struct | undefined;
type X509_STORE_CTX_get0_chain_type = (ctx: N.Struct) => N.Struct | undefined;
type X509_VERIFY_PARAM_free_type = (param: N.Struct) => void;
type X509_VERIFY_PARAM_new_type = () => N.Struct | undefined;
type X509_VERIFY_PARAM_set_time_type = (param: N.Struct, t: number) => void;


export default class NrdpSSLBoundFunctions {
    /* tslint:disable:variable-name */
    public ASN1_INTEGER_to_BN : ASN1_INTEGER_to_BN_type
    public BIO_ctrl : BIO_ctrl_type
    public BIO_ctrl_pending : BIO_ctrl_pending_type
    public BIO_ctrl_wpending : BIO_ctrl_wpending_type
    public BIO_free : BIO_free_type
    public BIO_int_ctrl : BIO_int_ctrl_type
    public BIO_new : BIO_new_type
    public BIO_new_mem_buf : BIO_new_mem_buf_type
    public BIO_new_socket : BIO_new_socket_type
    public BIO_read : BIO_read_type
    public BIO_s_mem : BIO_s_mem_type
    public BIO_write : BIO_write_type
    public BN_bn2hex : BN_bn2hex_type
    public BN_free : BN_free_type
    public CRYPTO_free : CRYPTO_free_type
    public ERR_error_string_n : ERR_error_string_n_type
    public OPENSSL_sk_num : OPENSSL_sk_num_type
    public OPENSSL_sk_value : OPENSSL_sk_value_type
    public PEM_read_bio_X509 : PEM_read_bio_X509_type
    public SSL_connect : SSL_connect_type
    public SSL_CTX_ctrl : SSL_CTX_ctrl_type
    public SSL_CTX_free : SSL_CTX_free_type
    public SSL_CTX_get_cert_store : SSL_CTX_get_cert_store_type
    public SSL_CTX_new : SSL_CTX_new_type
    public SSL_CTX_set_cipher_list : SSL_CTX_set_cipher_list_type
    public SSL_CTX_set_options : SSL_CTX_set_options_type
    public SSL_CTX_set_verify : SSL_CTX_set_verify_type
    public SSL_CTX_set1_param : SSL_CTX_set1_param_type
    public SSL_free : SSL_free_type
    public SSL_get_error : SSL_get_error_type
    public SSL_get_ex_data_X509_STORE_CTX_idx : SSL_get_ex_data_X509_STORE_CTX_idx_type
    public SSL_get_SSL_CTX : SSL_get_SSL_CTX_type
    public SSL_get_version : SSL_get_version_type
    public SSL_new : SSL_new_type
    public SSL_pending : SSL_pending_type
    public SSL_read : SSL_read_type
    public SSL_session_reused : SSL_session_reused_type
    public SSL_set_bio : SSL_set_bio_type
    public SSL_set_default_read_buffer_len : SSL_set_default_read_buffer_len_type
    public SSL_set_read_ahead : SSL_set_read_ahead_type
    public SSL_up_ref : SSL_up_ref_type
    public SSL_write : SSL_write_type
    public TLS_client_method : TLS_client_method_type
    public X509_free : X509_free_type
    public X509_get_issuer_name : X509_get_issuer_name_type
    public X509_get_serialNumber : X509_get_serialNumber_type
    public X509_get_subject_name : X509_get_subject_name_type
    public X509_getm_notAfter : X509_getm_notAfter_type
    public X509_getm_notBefore : X509_getm_notBefore_type
    public X509_NAME_oneline : X509_NAME_oneline_type
    public X509_STORE_add_cert : X509_STORE_add_cert_type
    public X509_STORE_CTX_get_ex_data : X509_STORE_CTX_get_ex_data_type
    public X509_STORE_CTX_get0_chain : X509_STORE_CTX_get0_chain_type
    public X509_VERIFY_PARAM_free : X509_VERIFY_PARAM_free_type
    public X509_VERIFY_PARAM_new : X509_VERIFY_PARAM_new_type
    public X509_VERIFY_PARAM_set_time : X509_VERIFY_PARAM_set_time_type

    public readonly BIO_C_SET_BUF_MEM_EOF_RETURN = 130;
    public readonly SSL_CTRL_MODE = 33;
    public readonly SSL_CTRL_SET_MAX_PROTO_VERSION = 124;
    public readonly SSL_ERROR_NONE = 0;
    public readonly SSL_ERROR_SSL = 1;
    public readonly SSL_ERROR_SYSCALL = 5;
    public readonly SSL_ERROR_WANT_ACCEPT = 8;
    public readonly SSL_ERROR_WANT_ASYNC = 9;
    public readonly SSL_ERROR_WANT_ASYNC_JOB = 10;
    public readonly SSL_ERROR_WANT_CLIENT_HELLO_CB = 11;
    public readonly SSL_ERROR_WANT_CONNECT = 7;
    public readonly SSL_ERROR_WANT_READ = 2;
    public readonly SSL_ERROR_WANT_WRITE = 3;
    public readonly SSL_ERROR_WANT_X509_LOOKUP = 4;
    public readonly SSL_ERROR_ZERO_RETURN = 6;
    public readonly SSL_MODE_ACCEPT_MOVING_WRITE_BUFFER = 0x00000002;
    public readonly SSL_MODE_RELEASE_BUFFERS = 0x00000010;
    public readonly SSL_OP_ALL = 0x80000854;
    public readonly SSL_OP_CIPHER_SERVER_PREFERENCE = 0x00400000;
    public readonly SSL_OP_NO_SSLv2 = 0x0;
    public readonly SSL_OP_NO_SSLv3 = 0x02000000;
    public readonly SSL_OP_NO_TLSv1 = 0x04000000;
    public readonly SSL_OP_NO_TLSv1_1 = 0x10000000;
    public readonly SSL_VERIFY_PEER = 0x01;
    public readonly TLS1_2_VERSION = 0x0303;
    public readonly TLS1_3_VERSION = 0x0304;

    constructor() {
        /* tslint:disable:max-line-length */
        this.ASN1_INTEGER_to_BN = N.bindFunction<ASN1_INTEGER_to_BN_type>("BIGNUM *ASN1_INTEGER_to_BN(const ASN1_INTEGER *ai, BIGNUM *bn);");
        this.BIO_ctrl = N.bindFunction<BIO_ctrl_type>("long BIO_ctrl(BIO *bp, int cmd, long larg, void *parg);");
        this.BIO_ctrl_pending = N.bindFunction<BIO_ctrl_pending_type>("size_t BIO_ctrl_pending(BIO *b);");
        this.BIO_ctrl_wpending = N.bindFunction<BIO_ctrl_wpending_type>("size_t BIO_ctrl_wpending(BIO *b);");
        this.BIO_free = N.bindFunction<BIO_free_type>("int BIO_free(BIO *a);");
        /* tslint:disable:max-line-length */
        this.BIO_int_ctrl = N.bindFunction<BIO_int_ctrl_type>("long BIO_int_ctrl(BIO *bp, int cmd, long larg, int iarg);");
        this.BIO_new = N.bindFunction<BIO_new_type>("BIO *BIO_new(const BIO_METHOD *type);");
        this.BIO_new_mem_buf = N.bindFunction<BIO_new_mem_buf_type>("BIO *BIO_new_mem_buf(const void *buf, int len);");
        this.BIO_new_socket = N.bindFunction<BIO_new_socket_type>("BIO *BIO_new_socket(int sock, int close_flag);");
        this.BIO_read = N.bindFunction<BIO_read_type>("int BIO_read(BIO *b, Buffer *data);");
        this.BIO_s_mem = N.bindFunction<BIO_s_mem_type>("const BIO_METHOD *BIO_s_mem();");
        this.BIO_write = N.bindFunction<BIO_write_type>("int BIO_write(BIO *b, const Buffer *buf);");
        this.BN_bn2hex = N.bindFunction<BN_bn2hex_type>("char *BN_bn2hex(const BIGNUM *a);");
        this.BN_free = N.bindFunction<BN_free_type>("void BN_free(BIGNUM *a);");
        this.CRYPTO_free = N.bindFunction<CRYPTO_free_type>("void CRYPTO_free(void *ptr, const char *file, int line);");
        /* tslint:disable:max-line-length */
        this.ERR_error_string_n = N.bindFunction<ERR_error_string_n_type>("void ERR_error_string_n(unsigned long e, char *buf, size_t len);");
        this.OPENSSL_sk_num = N.bindFunction<OPENSSL_sk_num_type>("int OPENSSL_sk_num(const OPENSSL_STACK *stack);");
        /* tslint:disable:max-line-length */
        this.OPENSSL_sk_value = N.bindFunction<OPENSSL_sk_value_type>("Struct *OPENSSL_sk_value(const OPENSSL_STACK *stack, size_t index);");
        /* tslint:disable:max-line-length */
        this.PEM_read_bio_X509 = N.bindFunction<PEM_read_bio_X509_type>("X509 *PEM_read_bio_X509(BIO *bp, X509 **x, pem_password_cb *cb, void *u);");
        this.SSL_connect = N.bindFunction<SSL_connect_type>("int SSL_connect(SSL *ssl);");
        /* tslint:disable:max-line-length */
        this.SSL_CTX_ctrl = N.bindFunction<SSL_CTX_ctrl_type>("long SSL_CTX_ctrl(SSL_CTX *ctx, int cmd, long larg, void *parg);");
        this.SSL_CTX_free = N.bindFunction<SSL_CTX_free_type>("void SSL_CTX_free(SSL_CTX *ctx);");
        /* tslint:disable:max-line-length */
        this.SSL_CTX_get_cert_store = N.bindFunction<SSL_CTX_get_cert_store_type>("X509_STORE *SSL_CTX_get_cert_store(const SSL_CTX *ctx);");
        this.SSL_CTX_new = N.bindFunction<SSL_CTX_new_type>("SSL_CTX *SSL_CTX_new(const SSL_METHOD *method);");
        /* tslint:disable:max-line-length */
        this.SSL_CTX_set_cipher_list = N.bindFunction<SSL_CTX_set_cipher_list_type>("int SSL_CTX_set_cipher_list(SSL_CTX *ctx, const char *str);");
        /* tslint:disable:max-line-length */
        this.SSL_CTX_set_options = N.bindFunction<SSL_CTX_set_options_type>("long SSL_CTX_set_options(SSL_CTX *ctx, long options);");
        /* tslint:disable:max-line-length */
        this.SSL_CTX_set_verify = N.bindFunction<SSL_CTX_set_verify_type>("void SSL_CTX_set_verify(SSL_CTX *ctx, int mode, SSL_verify_cb verify_callback);");
        /* tslint:disable:max-line-length */
        this.SSL_CTX_set1_param = N.bindFunction<SSL_CTX_set1_param_type>("int SSL_CTX_set1_param(SSL_CTX *ctx, X509_VERIFY_PARAM *vpm)");
        this.SSL_free = N.bindFunction<SSL_free_type>("void SSL_free(SSL *ssl);");
        this.SSL_get_error = N.bindFunction<SSL_get_error_type>("int SSL_get_error(const SSL *ssl, int ret);");
        /* tslint:disable:max-line-length */
        this.SSL_get_ex_data_X509_STORE_CTX_idx = N.bindFunction<SSL_get_ex_data_X509_STORE_CTX_idx_type>("int SSL_get_ex_data_X509_STORE_CTX_idx(void);");
        this.SSL_get_SSL_CTX = N.bindFunction<SSL_get_SSL_CTX_type>("SSL_CTX *SSL_get_SSL_CTX(const SSL *ssl);");
        this.SSL_get_version = N.bindFunction<SSL_get_version_type>("const char *SSL_get_version(const SSL *);");
        this.SSL_new = N.bindFunction<SSL_new_type>("SSL *SSL_new(SSL_CTX *ctx);");
        this.SSL_pending = N.bindFunction<SSL_pending_type>("int SSL_pending(const SSL *ssl);");
        this.SSL_read = N.bindFunction<SSL_read_type>("int SSL_read(SSL *ssl, Buffer *buf);");
        this.SSL_session_reused = N.bindFunction<SSL_session_reused_type>("int SSL_session_reused(SSL *ssl);");
        this.SSL_set_bio = N.bindFunction<SSL_set_bio_type>("void SSL_set_bio(SSL *ssl, BIO *rbio, BIO *wbio);");
        /* tslint:disable:max-line-length */
        this.SSL_set_default_read_buffer_len = N.bindFunction<SSL_set_default_read_buffer_len_type>("void SSL_set_default_read_buffer_len(SSL *s, size_t len);");
        this.SSL_set_read_ahead = N.bindFunction<SSL_set_read_ahead_type>("void SSL_set_read_ahead(SSL *s, int yes);");
        this.SSL_up_ref = N.bindFunction<SSL_up_ref_type>("int SSL_up_ref(SSL *s);");
        this.SSL_write = N.bindFunction<SSL_write_type>("int SSL_write(SSL *ssl, const Buffer *buf);");
        this.TLS_client_method = N.bindFunction<TLS_client_method_type>("const SSL_METHOD *TLS_client_method(void);");
        this.X509_free = N.bindFunction<X509_free_type>("void X509_free(X509 *a);");
        /* tslint:disable:max-line-length */
        this.X509_get_issuer_name = N.bindFunction<X509_get_issuer_name_type>("X509_NAME *X509_get_issuer_name(const X509 *a);");
        /* tslint:disable:max-line-length */
        this.X509_get_serialNumber = N.bindFunction<X509_get_serialNumber_type>("ASN1_INTEGER *X509_get_serialNumber(const X509 *a);");
        /* tslint:disable:max-line-length */
        this.X509_get_subject_name = N.bindFunction<X509_get_subject_name_type>("X509_NAME *X509_get_subject_name(const X509 *a);");
        /* tslint:disable:max-line-length */
        this.X509_getm_notAfter = N.bindFunction<X509_getm_notAfter_type>("ASN1_TIME *X509_getm_notAfter(const X509 *x);");
        /* tslint:disable:max-line-length */
        this.X509_getm_notBefore = N.bindFunction<X509_getm_notBefore_type>("ASN1_TIME *X509_getm_notBefore(const X509 *x);");
        /* tslint:disable:max-line-length */
        this.X509_NAME_oneline = N.bindFunction<X509_NAME_oneline_type>("char *X509_NAME_oneline(const X509_NAME *a, char *buf, int size);");
        /* tslint:disable:max-line-length */
        this.X509_STORE_add_cert = N.bindFunction<X509_STORE_add_cert_type>("int X509_STORE_add_cert(X509_STORE *ctx, X509 *x);");
        /* tslint:disable:max-line-length */
        this.X509_STORE_CTX_get_ex_data = N.bindFunction<X509_STORE_CTX_get_ex_data_type>("Struct *X509_STORE_CTX_get_ex_data(Struct *struct, int idx);");
        /* tslint:disable:max-line-length */
        this.X509_STORE_CTX_get0_chain = N.bindFunction<X509_STORE_CTX_get0_chain_type>("Struct *X509_STORE_CTX_get0_chain(X509_STORE_CTX *ctx);");
        /* tslint:disable:max-line-length */
        this.X509_VERIFY_PARAM_free = N.bindFunction<X509_VERIFY_PARAM_free_type>("void X509_VERIFY_PARAM_free(X509_VERIFY_PARAM *param);");
        /* tslint:disable:max-line-length */
        this.X509_VERIFY_PARAM_new = N.bindFunction<X509_VERIFY_PARAM_new_type>("X509_VERIFY_PARAM *X509_VERIFY_PARAM_new(void);");
        /* tslint:disable:max-line-length */
        this.X509_VERIFY_PARAM_set_time = N.bindFunction<X509_VERIFY_PARAM_set_time_type>("void X509_VERIFY_PARAM_set_time(X509_VERIFY_PARAM *param, time_t t);");
    }
};
