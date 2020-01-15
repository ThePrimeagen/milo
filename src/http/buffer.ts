import {
    uint8ArraySlice
} from '../utils/index';

const r = "\r".charCodeAt(0);
const n = "\n".charCodeAt(0);
const newLine = [r, n];
const space = " ".charCodeAt(0);
const colon = ":".charCodeAt(0);
const contentLength = "content-length".split('').map(x => x.charCodeAt(0));

const NotFound = -1;

export function parse64BigInt(buffer: Uint8Array, offset: number): BigInt {
    throw new Error('Cannot have a 4GB packet rook.');
    // @ts-ignore
    // TODO michael fix me
    return BigInt(`0x${uint8ArraySlice(buffer, offset, offset + 8).toString('hex')}`);
};

export class BufferPool {
    private pool: Uint8Array[];
    private size: number;

    constructor(size: number) {
        this.pool = [];
        this.size = size;
    }

    malloc() {
        if (this.pool.length === 0) {
            this.pool.push(new Uint8Array(this.size));
        }

        return this.pool.pop();
    }

    free(buffer: Uint8Array) {
        this.pool.push(buffer);
    }

}

export interface BufferBuilderInterface {
    length: () => number;
    getBuffer: () => Uint8Array;
    addString: (str: string) => void;
    addNewLine: () => void;
    clear: () => void;
};

class BufferBuilder implements BufferBuilderInterface {
    private ptr: number;
    private buffer: Uint8Array;

    constructor(buf: Uint8Array | number = 4096) {
        this.ptr = 0;
        if (typeof buf === 'number') {
            this.buffer = new Uint8Array(buf);
        }

        else {
            this.buffer = buf;
        }
    }

    length() {
        return this.ptr;
    }

    getBuffer() {
        return this.buffer;
    }

    addString(str: string) {
        for (let i = 0; i < str.length; ++i) {
            this.buffer[this.ptr++] = str.charCodeAt(i);
        }
    }

    addNewLine() {
        this.buffer[this.ptr++] = r;
        this.buffer[this.ptr++] = n;
    }

    clear() {
        this.ptr = 0;
    }
}

export function createBufferBuilder(buf: Uint8Array | number = 4096): BufferBuilderInterface {
    return new BufferBuilder(buf);
};

export function getCharacterIdx(buf: Uint8Array, needle: number, offset: number, maxLength?: number) {
    let idx = NotFound;
    maxLength = maxLength || buf.length;
    for (let i = offset; idx === NotFound && i < maxLength; ++i) {
        if (buf[i] === needle) {
            idx = i;
        }
    }

    return idx;
}

export function getColonIdx(buf: Uint8Array, offset: number, maxLength: number): number {
    return getCharacterIdx(buf, colon, offset, maxLength);
}

export function getSpaceIdx(buf: Uint8Array, offset: number) {
    return getCharacterIdx(buf, space, offset);
}

export {
    NotFound,
    r,
    n,
};

export function getEndLineOffset(buf: Uint8Array, offset: number, maxLength: number): number {
    let i = offset;
    let found = false;

    for (; i < maxLength; ++i) {
        if (buf[i] === r &&
            buf[i + 1] === n) {

            found = true;
            break;
        }
    }

    return found ? i : -1;
}

export function getHTTPHeaderEndOffset(buf: Uint8Array, offset: number, maxLength: number): number {
    let i = offset;
    let found = false;

    for (; i < maxLength; ++i) {
        if (buf[i] === r &&
            buf[i + 1] === n &&
            buf[i + 2] === r &&
            buf[i + 3] === n) {

            found = true;
            break;
        }
    }

    return found ? i : -1;
};

