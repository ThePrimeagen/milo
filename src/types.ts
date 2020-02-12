export type IpVersion = 4 | 6;
export type IpConnectivityMode = 4 | 6 | 10 | 0; // 0 is invalid, 10 is dual
export type HTTPMethod = "POST" | "HEAD" | "PUT" | "DELETE" | "PATCH" | "GET";
export type HTTPRequestHeaders = { [key: string]: string };
export type encodingType = "escaped" | "base32" | "base64" | "base64_urlsafe" | "base85" | "url" | "hex";
export type hashType = "sha1" | "sha256" | "sha512" | "md5";
export type compressionMethod = "zlib" | "zlibbase64" | "zlibgzip" | "lzham" | "lz4";

export enum ErrorCode {
    None = 0
};

export interface DataBuffer {
    byteLength: number;
    byteOffset: number;
    bufferLength: number;
    readonly refCount: number;

    detach(): DataBuffer;
    clear(): void;

    left(length: number): DataBuffer;
    right(length: number): DataBuffer;
    mid(offset?: number, length?: number): DataBuffer;

    slice(offset?: number, length?: number): DataBuffer; // deep copy

    indexOf(needle: string | ArrayBuffer | DataBuffer | number | Uint8Array,
            offset?: number, length?: number, caseInsensitive?: boolean): number;
    lastIndexOf(needle: string | ArrayBuffer | DataBuffer | number | Uint8Array,
                offset?: number, length?: number, caseInsensitive?: boolean): number;
    includes(needle: string | ArrayBuffer | DataBuffer | number | Uint8Array,
             offset?: number, length?: number, caseInsensitive?: boolean): boolean;
    equals(other: string | ArrayBuffer | DataBuffer | Uint8Array): boolean;
    fill(data: string | ArrayBuffer | DataBuffer | number | Uint8Array,
         offset?: number, length?: number): void;
    toString(offset?: number, length?: number, enc?: encodingType): string;
    encode(enc: encodingType, offset?: number, length?: number): DataBuffer;
    decode(enc: encodingType, offset?: number, length?: number): DataBuffer;
    hash(hash: hashType, offset?: number, length?: number): DataBuffer;
    hashToString(hash: hashType, offset?: number, length?: number): string;
    compress(method: compressionMethod, offset?: number, length?: number): DataBuffer;
    uncompress(method: compressionMethod, offset?: number, length?: number): string;
    random(offset?: number, length?: number): void;

    toArrayBuffer(offset?: number, length?: number): ArrayBuffer;
    toArray(offset?: number, length?: number): [number];
    reverse(): void;

    sort(func?: (l: number, r: number) => number): void;
    every(func: (val: number, i: number, buffer: DataBuffer) => boolean, thisValue?: any): boolean;
    filter(func: (val: number, i: number, buffer: DataBuffer) => boolean, thisValue?: any): DataBuffer;
    forEach(func: (val: number, i: number, buffer: DataBuffer) => void, thisValue?: any): void;
    join(separator?: string): string;
    map(func: (val: number, i: number, buffer: DataBuffer) => number, thisValue?: any): DataBuffer;
    reduce(func: (previousValue: any, val: number, i: number, buffer: DataBuffer) => any, previousValue?: any): any;
    reduceRight(func: (previousValue: any, val: number, i: number, buffer: DataBuffer) => any, previousValue?: any): any;

    find(func: (val: number, i: number, buffer: DataBuffer) => boolean, thisValue?: any): number | undefined;
    findIndex(func: (val: number, i: number, buffer: DataBuffer) => boolean, thisValue?: any): number | undefined;

    get(offset: number): number;
    set(offset: number, src: string | ArrayBuffer | DataBuffer | number | Uint8Array, srcOffset?: number, srcLength?: number): void;

    getUIntLE(offset: number, byteLength: 1 | 2 | 3 | 4 | 5 | 6): number;
    getUIntBE(offset: number, byteLength: 1 | 2 | 3 | 4 | 5 | 6): number;
    getIntLE(offset: number, byteLength: 1 | 2 | 3 | 4 | 5 | 6): number;
    getIntBE(offset: number, byteLength: 1 | 2 | 3 | 4 | 5 | 6): number;

    getUInt8(offset: number): number;
    getInt8(offset: number): number;

    getUInt16BE(offset: number): number;
    getUInt16LE(offset: number): number;
    getInt16BE(offset: number): number;
    getInt16LE(offset: number): number;

    getUInt32BE(offset: number): number;
    getUInt32LE(offset: number): number;
    getInt32BE(offset: number): number;
    getInt32LE(offset: number): number;

    getUInt64BE(offset: number): number;
    getUInt64LE(offset: number): number;
    getInt64BE(offset: number): number;
    getInt64LE(offset: number): number;

    getFloat32BE(offset: number): number;
    getFloat32LE(offset: number): number;

    getFloat64BE(offset: number): number;
    getFloat64LE(offset: number): number;

    setUInt8(offset: number): number;
    setInt8(offset: number): number;

    setUInt16BE(offset: number, val: number): number;
    setUInt16LE(offset: number, val: number): number;
    setInt16BE(offset: number, val: number): number;
    setInt16LE(offset: number, val: number): number;

    setUInt32BE(offset: number, val: number): number;
    setUInt32LE(offset: number, val: number): number;
    setInt32BE(offset: number, val: number): number;
    setInt32LE(offset: number, val: number): number;

    setUInt64BE(offset: number, val: number): number;
    setUInt64LE(offset: number, val: number): number;
    setInt64BE(offset: number, val: number): number;
    setInt64LE(offset: number, val: number): number;

    setFloat32BE(offset: number, val: number): number;
    setFloat32LE(offset: number, val: number): number;

    setFloat64BE(offset: number, val: number): number;
    setFloat64LE(offset: number, val: number): number;

    // static concat(...args: ArrayBuffer[] | Uint8Array[] | DataBuffer[]): DataBuffer;
}

type ConcatTypes = ArrayBuffer | Uint8Array | DataBuffer | string;
type DataBufferConstructor = {
    new(bytes: number): DataBuffer;
    new(): DataBuffer;
    new(data: string, encoding?: string): DataBuffer;
    new(data: ArrayBuffer | DataBuffer | Uint8Array, offset?: number, length?: number): DataBuffer;
    concat(...args: ConcatTypes[]): DataBuffer
};

declare global {
    const DataBuffer: DataBufferConstructor;
}

export interface DnsResult {
    errorCode: number;
    host: string;
    error?: string;
    aresCode: number;
    time: number;
    age: number;
    name: string;
    aliases?: [string];
    channel: string;
    ipVersion: IpVersion;
    addresses: [string];
    ttl: number;
    lastTouched?: number;
    state?: string;
    type: string;
};

export interface RequestTimeouts {
    timeout?: number;
    connectTimeout?: number;
    dnsTimeout?: number;
    dnsFallbackTimeoutWaitFor4?: number;
    dnsFallbackTimeoutWaitFor6?: number;
    happyEyeballsHeadStart?: number;
    lowSpeedLimit?: number;
    lowSpeedTime?: number; // ### this is in seconds in curl
    delay?: number;
};

export interface CreateTCPNetworkPipeOptions {
    host: string; // could be an ip literal
    port: number;
    connectTimeout: number;
    dnsTimeout: number;
    ipVersion: IpVersion;
};

export interface CreateSSLNetworkPipeOptions {
    pipe: NetworkPipe;
};

export type OnData = () => void;
export type OnClose = () => void;
export type OnError = (code: number, message: string) => void;
export type OnWritten = () => void;

export interface SHA256Context {
    add(buf: Uint8Array | ArrayBuffer | DataBuffer | string): void;

    final(): ArrayBuffer;
    final(md: ArrayBuffer | Uint8Array | DataBuffer, offset?: number): number;
    reset(): void;
};

export interface NetworkPipe {
    write(buf: DataBuffer | Uint8Array | ArrayBuffer | string, offset: number, length: number, callback?: OnWritten): void;
    write(buf: string, callback?: OnWritten): void;

    read(buf: DataBuffer | Uint8Array | ArrayBuffer, offset: number, length: number): number;

    unread(buf: DataBuffer | Uint8Array | ArrayBuffer): void;

    close(): void;

    readonly closed: boolean;

    readonly firstByteWritten?: number;
    readonly firstByteRead?: number;
    readonly dnsTime?: number;
    readonly connectTime?: number;

    readonly ipAddress: string;
    readonly dns: string; // dns type
    readonly dnsChannel?: string;

    ondata?: OnData;
    onclose?: OnClose;
    onerror?: OnError;
};

export enum HTTPTransferEncoding {
    None = 0x00,
    Chunked = 0x01,
    Compress = 0x02,
    Deflate = 0x04,
    Gzip = 0x08,
    Identity = 0x10
};

export interface HTTPHeadersEvent {
    contentLength?: number;
    headers: string[];
    headersSize: number;
    method: HTTPMethod;
    requestSize: number;
    statusCode: number;
    transferEncoding: HTTPTransferEncoding;
};

export interface HTTPRequest {
    networkStartTime: number,
    url: import('url-parse');
    method: HTTPMethod;
    requestHeaders: HTTPRequestHeaders;
    body?: string | Uint8Array | ArrayBuffer;
};

export interface HTTP {
    httpVersion: string;
    send(pipe: NetworkPipe, request: HTTPRequest): boolean;

    timeToFirstByteRead?: number;
    timeToFirstByteWritten?: number;

    onheaders?: (headers: HTTPHeadersEvent) => void;
    ondata?: (data: DataBuffer, offset: number, length: number) => void;
    onfinished?: () => void;
    onerror?: OnError;
};

export interface Platform {
    sha1(input: string): Uint8Array;
    // base64 encode
    btoa(buffer: Uint8Array | ArrayBuffer | string, returnUint8Array: true): Uint8Array;
    btoa(buffer: Uint8Array | ArrayBuffer | string, returnUint8Array: false | undefined): string;
    btoa(buffer: Uint8Array | ArrayBuffer | string): string;

    // base64 decode
    atob(buffer: Uint8Array | ArrayBuffer | string, returnUint8Array: true): Uint8Array;
    atob(buffer: Uint8Array | ArrayBuffer | string, returnUint8Array: false | undefined): string;
    atob(buffer: Uint8Array | ArrayBuffer | string): string;

    // string to uint8array
    atoutf8(input: Uint8Array | ArrayBuffer | string): Uint8Array;

    // uint8array to string
    utf8toa(input: Uint8Array | ArrayBuffer | string, offset?: number, length?: number): string;

    randomBytes(len: number): Uint8Array

    writeFile(fileName: string, contents: Uint8Array | ArrayBuffer | DataBuffer | string): boolean;

    stacktrace(): string;

    assert(cond: any, message?: string): void;

    trace(...args: any[]): void;
    log(...args: any[]): void;
    error(...args: any[]): void;

    mono(): number;

    ipConnectivityMode: IpConnectivityMode;

    standardHeaders: { [key: string]: string };

    createTCPNetworkPipe(options: CreateTCPNetworkPipeOptions): Promise<NetworkPipe>;
    createSSLNetworkPipe(options: CreateSSLNetworkPipeOptions): Promise<NetworkPipe>;
    createSHA256Context(): SHA256Context;

    bufferConcat(...args: ArrayBuffer[] | Uint8Array[] | DataBuffer[]): ArrayBuffer;

    bufferIndexOf(haystack: Uint8Array | ArrayBuffer | string,
                  haystackOffset: number,
                  haystackLength: number | undefined,
                  needle: Uint8Array | ArrayBuffer | string,
                  needleOffset?: number,
                  needleLength?: number | undefined,
                  caseInsensitive?: boolean): number;
    bufferLastIndexOf(haystack: Uint8Array | ArrayBuffer | string,
                      haystackOffset: number,
                      haystackLength: number | undefined,
                      needle: Uint8Array | ArrayBuffer | string,
                      needleOffset?: number,
                      needleLength?: number | undefined,
                      caseInsensitive?: boolean): number;
    bufferSet(dest: Uint8Array | ArrayBuffer | DataBuffer,
              destOffset: number,
              src: Uint8Array | ArrayBuffer | DataBuffer,
              srcOffset?: number,
              srcLength?: number | undefined): void;

    bufferSet(dest: Uint8Array | ArrayBuffer | DataBuffer,
              destOffset: number,
              src: string): void;

    lookupDnsHost(host: string,
                  ipVersion: IpVersion,
                  timeout: number,
                  callback: (result: DnsResult) => void): void;

    UILanguages: string[];
    location: string;
    scratch: DataBuffer;

    defaultRequestTimeouts: RequestTimeouts;

    quit(exitCode?: number): void;
};
