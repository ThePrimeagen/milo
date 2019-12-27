const r = "\r".charCodeAt(0);
const n = "\n".charCodeAt(0);
const newLine = [r, n];
const space = " ".charCodeAt(0);
const colon = ":".charCodeAt(0);
const contentLength = "content-length".split('').map(x => x.charCodeAt(0));

const NotFound = -1;

export function parse64BigInt(buffer: Buffer, offset: number): BigInt {
    return BigInt(`0x${buffer.slice(offset, offset + 8).toString('hex')}`);
};

export class BufferPool {
    private pool: Buffer[];
    private size: number;

    constructor(size: number) {
        this.pool = [];
        this.size = size;
    }

    malloc() {
        if (this.pool.length === 0) {
            this.pool.push(Buffer.allocUnsafe(this.size));
        }

        return this.pool.pop();
    }

    free(buffer: Buffer) {
        this.pool.push(buffer);
    }

}

export interface BufferBuilderInterface {
    length: () => number;
    getBuffer: () => Buffer;
    addString: (str: string) => void;
    addNewLine: () => void;
    clear: () => void;
};

class BufferBuilder implements BufferBuilderInterface {
    private ptr: number;
    private buffer: Buffer;

    constructor(buf: Buffer | number = 4096) {
        this.ptr = 0;
        if (typeof buf === 'number') {
            this.buffer = Buffer.allocUnsafe(buf);
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

export function createBufferBuilder(buf: Buffer | number = 4096): BufferBuilderInterface {
    return new BufferBuilder(buf);
};

export function getCharacterIdx(buf: Buffer, needle: number, offset: number, maxLength?: number) {
    let idx = NotFound;
    maxLength = maxLength || buf.length;
    for (let i = offset; idx === NotFound && i < maxLength; ++i) {
        if (buf[i] === needle) {
            idx = i;
        }
    }

    return idx;
}

export function getColonIdx(buf: Buffer, offset: number, maxLength: number): number {
    return getCharacterIdx(buf, colon, offset, maxLength);
}

export function getSpaceIdx(buf: Buffer, offset: number) {
    return getCharacterIdx(buf, space, offset);
}

export {
    NotFound,
    r,
    n,
};

export function getEndLineOffset(buf: Buffer, offset: number, maxLength: number): number {
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

export function getHTTPHeaderEndOffset(buf: Buffer, offset: number, maxLength: number): number {
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

