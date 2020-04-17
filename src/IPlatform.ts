import ConnectionPool from "./ConnectionPool";
import ICompressionStream from "./ICompressionStream";
import ICreateSSLNetworkPipeOptions from "./ICreateSSLNetworkPipeOptions";
import ICreateTCPNetworkPipeOptions from "./ICreateTCPNetworkPipeOptions";
import IDataBuffer from "./IDataBuffer";
import IDnsResult from "./IDnsResult";
import IMilo from "./IMilo";
import IPipeResult from "./IPipeResult";
import IRequestTimeouts from "./IRequestTimeouts";
import ISHA256Context from "./ISHA256Context";
import { CookieJar } from "cookiejar";
import { IpConnectivityMode, IpVersion, CompressionStreamType, CompressionStreamMethod } from "./types";

type ArrayBufferConcatType = Uint8Array | IDataBuffer | ArrayBuffer;

export default interface IPlatform {
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

    bufferSet(dest: Uint8Array | ArrayBuffer | IDataBuffer,
              destOffset: number,
              src: Uint8Array | ArrayBuffer | IDataBuffer,
              srcOffset?: number,
              srcLength?: number): void;

    bufferSet(dest: Uint8Array | ArrayBuffer | IDataBuffer,
              destOffset: number,
              src: string): void;

    arrayBufferConcat(...buffers: ArrayBufferConcatType[]): ArrayBuffer;
    randomBytes(len: number): Uint8Array

    writeFile(fileName: string, contents: Uint8Array | ArrayBuffer | IDataBuffer | string): boolean;

    stacktrace(): string;

    trace(...args: any[]): void;
    log(...args: any[]): void;
    error(...args: any[]): void;

    mono(): number;

    ipConnectivityMode: IpConnectivityMode;

    standardHeaders: { [key: string]: string };

    readonly tlsv13SmallAssetsEnabled: boolean;
    readonly tlsv13StreamingEnabled: boolean;
    createTCPNetworkPipe(options: ICreateTCPNetworkPipeOptions): Promise<IPipeResult>;
    createSSLNetworkPipe(options: ICreateSSLNetworkPipeOptions): Promise<IPipeResult>;
    createSHA256Context(): ISHA256Context;
    createCompressionStream(method: CompressionStreamMethod,
                            compress: boolean | CompressionStreamType): ICompressionStream;

    lookupDnsHost(host: string,
                  ipVersion: IpVersion,
                  timeout: number,
                  callback: (result: IDnsResult) => void): void;

    UILanguages: string[];
    location: string;
    scratch: IDataBuffer;

    readonly connectionPool: ConnectionPool;
    readonly cookieJar: CookieJar;
    defaultRequestTimeouts: IRequestTimeouts;

    quit(exitCode?: number): void;

    parseXML(data: string | IDataBuffer): any;
    parseJSONStream(data: string | IDataBuffer): any[] | undefined;
    parseJSON(data: string | IDataBuffer): any | undefined;

    options(key: string): any;

    loadMilo(milo: IMilo): boolean;
};
