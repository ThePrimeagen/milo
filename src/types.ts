import NetworkPipe from "./NetworkPipe";
export type IpVersion = 4 | 6;
export type IpConnectivityMode = 4 | 6 | 10 | 0; // 0 is invalid, 10 is dual
export type HTTPMethod = "POST" | "HEAD" | "PUT" | "DELETE" | "PATCH" | "GET";
export type HTTPRequestHeaders = { [key: string]: string };
export type encodingType = "escaped" | "base32" | "base64" | "base64_urlsafe" | "base85" | "url" | "hex" | "utf8";
export type hashType = "sha1" | "sha256" | "sha512" | "md5";
export type compressionMethod = "zlib" | "zlibbase64" | "zlibgzip" | "lzham" | "lz4";

export enum ErrorCode {
    None = 0
};

export interface IUnorderedMap<Key, Value> {
    clear(): void;
    clone(): IUnorderedMap<Key, Value>;
    delete(key: Key): boolean;
    entries(): [Key, Value][];
    forEach(func: (key: Key, value: Value, that: IUnorderedMap<Key, Value>) => boolean): void;
    get(key: Key): Value | undefined;
    has(key: Key): boolean;
    keys(): Key[];
    readonly length: number;
    readonly size: number;
    set(key: Key, value: Value): IUnorderedMap<Key, Value>;
    take(key: Key): Value | undefined;
    values(): Value[];
}

export type EventListener = (...args: any[]) => void;

export interface IEventEmitter {
    addListener(event: string, listener: EventListener): this;
    on(event: string, listener: EventListener): this;
    once(event: string, listener: EventListener): this;
    removeListener(event: string, listener: EventListener): this;
    off(event: string, listener: EventListener): this;
    removeAllListeners(event?: string): this;
    listeners(event: string): EventListener[];
    emit(event: string, ...args: any[]): boolean;
    listenerCount(event: string): number;
    prependListener(event: string, listener: EventListener): this;
    prependOnceListener(event: string, listener: EventListener): this;
    eventNames(): string[];
}

export interface IDataBuffer {
    // properties
    bufferLength: number;
    byteLength: number;
    byteOffset: number;
    readonly refCount: number;

    // methods
    clear(): void;
    compare(other: string | ArrayBuffer | IDataBuffer | Uint8Array | number | number[],
            otherByteOffset?: number,
            otherByteLength?: number,
            selfByteOffset?: number,
            selfByteLength?: number): -1 | 0 | 1;
    /**
     * Deep Copy
     */
    compress(method: compressionMethod, offset?: number, length?: number): IDataBuffer;
    /**
     * Deep Copy
     */
    decode(enc: encodingType, offset?: number, length?: number): IDataBuffer;
    detach(): void;
    encode(enc: encodingType, offset?: number, length?: number): IDataBuffer;
    equals(other: string | ArrayBuffer | IDataBuffer | Uint8Array | number | number[]): boolean;
    every(func: (val: number, i: number, buffer: IDataBuffer) => boolean, thisValue?: any): boolean;
    fill(data: string | ArrayBuffer | IDataBuffer | number | Uint8Array,
         offset?: number, length?: number): void;

    /**
     * Deep Copy
     */
    filter(func: (val: number, i: number, buffer: IDataBuffer) => boolean, thisValue?: any): IDataBuffer;
    find(func: (val: number, i: number, buffer: IDataBuffer) => boolean, thisValue?: any): number | undefined;
    findIndex(func: (val: number, i: number, buffer: IDataBuffer) => boolean, thisValue?: any): number | undefined;
    forEach(func: (val: number, i: number, buffer: IDataBuffer) => void, thisValue?: any): void;

    get(offset: number): number;
    getFloat32BE(offset: number): number;
    getFloat32LE(offset: number): number;
    getFloat64BE(offset: number): number;
    getFloat64LE(offset: number): number;
    getInt16BE(offset: number): number;
    getInt16LE(offset: number): number;
    getInt32BE(offset: number): number;
    getInt32LE(offset: number): number;
    getInt64BE(offset: number): number;
    getInt64LE(offset: number): number;
    getInt8(offset: number): number;
    getIntBE(offset: number, byteLength?: 1 | 2 | 3 | 4 | 5 | 6): number;
    getIntLE(offset: number, byteLength?: 1 | 2 | 3 | 4 | 5 | 6): number;
    getUInt16BE(offset: number): number;
    getUInt16LE(offset: number): number;
    getUInt32BE(offset: number): number;
    getUInt32LE(offset: number): number;
    getUInt64BE(offset: number): number;
    getUInt64LE(offset: number): number;
    getUInt8(offset: number): number;
    getUIntBE(offset: number, byteLength?: 1 | 2 | 3 | 4 | 5 | 6): number;
    getUIntLE(offset: number, byteLength?: 1 | 2 | 3 | 4 | 5 | 6): number;

    hash(hash: hashType, offset?: number, length?: number): IDataBuffer;
    hashToString(hash: hashType, offset?: number, length?: number): string;

    includes(needle: string | ArrayBuffer | IDataBuffer | number | Uint8Array | number[],
             offset?: number, length?: number, caseInsensitive?: boolean): boolean;

    indexOf(needle: string | ArrayBuffer | IDataBuffer | number | Uint8Array | number[],
            offset?: number, length?: number, caseInsensitive?: boolean): number;

    isEmpty(): boolean;
    join(separator?: string): string;
    lastIndexOf(needle: string | ArrayBuffer | IDataBuffer | number | Uint8Array | number[],
                offset?: number, length?: number, caseInsensitive?: boolean): number;

    map(func: (val: number, i: number, buffer: IDataBuffer) => number, thisValue?: any): IDataBuffer;
    randomize(offset?: number, length?: number): void;
    reduce(func: (previousValue: any, val: number, i: number,
                  buffer: IDataBuffer) => any, previousValue?: any): any;
    reduceRight(func: (previousValue: any, val: number, i: number,
                       buffer: IDataBuffer) => any, previousValue?: any): any;

    reverse(offset?: number, length?: number): void;

    set(offset: number, src: string | ArrayBuffer | IDataBuffer | number | Uint8Array | number[],
        srcOffset?: number, srcLength?: number): void;
    setFloat32BE(offset: number, val: number): number;
    setFloat32LE(offset: number, val: number): number;
    setFloat64BE(offset: number, val: number): number;
    setFloat64LE(offset: number, val: number): number;
    setInt16BE(offset: number, val: number): number;
    setInt16LE(offset: number, val: number): number;
    setInt32BE(offset: number, val: number): number;
    setInt32LE(offset: number, val: number): number;
    setInt64BE(offset: number, val: number): number;
    setInt64LE(offset: number, val: number): number;
    setInt8(offset: number, val: number): number;
    setIntBE(offset: number, value: number, byteLength?: 1 | 2 | 3 | 4 | 5 | 6): number;
    setIntLE(offset: number, value: number, byteLength?: 1 | 2 | 3 | 4 | 5 | 6): number;
    setUInt16BE(offset: number, val: number): number;
    setUInt16LE(offset: number, val: number): number;
    setUInt32BE(offset: number, val: number): number;
    setUInt32LE(offset: number, val: number): number;
    setUInt64BE(offset: number, val: number): number;
    setUInt64LE(offset: number, val: number): number;
    setUInt8(offset: number, val: number): number;
    setUIntBE(offset: number, value: number, byteLength?: 1 | 2 | 3 | 4 | 5 | 6): number;
    setUIntLE(offset: number, value: number, byteLength?: 1 | 2 | 3 | 4 | 5 | 6): number;

    setView(byteOffset: number, byteLength: number): void;

    /**
     * Deep Copy
     */
    slice(offset?: number, length?: number): IDataBuffer;

    sort(func?: (l: number, r: number) => number): this;

    /**
     * Subarray with length instead of endIdx
     *
     * equivalent to.
     * const offset = this.byteOffset + offset;
     * subarray(offset, offset + length);
     *
     *
     * Shallow Copy
     */
    subarray(offset?: number, length?: number): IDataBuffer;

    toArray(offset?: number, length?: number): number[];

    /**
     * Deep Copy
     */
    toArrayBuffer(offset?: number, length?: number): ArrayBuffer;

    toString(enc?: encodingType, offset?: number, length?: number): string;
    uncompress(method: compressionMethod, offset?: number, length?: number): string;
}

export interface IDnsResult {
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

export interface IRequestTimeouts {
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

export interface ICreateTCPNetworkPipeOptions {
    hostname: string; // could be an ip literal
    port: number;
    connectTimeout: number;
    dnsTimeout: number;
    ipVersion: IpVersion;
};

export interface ICreateSSLNetworkPipeOptions {
    pipe: NetworkPipe;
};

export interface ISHA256Context {
    add(buf: Uint8Array | ArrayBuffer | IDataBuffer | string): void;

    final(): ArrayBuffer;
    final(md: ArrayBuffer | Uint8Array | IDataBuffer, offset?: number): number;
    reset(): void;
};

export enum HTTPTransferEncoding {
    None = 0x00,
    Chunked = 0x01,
    Compress = 0x02,
    Deflate = 0x04,
    Gzip = 0x08,
    Identity = 0x10
};

export interface IHTTPHeadersEvent {
    contentLength?: number;
    headers: string[];
    headersSize: number;
    method: HTTPMethod;
    requestSize: number;
    statusCode: number;
    transferEncoding: HTTPTransferEncoding;
};

export interface IHTTPRequest {
    networkStartTime: number,
    url: import("url-parse");
    method: HTTPMethod;
    requestHeaders: HTTPRequestHeaders;
    body?: string | Uint8Array | ArrayBuffer;
};

export interface IHTTP extends IEventEmitter {
    httpVersion: string;
    send(pipe: NetworkPipe, request: IHTTPRequest): boolean;

    timeToFirstByteRead?: number;
    timeToFirstByteWritten?: number;

    upgrade: boolean;
};

export interface IPlatform {
    // return number of octets
    utf8Length(str: string): number;

    sha1(input: string): Uint8Array;
    // base64 encode
    btoa(buffer: Uint8Array | ArrayBuffer | string, returnUint8Array: true): Uint8Array;
    btoa(buffer: Uint8Array | ArrayBuffer | string, returnUint8Array?: false): string;

    // base64 decode
    atob(buffer: Uint8Array | ArrayBuffer | string, returnUint8Array: true): Uint8Array;
    atob(buffer: Uint8Array | ArrayBuffer | string, returnUint8Array?: false): string;

    // string to uint8array
    atoutf8(input: Uint8Array | ArrayBuffer | string): Uint8Array;

    // uint8array to string
    utf8toa(input: IDataBuffer | Uint8Array | ArrayBuffer | string, offset?: number, length?: number): string;

    randomBytes(len: number): Uint8Array

    writeFile(fileName: string, contents: Uint8Array | ArrayBuffer | IDataBuffer | string): boolean;

    stacktrace(): string;

    assert(cond: any, message?: string): void;

    trace(...args: any[]): void;
    log(...args: any[]): void;
    error(...args: any[]): void;

    mono(): number;

    ipConnectivityMode: IpConnectivityMode;

    standardHeaders: { [key: string]: string };

    createTCPNetworkPipe(options: ICreateTCPNetworkPipeOptions): Promise<NetworkPipe>;
    createSSLNetworkPipe(options: ICreateSSLNetworkPipeOptions): Promise<NetworkPipe>;
    createSHA256Context(): ISHA256Context;

    lookupDnsHost(host: string,
                  ipVersion: IpVersion,
                  timeout: number,
                  callback: (result: IDnsResult) => void): void;

    UILanguages: string[];
    location: string;
    scratch: IDataBuffer;

    defaultRequestTimeouts: IRequestTimeouts;

    quit(exitCode?: number): void;
};
