export type CompressionMethod = "zlib" | "zlibbase64" | "zlibgzip" | "lzham" | "lz4";
export type DnsType = "lookup" | "cache" | "literal" | "hostsFile" | "unknown" | "preresolved";
export type EncodingType = "escaped" | "base32" | "base64" | "base64_urlsafe" | "base85" | "url" | "hex" | "utf8";
export type HTTPMethod = "POST" | "HEAD" | "PUT" | "DELETE" | "PATCH" | "GET";
export type HTTPRequestHeaders = { [key: string]: any };
export type HashType = "sha1" | "sha256" | "sha512" | "md5";
export type IpConnectivityMode = 4 | 6 | 10 | 0; // 0 is invalid, 10 is dual
export type IpVersion = 4 | 6;

export enum ErrorCode {
    None = 0
};

export type EventListenerCallback = (...args: any[]) => void;

export enum HTTPTransferEncoding {
    None = 0x00,
    Chunked = 0x01,
    Compress = 0x02,
    Deflate = 0x04,
    Gzip = 0x08,
    Identity = 0x10
};

export enum RequestResponseDnsType {
    DNS_Unknown = 0,
    DNS_Literal = 1,
    DNS_HostsFile = 2,
    DNS_Lookup = 3,
    DNS_CacheHit = 4,
    DNS_Preresolved = 5
};
