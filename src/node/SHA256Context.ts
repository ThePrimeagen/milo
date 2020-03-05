import crypto from 'crypto';

import {IDataBuffer, SHA256Context as ISC} from '../types';
import DB from './DataBuffer';
import {bufferToArrayBufferCopy} from './utils';

/*
const salt = 'abcdefghijklmnop!';
const hash = crypto.createHmac('sha256', salt)
                   .update('I love cupcakes')
                   .digest('hex');
 */

export class SHA256Context implements ISC {
    private salt: string;
    private hash: crypto.Hmac;

    constructor() {
        // yeah, i know, do it 2x...., typescript and required initialization
        // makes this part really hard.
        this.salt = '';
        this.hash = crypto.createHmac('sha256', this.salt);

        this.reset();
    }

    add(buf: Uint8Array | ArrayBuffer | IDataBuffer | string): void {
        let arrBuf: ArrayBuffer;
        if (buf instanceof DB) {
            arrBuf = buf.toArrayBuffer();
        }
        else if (buf instanceof Uint8Array) {
            arrBuf = buf.buffer;
        }
        else if (typeof buf === 'string') {
            arrBuf = Buffer.from(buf).buffer;
        }
        else {
            // @ts-ignore
            arrBuf = buf;
        }

        this.hash = this.hash.update(new DataView(arrBuf));
    }


    // Property 'final' in type 'SHA256Context' is not assignable to the same
    // property in base type 'SHA256Context'.   Type '(md?: Uint8Array |
    // ArrayBuffer | IDataBuffer | undefined, offset?: number | undefined) =>
    // number | ArrayBuffer' is not assignable to type '{ (): ArrayBuffer; (md:
    // Uint8Array | ArrayBuffer | IDataBuffer, offset?: number | undefined):
    // number; }'.     Type 'number | ArrayBuffer' is not assignable to type
    // 'ArrayBuffer'.       Type 'number' is not assignable to type
    // 'ArrayBuffer'.
    // @ts-ignore
    final(md?: ArrayBuffer | Uint8Array | IDataBuffer, offset?: number): ArrayBuffer | number {
        if (md) {
            throw new Error("Not Implemented");
            return 0;
        }

        const buf = Buffer.from(this.hash.digest('hex'));
        return bufferToArrayBufferCopy(buf, 0, buf.byteLength);
    }

    reset(): void {
        this.salt = 'abcdefghijklmnop!' + Date.now();
        this.hash = crypto.createHmac('sha256', this.salt);
    }
}


