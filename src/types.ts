export type CompressionMethod = "zlib" | "zlibbase64" | "zlibgzip" | "lzham" | "lz4";
export type DnsType = "lookup" | "cache" | "literal" | "hostsFile" | "unknown" | "preresolved";
export type EncodingType = "escaped" | "base32" | "base64" | "base64_urlsafe" | "base85" | "url" | "hex" | "utf8";
export type HTTPMethod = "POST" | "HEAD" | "PUT" | "DELETE" | "PATCH" | "GET";
export type HTTPRequestHeaders = { [key: string]: any };
export type HashType = "sha1" | "sha256" | "sha512" | "md5";
export type IpConnectivityMode = 4 | 6 | 10 | 0; // 0 is invalid, 10 is dual
export type IpVersion = 4 | 6;
export type CompressionStreamMethod = "zlib" | "gzip";
export type CompressionStreamType = "compress" | "uncompress";

export const enum ErrorCode {
    None = 0
};

export type EventListenerCallback = (...args: any[]) => void;

export const enum RequestId {
    Min = 16777216,
    Max = 9007199254740991
}

export const enum CookieFlag {
    None = 0x0,
    HttpOnly = 0x1,
    Trusted = 0x2
};

export const enum HTTPEncoding {
    Chunked = 1,
    Compress = 2,
    Deflate = 3,
    Gzip = 4,
    Identity = 5
};

export const enum RequestResponseDnsType {
    DNS_Unknown = 0,
    DNS_Literal = 1,
    DNS_HostsFile = 2,
    DNS_Lookup = 3,
    DNS_CacheHit = 4,
    DNS_Preresolved = 5
};

export const enum NetError {
    // Should be in sync with NetErrorInternal.h
    SUCCESS = 0,
    NO_IP_ADDRESS = 1,
    CONNECTIVITY_ERROR = 2,
    NAMERESOLVEERROR = 3,
    SSLERROR = 4,
    CRLOCSPERROR = 5,
    HTTP_ERROR = 6,
    DNS_CHECK = 7,
    UNKNOWN_ERROR = 8,
    NOTSECUREERROR = 1,
    FILEACCESSERROR = 2,
    DATAURIERROR = 3,
    CONNECT_ERROR = 4,
    TIMEOUTERROR = 5,
    DNS_ERROR = 6,
    SSLHANDSHAKEERROR = 7,
    SSLCACERTERROR = 8,
    SSLCACERTFILEERROR = 9,
    CERTSTATUSSSLERROR = 10,
    CERTSTATUSREVOKED = 11,
    CERTSTATUSPEWREVOKED = 12,
    SENDERROR = 13,
    RECVERROR = 14,
    COMPRESSIONERROR = 15,
    NO_DNS_SERVER = 16,
    NETWORKERROR = 17,
    SECURITYERROR = 18,
    INVALIDHASH_ERROR = 20,
    ABORTED = 21,
    INVALID_PLATFORMHASH_ERROR = 22,
    SSLGENERICERROR = 23
}

export const enum NetworkErrorCode {
    BadContentLength,
    BadHeader,
    BadStatusLine,
    ChunkyError,
    ConnectFailure,
    ConnectTimeout,
    ContentLengthTooLong,
    DnsError,
    InvalidIpAddress,
    InvalidIpVersion,
    InvalidUrl,
    NotImplemented,
    SSLConnectFailure,
    SocketReadError,
    SocketWriteError,
    Timeout,
    TooManyRedirects,
    UnknownError,
    ZeroLengthWrite,
};

export function networkErrorCodeToString(code: NetworkErrorCode): string {
    switch (code) {
    case NetworkErrorCode.BadContentLength: return "Bad content length";
    case NetworkErrorCode.BadHeader: return "Bad header";
    case NetworkErrorCode.BadStatusLine: return "Bad HTTP1x status line";
    case NetworkErrorCode.ChunkyError: return "Chunky error";
    case NetworkErrorCode.ConnectFailure: return "Connect failure";
    case NetworkErrorCode.ConnectTimeout: return "Connect timeout";
    case NetworkErrorCode.ContentLengthTooLong: return "Content length too long";
    case NetworkErrorCode.DnsError: return "Dns error";
    case NetworkErrorCode.InvalidIpAddress: return "Invalid ip address";
    case NetworkErrorCode.InvalidIpVersion: return "Invalid ip version";
    case NetworkErrorCode.InvalidUrl: return "Invalid url";
    case NetworkErrorCode.NotImplemented: return "Not implemented";
    case NetworkErrorCode.SSLConnectFailure: return "SSL connect failure";
    case NetworkErrorCode.SocketReadError: return "Socket read error";
    case NetworkErrorCode.SocketWriteError: return "Socket write error";
    case NetworkErrorCode.Timeout: return "Request timeout";
    case NetworkErrorCode.Timeout: return "Timeout";
    case NetworkErrorCode.TooManyRedirects: return "Too many redirects";
    case NetworkErrorCode.UnknownError: return "Unknown error";
    case NetworkErrorCode.ZeroLengthWrite: return "Zero length write";
    }
}
