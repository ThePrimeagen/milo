import { toUint8Array, bufferToArrayBufferCopy } from './utils';
import { DataBuffer, encodingType, hashType, compressionMethod } from '../types';

const tempAllocation = Buffer.alloc(1);

function toString(item: string | DataBuffer | ArrayBuffer | Uint8Array | number): string {
    if (typeof item === 'number') {
        return String(item);
    }
    if (typeof item === 'string') {
        return item;
    }

    const uint8Array = toUint8Array(item);
    return uint8Array.toString();
}

export default class DB implements DataBuffer {
    public buffer: Buffer;

    public byteLength: number;
    public byteOffset: number;
    public bufferLength: number;

    public readonly refCount: number;

    static toBuffer(buf: DB): Buffer {
        return buf.buffer.slice(0);
    }

    static fromBuffer(buf: Buffer) {
        const db = new DB(buf.byteLength);
        db.buffer = buf;

        return db;
    }

    constructor(byteCountOrBuf: number | DataBuffer | Uint8Array, offset?: number, length?: number) {
        // Node does not have this notion nor can we reproduce it easily.
        // Since node is meant to be a testing platform and not a performance
        // platform, i'll just have it permentantly pegged to 1 and allow for
        // garbage collection to do its thing.
        this.refCount = 1;
        this.bufferLength = this.byteLength = this.byteOffset = 0;

        // This is done purely for typescript not to complain about
        // initializing the variable within the constructor
        this.buffer = tempAllocation;

        if (typeof byteCountOrBuf === "number") {
            this.constructFromByteCount(byteCountOrBuf);
        }

        else {
            offset = offset || 0;
            length = length === undefined ?
                (byteCountOrBuf.byteLength - offset) : length;

            this.constructFromDataBuffer(byteCountOrBuf, offset, length);
        }
    }

    private constructFromDataBuffer(buf: DataBuffer | Uint8Array, offset: number, length: number) {
        if (buf instanceof Uint8Array) {
            this.buffer = Buffer.from(buf.subarray(offset, offset + length));
        }
        else {
            this.buffer = (buf as DB).buffer.slice(offset, offset + length);
        }

        this.byteOffset = 0;
        this.byteLength = length;
        this.bufferLength = this.buffer.byteLength;
    }

    private constructFromByteCount(byteCount: number) {
        this.buffer = Buffer.alloc(byteCount);
        this.bufferLength = this.byteLength = this.buffer.byteLength;
        this.byteOffset = this.buffer.byteOffset;
    }

    private getOffsetAndLength(offset?: number, len?: number) {
        offset = offset === undefined ? 0 : offset;
        len = len === undefined ? this.buffer.byteLength - offset : len;

        return [offset, len];
    }

    leftSubarray(length: number): DataBuffer {
        return new DB(this, this.byteOffset, length);
    }
    rightSubarray(length: number): DataBuffer {
        return new DB(this, this.byteLength - length, length);
    }
    subarray(offset: number = 0, length?: number): DataBuffer {
        return new DB(this, this.byteOffset + offset, length);
    }

    detach(): DataBuffer {
        return this;
    }

    clear(): void { }

    fill(data: string | ArrayBuffer | DataBuffer | number | Uint8Array,
         o?: number, l?: number) {

        const [offset, length] = this.getOffsetAndLength(o, l);
        throw new Error("Not Implemented");
    }

    slice(o?: number, l?: number): DataBuffer {
        const [offset, length] = this.getOffsetAndLength(o, l);
        const newBuffer = new DB(length);

        this.buffer.copy(newBuffer.buffer, 0, offset, offset + length);

        return newBuffer;
    }

    /**
     * Hyper unoptimized.
     * Convert everythng to string, and rely on the string to properly handle
     * the case insensitive search
     */
    indexOf(needle: string | ArrayBuffer | DataBuffer | number | Uint8Array,
            offset?: number, length?: number, caseInsensitive?: boolean): number {

        let thisStr = this.buffer.
            slice(offset, length).toString();
        let needleStr = toString(needle);

        if (caseInsensitive) {
            thisStr = thisStr.toLowerCase();
            needleStr = needleStr.toLowerCase();
        }

        return thisStr.indexOf(needleStr);
    }

    lastIndexOf(needle: string | ArrayBuffer | DataBuffer | number | Uint8Array,
                offset?: number, length?: number, caseInsensitive?: boolean): number {

        let thisStr = this.buffer.
            slice(offset, length).toString();
        let needleStr = toString(needle);

        if (caseInsensitive) {
            thisStr = thisStr.toLowerCase();
            needleStr = needleStr.toLowerCase();
        }

        return thisStr.lastIndexOf(needleStr);
    }

    includes(needle: string | ArrayBuffer | DataBuffer | number | Uint8Array,
             offset?: number, length?: number, caseInsensitive?: boolean): boolean {
        let thisStr = this.buffer.
            slice(offset, length).toString();
        let needleStr = toString(needle);

        if (caseInsensitive) {
            thisStr = thisStr.toLowerCase();
            needleStr = needleStr.toLowerCase();
        }

        return Boolean(~thisStr.indexOf(needleStr));
    }

    equals(other: string | ArrayBuffer | DataBuffer | Uint8Array): boolean {
        return this.buffer.toString() === toString(other);
    }

    toString(enc?: encodingType, o?: number, l?: number): string {
        const [
            offset,
            length,
        ] = this.getOffsetAndLength(o, l);

        return this.buffer.toString(enc || "utf8", offset, length);
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

    randomize(o?: number, l?: number): void {
        const [
            offset,
            length,
        ] = this.getOffsetAndLength(o, l);

        const offStart = this.byteOffset + offset;
        for (let i = 0; i < length; ++i) {
            this.buffer[offStart + i] = (Math.random() * 256) | 0;
        }
    }

    // TODO: Clea,n up this length biz
    toArrayBuffer(o?: number, l?: number): ArrayBuffer {
        const [
            offset,
            length,
        ] = this.getOffsetAndLength(o, l);
        const buf = this.buffer.slice(offset, offset + length);
        return bufferToArrayBufferCopy(buf, 0, buf.byteLength);
    }
    toArray(offset?: number, length?: number): [number] { throw new Error("Not Implemented"); }
    reverse(offset?: number, length?: number): void { throw new Error("Not Implemented"); }

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

    getUInt8(offset: number): number {
        return this.buffer[this.byteOffset + offset];
    }

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

    setUInt8(offset: number, value: number): number {
        this.buffer.writeUInt8(value, this.byteOffset + offset);
        return offset;
    }

    setInt8(offset: number, value: number): number {
        this.buffer.writeInt8(value, this.byteOffset + offset);
        return offset;
    }

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

    compare(other: string | ArrayBuffer | DataBuffer | Uint8Array | number | number[],
            otherByteOffset?: number,
            otherByteLength?: number,
            selfByteOffset?: number,
            selfByteLength?: number): -1 | 0 | 1 { throw new Error("Not Implemented"); }

    isEmpty(): boolean { throw new Error("Not Implemented"); }

    setIntBE(offset: number, value: number, byteLength?: 1 | 2 | 3 | 4 | 5 | 6): number { throw new Error("Not Implemented"); }
    setIntLE(offset: number, value: number, byteLength?: 1 | 2 | 3 | 4 | 5 | 6): number { throw new Error("Not Implemented"); }

    setUIntBE(offset: number, value: number, byteLength?: 1 | 2 | 3 | 4 | 5 | 6): number { throw new Error("Not Implemented"); }
    setUIntLE(offset: number, value: number, byteLength?: 1 | 2 | 3 | 4 | 5 | 6): number { throw new Error("Not Implemented"); }

    setView(byteOffset: number, byteLength: number): void { throw new Error("Not Implemented"); }

    static concat(...args: ArrayBuffer[] | Uint8Array[] | DataBuffer[]): DataBuffer {
        const normalizedArr: Uint8Array[] = [];
        for (let i = 0; i < args.length; ++i) {
            const arg = args[i];
            if (arg instanceof ArrayBuffer) {
                normalizedArr.push(new Uint8Array(arg));
            }
            if (arg instanceof Uint8Array) {
                normalizedArr.push(arg);
            }

            normalizedArr.push((arg as DB).buffer);
        }

        const normBuf = Buffer.concat(normalizedArr);
        return new DB(normBuf);
    }
}
