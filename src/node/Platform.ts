import ConnectionPool from "../ConnectionPool";
import DataBuffer from "./DataBuffer";
import ICompressionStream from "../ICompressionStream";
import ICreateSSLNetworkPipeOptions from "../ICreateSSLNetworkPipeOptions";
import ICreateTCPNetworkPipeOptions from "../ICreateTCPNetworkPipeOptions";
import IDataBuffer from "../IDataBuffer";
import IDnsResult from "../IDnsResult";
import IMilo from "../IMilo";
import IPipeResult from "../IPipeResult";
import IPlatform from "../IPlatform";
import IRequestData from "../IRequestData";
import ISHA256Context from "../ISHA256Context";
import RequestResponse from "../RequestResponse";
import SHA256Context from "./SHA256Context";
import Url from "url-parse";
import atob from "atob";
import btoa from "btoa";
import createTCPNetworkPipe from "./NodeTCPNetworkPipe";
import dns from "dns";
import fs from "fs";
import sha1 from "sha1";
// import { CookieAccessInfo, CookieJar } from "cookiejar";
import { IpVersion, HTTPRequestHeaders, IpConnectivityMode, CompressionStreamMethod, CompressionStreamType } from "../types";
import { toUint8Array } from "./utils";

declare var global: any;
declare global {
    let milo: IMilo | undefined
}

type ArrayBufferConcatType = Uint8Array | IDataBuffer | ArrayBuffer;

function toBuffer(buf: Uint8Array | ArrayBuffer | string | IDataBuffer) {
    if (buf instanceof DataBuffer) {
        return buf.buffer.slice(buf.byteOffset, buf.byteLength + buf.byteOffset);
    }
    // @ts-ignore
    return Buffer.from(buf);
}

function bufferToString(buf: Uint8Array | ArrayBuffer): string {
    if (buf instanceof Uint8Array) {
        // @ts-ignore
        return String.fromCharCode.apply(null, buf);
    }

    // @ts-ignore
    return String.fromCharCode.apply(null, new Uint8Array(buf));
}

function normalizeLength(buf: string | Uint8Array | ArrayBuffer): number {
    if (typeof buf === 'string') {
        return buf.length;
    }

    return buf.byteLength;
}

class NodePlatform implements IPlatform {
    public location: string = "?";
    public defaultRequestTimeouts = {};
    public standardHeaders: HTTPRequestHeaders = {};
    public scratch: IDataBuffer;
    public UILanguages: string[] = ['en'];
    public readonly ipConnectivityMode: IpConnectivityMode;
    public readonly tlsv13SmallAssetsEnabled: boolean = true;
    public readonly tlsv13StreamingEnabled: boolean = true;
    public readonly connectionPool: ConnectionPool;
    // public readonly cookieJar: CookieJar;
    // public readonly cookieAccessInfo: CookieAccessInfo;
    public readonly sendSecureCookies = false;

    constructor() {
        this.scratch = new DataBuffer(1024 * 32);

        // TODO: probably need to think about this.
        // TODO: Pipe this through to net
        this.ipConnectivityMode = 4;
        this.connectionPool = new ConnectionPool();
        // this.cookieJar = new CookieJar();
        // this.cookieAccessInfo = new CookieAccessInfo("");
    }

    quit(code: number) {
        process.exit(code);
    }

    utf8Length(str: string): number {
        return Buffer.from(str, "utf8").byteLength;
    }

    // One down, 40 to go
    sha1(input: string): Uint8Array {
        const buf = Buffer.from(sha1(input), 'hex');
        return buf;
    }

    createSHA256Context(): ISHA256Context {
        return new SHA256Context() as ISHA256Context;
    }

    createCompressionStream(method: CompressionStreamMethod,
                            compress: boolean | CompressionStreamType): ICompressionStream {
        throw new Error("Gotta implement this");
    }

    writeFile(fileName: string, contents: Uint8Array | ArrayBuffer | string): boolean {
        try {
            fs.writeFileSync(fileName, contents);
        } catch (err) {
            return false;
        }
        return true;
    }

    cookies(url: Url): string | undefined { return undefined; }
    processCookie(url: Url, value: string): void {
        /* */
    }


    mono() {
        return Date.now();
    }

    serverTime() {
        return Date.now();
    }

    stacktrace(): string {
        let out: string;

        try {
            throw new Error();
        } catch (e) {
            out = e.stack.toString();
        }

        return out;
    }

    // @ts-ignore
    btoa(buffer: Uint8Array | ArrayBuffer | IDataBuffer | string,
         returnUint8Array?: boolean): string | Uint8Array {
        let out;
        if (typeof buffer === 'string') {
            out = btoa(buffer);
        }
        else {
            const buf = Buffer.from(buffer);
            out = btoa(buf);
        }

        if (returnUint8Array) {
            return toUint8Array(out);
        }

        return out;
    }

    // base64 decode
    // @ts-ignore
    atob(buffer: Uint8Array | ArrayBuffer | IDataBuffer | string,
         returnUint8Array: false | undefined): string | Uint8Array {
        let out;
        if (typeof buffer === 'string') {
            out = atob(buffer);
        }
        else {
            out = atob(Buffer.from(buffer).toString());
        }

        if (returnUint8Array) {
            return toUint8Array(out);
        }

        return out;
    }

    // string to uint8array
    atoutf8(input: IDataBuffer | Uint8Array | ArrayBuffer | string): Uint8Array {
        return toUint8Array(input);
    }

    // TODO: Assumes Ascii
    utf8toa(input: IDataBuffer | Uint8Array | ArrayBuffer | string, offset?: number, length?: number): string {
        if (typeof input === 'string') {
            return input.substr(offset || 0, length || input.length);
        }

        let buf: Uint8Array;
        if (input instanceof ArrayBuffer) {
            buf = new Uint8Array(input);
        }

        else if (input instanceof Uint8Array) {
            buf = input;
        }

        else {
            buf = new Uint8Array(input.toArrayBuffer());
        }

        if (offset !== undefined) {
            const l = length === undefined ? normalizeLength(buf) : length;
            buf = buf.slice(offset, l);
        }

        // @ts-ignore
        return String.fromCharCode.apply(null, buf);
    }

    bufferSet(dest: Uint8Array | ArrayBuffer | IDataBuffer, destOffset: number,
              src: Uint8Array | ArrayBuffer | IDataBuffer | string,
              srcOffset?: number, srcLength?: number): void {

        const destBuf = toBuffer(dest);

        const srcBuf = toBuffer(src);

        srcBuf.copy(destBuf, destOffset, srcOffset, srcLength);
    }


    arrayBufferConcat(...buffers: ArrayBufferConcatType[]): ArrayBuffer {
        let len = 0;
        for (const b of buffers) {
            len += b.byteLength;
        }
        const ret = Buffer.allocUnsafe(len);
        let idx = 0;
        for (const b of buffers) {
            let buf: Buffer;
            let offset = 0;
            let bufferLen;
            if (b instanceof DataBuffer) {
                buf = (b as DataBuffer).buffer;
                offset = (b as DataBuffer).byteOffset;
                bufferLen = (b as DataBuffer).byteLength;
            } else if (b instanceof Uint8Array) {
                buf = Buffer.from(b as Uint8Array);
                bufferLen = buf.byteLength;
            } else {
                buf = Buffer.from(b as ArrayBuffer);
                bufferLen = buf.byteLength;
            }
            buf.copy(ret, idx, offset, bufferLen);
            idx += bufferLen;
        }

        return ret.buffer;
    }

    randomBytes(len: number): Uint8Array {
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; ++i) {
            bytes[i] = Math.floor(Math.random() * 256);
        }
        return bytes;
    }

    log(...args: any): void {
        /* tslint:disable:no-console */
        console.log.apply(console, args);
    }

    trace(...args: any) { // this is NRDP trace, not console.trace
        /* tslint:disable:no-console */
        console.log(...args);
    }

    error(...args: any): void {
        /* tslint:disable:no-console */
        console.error.apply(console, args);
    }

    createSSLNetworkPipe(options: ICreateSSLNetworkPipeOptions): Promise<IPipeResult> {
        throw new Error("Really not implementetd...");
    }

    createTCPNetworkPipe(options: ICreateTCPNetworkPipeOptions): Promise<IPipeResult> {
        // @ts-ignore
        return createTCPNetworkPipe(this, options);
    }

    lookupDnsHost(host: string, ipVersion: IpVersion, timeout: number, callback: (result: IDnsResult) => void): void {
        dns.lookup(host, {
            family: ipVersion
        }, (err, address, family) => {
            const res = {} as IDnsResult;
            if (err) {
                // @ts-ignore
                res.errorCode = err.errno;
                res.error = err.message;
                return res;
            }

            res.host = address;
            res.addresses = [address];

            // @ts-ignore
            // we don't worry about ipv5
            res.ipVersion = family;
            res.type = "lookup";

            callback(res);
        });
    }

    parseXML(data: string | IDataBuffer): any {
        throw new Error("FIX CRAZY XML PARSING FROM NRDP");
    }

    parseJSONStream(data: string | IDataBuffer): any[] | undefined {
        if (typeof data !== "string")
            data = data.toString();

        try {
            const parsed = JSON.parse(data);
            return [parsed];
        } catch (err) {
            // need to handle json streams but it's gonna suck
        }
        return undefined;
    }

    parseJSON(data: string | IDataBuffer): any | undefined {
        if (typeof data !== "string")
            data = data.toString();
        try {
            const parsed = JSON.parse(data);
            return parsed;
        } catch (err) {
            /**/
        }
        return undefined;
    }

    options(key: string): any {
        return undefined;
    }


    loadMilo(milo: IMilo): boolean {
        global.milo = milo;
        return true;
    }
}

export default new NodePlatform();
