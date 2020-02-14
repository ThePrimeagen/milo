import {DataBuffer, encodingType, hashType, compressionMethod} from '../types';

// @ts-ignore
export default class DB implements DataBuffer {
    private buffer: Buffer;
    public byteLength: number;
    public byteOffset: number;
    public bufferLength: number;

    // TODO: What to do with this?
    // Must because we are doing a realloc
    // @ts-ignore
    public refCount: number;

    constructor(byteCount: number | DataBuffer, offset?: number, length?: number) {
        this.refCount = this.bufferLength =
            this.byteLength = this.byteOffset = 0;
        this.buffer = Buffer.alloc(1);

        if (typeof byteCount === "number") {
            this.constructFromByteCount(byteCount);
        }
        else {
            // TODO: This is for left, right, and mid... wtf do they mean..
        }
    }

    private constructFromByteCount(byteCount: number) {
        this.refCount = 0;
        this.buffer = Buffer.alloc(byteCount);
        this.bufferLength = this.byteLength = this.buffer.byteLength;
        this.byteOffset = this.buffer.byteOffset;
    }

    private getOffsetAndLength(offset?: number, length?: number) {
        offset = offset === undefined ? 0 : offset;
        length = length === undefined ? 0 : this.buffer.byteLength - offset;

        return [offset, length];
    }

    // TODO: What does this even mean?
    left(length: number): DataBuffer { return this; }
    right(length: number): DataBuffer { return this; }
    mid(offset?: number, length?: number): DataBuffer { return this; }
    detach(): DataBuffer { return this; }
    clear(): void { }

    fill(data: string | ArrayBuffer | DataBuffer | number | Uint8Array,
        o?: number, l?: number) {

        const [offset, length] = this.getOffsetAndLength(o, l);

    }

    slice(o?: number, l?: number): DataBuffer {
        const [offset, length] = this.getOffsetAndLength(o, l);
        const newBuffer = new DataBuffer(length);
        newBuffer.fill(this, o, l);

        return newBuffer;
    }

    indexOf(needle: string | ArrayBuffer | DataBuffer | number | Uint8Array,
        offset?: number, length?: number, caseInsensitive?: boolean): number {
            throw new Error("Not Implement");
        }

    lastIndexOf(needle: string | ArrayBuffer | DataBuffer | number | Uint8Array,
        offset?: number, length?: number, caseInsensitive?: boolean): number {
            throw new Error("Not Implement");
        }

    includes(needle: string | ArrayBuffer | DataBuffer | number | Uint8Array,
        offset?: number, length?: number, caseInsensitive?: boolean): boolean {
            throw new Error("Not Implement");
        }

    equals(other: string | ArrayBuffer | DataBuffer | Uint8Array): boolean {
        throw new Error("Not Implement");
    }

    toString(offset?: number, length?: number, enc?: encodingType): string {
        throw new Error("Not Implement");
    }

    encode(enc: encodingType, offset?: number, length?: number): DataBuffer {
        throw new Error("Not Implement");
    }

    decode(enc: encodingType, offset?: number, length?: number): DataBuffer {
        throw new Error("Not Implement");
    }

    hash(hash: hashType, offset?: number, length?: number): DataBuffer { throw new Error("Not Implemented"); }
    hashToString(hash: hashType, offset?: number, length?: number): string { throw new Error("Not Implemented"); }
    compress(method: compressionMethod, offset?: number, length?: number): DataBuffer { throw new Error("Not Implemented"); }
    uncompress(method: compressionMethod, offset?: number, length?: number): string { throw new Error("Not Implemented"); }
    random(offset?: number, length?: number): void { throw new Error("Not Implemented"); }

    toArrayBuffer(offset?: number, length?: number): ArrayBuffer { throw new Error("Not Implemented"); }
    toArray(offset?: number, length?: number): [number] { throw new Error("Not Implemented"); }
    reverse(): void { throw new Error("Not Implemented"); }

    sort(func?: (l: number, r: number) => number): void { throw new Error("Not Implemented"); }
    every(func: (val: number, i: number, buffer: DataBuffer) => boolean, thisValue?: any): boolean { throw new Error("Not Implemented"); }
    filter(func: (val: number, i: number, buffer: DataBuffer) => boolean, thisValue?: any): DataBuffer { throw new Error("Not Implemented"); }
    forEach(func: (val: number, i: number, buffer: DataBuffer) => void, thisValue?: any): void { throw new Error("Not Implemented"); }
    join(separator?: string): string { throw new Error("Not Implemented"); }
    map(func: (val: number, i: number, buffer: DataBuffer) => number, thisValue?: any): DataBuffer { throw new Error("Not Implemented"); }
    reduce(func: (previousValue: any, val: number, i: number, buffer: DataBuffer) => any, previousValue?: any): any { throw new Error("Not Implemented"); }
    reduceRight(func: (previousValue: any, val: number, i: number, buffer: DataBuffer) => any, previousValue?: any): any { throw new Error("Not Implemented"); }

    find(func: (val: number, i: number, buffer: DataBuffer) => boolean, thisValue?: any): number | undefined { throw new Error("Not Implemented"); }
    findIndex(func: (val: number, i: number, buffer: DataBuffer) => boolean, thisValue?: any): number | undefined { throw new Error("Not Implemented"); }

    get(offset: number): number { throw new Error("Not Implemented"); }
    set(offset: number, src: string | ArrayBuffer | DataBuffer | number | Uint8Array, srcOffset?: number, srcLength?: number): void { throw new Error("Not Implemented"); }

    getUIntLE(offset: number, byteLength: 1 | 2 | 3 | 4 | 5 | 6): number { throw new Error("Not Implemented"); }
    getUIntBE(offset: number, byteLength: 1 | 2 | 3 | 4 | 5 | 6): number { throw new Error("Not Implemented"); }
    getIntLE(offset: number, byteLength: 1 | 2 | 3 | 4 | 5 | 6): number { throw new Error("Not Implemented"); }
    getIntBE(offset: number, byteLength: 1 | 2 | 3 | 4 | 5 | 6): number { throw new Error("Not Implemented"); }

    getUInt8(offset: number): number { throw new Error("Not Implemented"); }
    getInt8(offset: number): number { throw new Error("Not Implemented"); }

    getUInt16BE(offset: number): number { throw new Error("Not Implemented"); }
    getUInt16LE(offset: number): number { throw new Error("Not Implemented"); }
    getInt16BE(offset: number): number { throw new Error("Not Implemented"); }
    getInt16LE(offset: number): number { throw new Error("Not Implemented"); }

    getUInt32BE(offset: number): number { throw new Error("Not Implemented"); }
    getUInt32LE(offset: number): number { throw new Error("Not Implemented"); }
    getInt32BE(offset: number): number { throw new Error("Not Implemented"); }
    getInt32LE(offset: number): number { throw new Error("Not Implemented"); }

    getUInt64BE(offset: number): number { throw new Error("Not Implemented"); }
    getUInt64LE(offset: number): number { throw new Error("Not Implemented"); }
    getInt64BE(offset: number): number { throw new Error("Not Implemented"); }
    getInt64LE(offset: number): number { throw new Error("Not Implemented"); }

    getFloat32BE(offset: number): number { throw new Error("Not Implemented"); }
    getFloat32LE(offset: number): number { throw new Error("Not Implemented"); }

    getFloat64BE(offset: number): number { throw new Error("Not Implemented"); }
    getFloat64LE(offset: number): number { throw new Error("Not Implemented"); }

    setUInt8(offset: number): number { throw new Error("Not Implemented"); }
    setInt8(offset: number): number { throw new Error("Not Implemented"); }

    setUInt16BE(offset: number, val: number): number { throw new Error("Not Implemented"); }
    setUInt16LE(offset: number, val: number): number { throw new Error("Not Implemented"); }
    setInt16BE(offset: number, val: number): number { throw new Error("Not Implemented"); }
    setInt16LE(offset: number, val: number): number { throw new Error("Not Implemented"); }

    setUInt32BE(offset: number, val: number): number { throw new Error("Not Implemented"); }
    setUInt32LE(offset: number, val: number): number { throw new Error("Not Implemented"); }
    setInt32BE(offset: number, val: number): number { throw new Error("Not Implemented"); }
    setInt32LE(offset: number, val: number): number { throw new Error("Not Implemented"); }

    setUInt64BE(offset: number, val: number): number { throw new Error("Not Implemented"); }
    setUInt64LE(offset: number, val: number): number { throw new Error("Not Implemented"); }
    setInt64BE(offset: number, val: number): number { throw new Error("Not Implemented"); }
    setInt64LE(offset: number, val: number): number { throw new Error("Not Implemented"); }

    setFloat32BE(offset: number, val: number): number { throw new Error("Not Implemented"); }
    setFloat32LE(offset: number, val: number): number { throw new Error("Not Implemented"); }

    setFloat64BE(offset: number, val: number): number { throw new Error("Not Implemented"); }
    setFloat64LE(offset: number, val: number): number { throw new Error("Not Implemented"); }

    // static concat(...args: ArrayBuffer[] | Uint8Array[] | DataBuffer[]): DataBuffer;
}
