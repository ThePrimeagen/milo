import crypto from 'crypto';
import {DataBuffer} from '../types';
import DB from './DataBuffer';

/*
const salt = 'abcdefghijklmnop!';
const hash = crypto.createHmac('sha256', salt)
                   .update('I love cupcakes')
                   .digest('hex');
 */

export class SHA256Context {
    private salt: string;
    private hash: crypto.Hmac;

    constructor() {
        // yeah, i know, do it 2x...., typescript and required initialization
        // makes this part really hard.
        this.salt = '';
        this.hash = crypto.createHmac('sha256', this.salt);

        this.reset();
    }

    add(buf: Uint8Array | ArrayBuffer | DataBuffer | string): void {
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

    final(md?: ArrayBuffer | Uint8Array | DataBuffer, offset?: number): ArrayBuffer | number {
        if (md) {
            throw new Error("Not Implemented");
            return 0;
        }

        return Buffer.from(this.hash.digest('hex')).buffer;
    }

    reset(): void {
        this.salt = 'abcdefghijklmnop!' + Date.now();
        this.hash = crypto.createHmac('sha256', this.salt);
    }
}


