export type IpVersion = 4 | 6;

export interface DnsResult
{
    errorCode: number;
    host: string;
    error?: string;
    aresCode: number;
    time: number;
    age: number;
    name: string;
    aliases?: [ string ];
    channel: string;
    ipVersion: IpVersion;
    addresses: [ string ];
    ttl: number;
    lastTouched?: number;
    state?: string;
    type: string;
};

export type OnData = () => void;
export type OnClose = () => void;
export type OnError = (code: number, message: string) => void;

export interface NetworkPipe
{
    write(buf: Uint8Array|ArrayBuffer, offset: number, length: number): void;
    write(buf: string): void;

    read(buf: Uint8Array | ArrayBuffer, offset: number, length: number): number;

    close(): void;

    ondata: OnData;
    onclose: OnClose;
    onerror: OnError;
};

export interface Platform
{
    sha1(input: string): Uint8Array;
    // base64 encode
    btoa(buffer: Uint8Array|ArrayBuffer|string, returnUint8Array: true): Uint8Array;
    btoa(buffer: Uint8Array|ArrayBuffer|string, returnUint8Array: false|undefined): string;
    btoa(buffer: Uint8Array|ArrayBuffer|string): string;

    // base64 decode
    atob(buffer: Uint8Array|ArrayBuffer|string, returnUint8Array: true): Uint8Array;
    atob(buffer: Uint8Array|ArrayBuffer|string, returnUint8Array: false|undefined): string;
    atob(buffer: Uint8Array|ArrayBuffer|string): string;

    // string to uint8array
    atoutf8(input: Uint8Array | ArrayBuffer | string): Uint8Array;

    // uint8array to string
    utf8toa(input: Uint8Array | ArrayBuffer | string, offset?: number, length?: number): string;

    randomBytes(len: number): Uint8Array

    assert(cond: any, message?: string): void;

    log(...args: any[]): void;

    createTCPNetworkPipe(hostOrIpAddress: string, port: number): Promise<NetworkPipe>;
    createSSLNetworkPipe(pipe: NetworkPipe): Promise<NetworkPipe>;

    concatBuffers(...args: ArrayBuffer[]|Uint8Array[]): ArrayBuffer;

    bufferIndexOf(haystack: Uint8Array | ArrayBuffer | string, haystackOffset: number, haystackLength: number|undefined,
                  needle: Uint8Array | ArrayBuffer | string, needleOffset?: number, needleLength?: number|undefined): number;
    bufferLastIndexOf(haystack: Uint8Array | ArrayBuffer | string, haystackOffset: number, haystackLength: number|undefined,
                      needle: Uint8Array | ArrayBuffer | string, needleOffset?: number, needleLength?: number|undefined): number;
    lookupDnsHost(host: string,
                  ipVersion: IpVersion,
                  timeout: number,
                  callback: (result: DnsResult) => void): void;
};
