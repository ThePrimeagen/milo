/* global nrdp */
import {NRDP} from './types';

let exportObj;
if (process.env.NRDP) {
    // @ts-ignore
    exportObj = nrdp;
}

if (!process.env.NRDP) {
    const sha1 = require('sha1');
    const atob = require('atob');
    const btoa = require('btoa');

    exportObj = {
        hash(type: string, data: string): Uint8Array {
            const outStr = sha1(data);
            return
        },

        btoa,
        atob,

        // TODO: Assuming ASICC, probably shouldn't
        atoutf8(str: string): Uint8Array {

            const buf = new Uint8Array(str.length);

            let i, strLen;
            for (i = 0, strLen = str.length; i < strLen; i++) {
                buf[i] = str.charCodeAt(i);
            }

            return buf;
        },

        // TODO: Assumes Ascii
        utf8toa(buffer: Uint8Array|ArrayBuffer): string {
            if (buffer instanceof Uint8Array) {
                return String.fromCharCode.apply(null, buffer);
            }

            return String.fromCharCode.apply(null, new Uint8Array(buffer));
        }
    };
}

export const utils = {
    copyUint8Array(from: Uint8Array, to: Uint8Array, targetStart: number = 0, sourceIdx: number = 0, sourceEndIdx?: number): number {
        if (process.env.NRDP) {
            // @ts-ignore
            return from.copy(to, targetStart);
        }
        else {
            // TODO: YOU NEED TO CHANGE THIS NOW.
            const fromBuf = Buffer.from(from.buffer);
            const toBuf = Buffer.from(to.buffer);

            return fromBuf.copy(toBuf, targetStart, sourceIdx, sourceEndIdx);
        }
    }
};

export default exportObj as NRDP;
