import fs from "fs";
import dns from "dns";

import { toUint8Array } from "./utils";
import {
    IDnsResult,
    IpVersion,
    IPlatform,
    ICreateTCPNetworkPipeOptions,
    ICreateSSLNetworkPipeOptions,
    ISHA256Context,
    HTTPRequestHeaders,
    IpConnectivityMode
} from "../types";

import NetworkPipe from "../NetworkPipe";
import createTCPNetworkPipe from "./NodeTCPNetworkPipe";

import sha1 from "sha1";
import btoa from "btoa";
import atob from "atob";
import { IDataBuffer } from "../types";
import DataBuffer from "./DataBuffer";
import { ISHA256Context as SC } from "./SHA256Context";

function toBuffer(buf: Uint8Array | ArrayBuffer | string) {
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
    public ipConnectivityMode: IpConnectivityMode;

    constructor() {
        this.scratch = new DataBuffer(1024 * 32);

        // TODO: probably need to think about this.
        // TODO: Pipe this through to net
        this.ipConnectivityMode = 4;
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

    // @ts-ignore
    bufferSet(dest: Uint8Array | ArrayBuffer, destOffset: number,
              src: Uint8Array | ArrayBuffer | string, srcOffset?: number, srcLength?: number): void {

        const destBuf = toBuffer(dest);
        const srcBuf = toBuffer(src);

        srcBuf.copy(destBuf, destOffset, srcOffset, srcLength);
    }

    createSHA256Context(): ISHA256Context {
        return new SC() as ISHA256Context;
    }

    writeFile(fileName: string, contents: Uint8Array | ArrayBuffer | string): boolean {
        fs.writeFileSync(fileName, contents);
        return true;
    }

    mono() {
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
    btoa(buffer: Uint8Array | ArrayBuffer | string, returnUint8Array?: boolean): string | Uint8Array {
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
    atob(buffer: Uint8Array | ArrayBuffer | string, returnUint8Array: false | undefined): string | Uint8Array {
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

    randomBytes(len: number): Uint8Array {
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; ++i) {
            bytes[i] = Math.floor(Math.random() * 256);
        }
        return bytes;
    }

    assert(cond: any, message?: string): void {
        if (process.env.NODE_ENV === 'development') {
            if (!cond) {
                throw new Error(message ? message : 'You dun messed up.');
            }
        }
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

    createSSLNetworkPipe(options: ICreateSSLNetworkPipeOptions): Promise<NetworkPipe> {
        throw new Error("Really not implementetd...");
    }

    createTCPNetworkPipe(options: ICreateTCPNetworkPipeOptions): Promise<NetworkPipe> {
        // @ts-ignore
        return createTCPNetworkPipe(this, options);
    }

    // "heremybigHHTTP string\r\n"
    bufferIndexOf(haystack: Uint8Array | ArrayBuffer | string,
                  haystackOffset: number, haystackLength: number | undefined,
                  needle: Uint8Array | ArrayBuffer | string,
                  needleOffset?: number, needleLength?: number | undefined): number {
        haystackLength = haystackLength !== undefined ? haystackLength : normalizeLength(haystack);
        needleLength = needleLength !== undefined ? needleLength : normalizeLength(needle);
        needleOffset = needleOffset || 0;

        const needleStr = typeof needle === 'string' ?
            needle : bufferToString(needle);

        if (typeof haystack === 'string') {
            return haystack.
                substr(haystackOffset, haystackLength).
                indexOf(needleStr.substr(needleOffset, needleLength));
        }

        const buffer = Buffer.from(haystack).
            slice(haystackOffset, haystackOffset + haystackLength);

        if (typeof needle === 'string') {
            return buffer.
                indexOf(needle.substr(needleOffset, needleLength));
        }

        const needleBuf: Uint8Array = toUint8Array(needle).
            subarray(needleOffset, needleOffset + needleLength);

        return buffer.indexOf(needleBuf);
    }

    bufferLastIndexOf(haystack: Uint8Array | ArrayBuffer | string,
                      haystackOffset: number, haystackLength: number | undefined,
                      needle: Uint8Array | ArrayBuffer | string,
                      needleOffset?: number, needleLength?: number | undefined): number {
        haystackLength = haystackLength !== undefined ? haystackLength : normalizeLength(haystack);
        needleLength = needleLength !== undefined ? needleLength : normalizeLength(needle);
        needleOffset = needleOffset || 0;

        const needleStr = typeof needle === 'string' ?
            needle : bufferToString(needle);

        if (typeof haystack === 'string') {
            return haystack.
                substr(haystackOffset, haystackLength).
                lastIndexOf(needleStr.substr(needleOffset || 0, needleLength));
        }

        const buffer = Buffer.from(haystack).
            slice(haystackOffset, haystackOffset + haystackLength);

        if (typeof needle === 'string') {
            return buffer.
                lastIndexOf(needle.substr(needleOffset, needleLength));
        }

        const needleBuf: Uint8Array = toUint8Array(needle).
            subarray(needleOffset, needleOffset + needleLength);

        return buffer.lastIndexOf(needleBuf);
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
            res.type = "i don't know.";

            callback(res);
        });
    }

}

export default new NodePlatform();
