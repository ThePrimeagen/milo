import fs from "fs";

import dns from "dns";

import { toUint8Array } from './utils';
import {
    DnsResult,
    IpVersion,
    Platform,
    NetworkPipe,
    CreateTCPNetworkPipeOptions,
    CreateSSLNetworkPipeOptions,
    SHA256Context,
    HTTPRequestHeaders,
    stringEncoding,
} from "../types";

import createTCPNetworkPipe from "./NodeTCPNetworkPipe";

import sha1 from "sha1";
import btoa from "btoa";
import atob from "atob";
import {DataBuffer} from "../types";
import DB from "./DataBuffer";

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

class NodePlatform implements Platform {
    public location: string = "?";
    public defaultRequestTimeouts = { };
    public standardHeaders: HTTPRequestHeaders = { };
    public scratch: DataBuffer;

    constructor() {
        this.scratch = {} as DataBuffer;
    }

    stringLength(str: string, encoding: stringEncoding): number {
        return Buffer.byteLength(str, encoding);
    }

    // One down, 40 to go
    sha1(input: string): Uint8Array {
        const buf = Buffer.from(sha1(input), 'hex');
        return buf;
    }

    huffmanEncode(input: string | DataBuffer): DataBuffer {
        throw new Error("Not Implemented");
        return {} as DataBuffer;
    }

    huffmanDecode(input: DataBuffer): DataBuffer {
        throw new Error("Not Implemented");
        return {} as DataBuffer;
    }

    // @ts-ignore
    bufferSet(dest: Uint8Array | ArrayBuffer, destOffset: number,
        src: Uint8Array | ArrayBuffer | string, srcOffset?: number, srcLength?: number): void {

        const destBuf = toBuffer(dest);
        const srcBuf = toBuffer(src);

        srcBuf.copy(dest, destOffset, srcOffset, srcLength);
    }

    createSHA256Context(): SHA256Context {
        throw new Error("Do I have to do this?");
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
        } catch(e) {
            out = e.stack.toString();
        }

        return out;
    }

    // base64 encode
    // fixme? anders....
    // @ts-ignore
    btoa(buffer: Uint8Array | ArrayBuffer | string, returnUint8Array: boolean): string | Uint8Array {
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
    atoutf8(input: DataBuffer | Uint8Array | ArrayBuffer | string): Uint8Array {
        return toUint8Array(input);
    }

    // TODO: Assumes Ascii
    utf8toa(input: DataBuffer | Uint8Array | ArrayBuffer | string, offset?: number, length?: number): string {
        if (typeof input === 'string') {
            return input.substr(offset || 0, length || 0);
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
        console.log.apply(console, args);
    }

    trace(...args: any) {
        console.trace(...args);
    }

    error(...args: any): void {
        console.error.apply(console, args);
    }

    createSSLNetworkPipe(options: CreateSSLNetworkPipeOptions): Promise<NetworkPipe> {
        throw new Error("Really not implementetd...");
    }

    createTCPNetworkPipe(options: CreateTCPNetworkPipeOptions): Promise<NetworkPipe> {
        return createTCPNetworkPipe(options);
    }

    bufferConcat(...args: ArrayBuffer[] | Uint8Array[]): ArrayBuffer {
        let bufs;

        if (args[0] instanceof ArrayBuffer) {
            // @ts-ignore
            bufs = args.map(x => new Uint8Array(x));
        }
        else {
            bufs = args;
        }

        const concattedBuf = Buffer.concat(bufs);
        const offset = concattedBuf.byteOffset;
        return concattedBuf.buffer.slice(offset, offset + concattedBuf.length);
    }

    // "heremybigHHTTP string\r\n"
    bufferIndexOf(haystack: Uint8Array | ArrayBuffer | string, haystackOffset: number, haystackLength: number | undefined, needle: Uint8Array | ArrayBuffer | string, needleOffset?: number, needleLength?: number | undefined): number {
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

    bufferLastIndexOf(haystack: Uint8Array | ArrayBuffer | string, haystackOffset: number, haystackLength: number | undefined, needle: Uint8Array | ArrayBuffer | string, needleOffset?: number, needleLength?: number | undefined): number {
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

    lookupDnsHost(host: string, ipVersion: IpVersion, timeout: number, callback: (result: DnsResult) => void): void {
        dns.lookup(host, {
            family: ipVersion
        }, (err, address, family) => {
            const res = {} as DnsResult;
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
