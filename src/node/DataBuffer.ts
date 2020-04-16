import IDataBuffer, { DataBufferConcatArrayArgs } from "../IDataBuffer";
import os from "os";
import { EncodingType, HashType, CompressionMethod } from "../types";
import { toUint8Array, bufferToArrayBufferCopy } from "./utils";

const tempAllocation = Buffer.alloc(1);

function toString(item: string | IDataBuffer | ArrayBuffer | Uint8Array | number): string {
    if (typeof item === 'number') {
        return String(item);
    }
    if (typeof item === 'string') {
        return item;
    }

    const uint8Array = toUint8Array(item);
    return uint8Array.toString();
}

/**
 * Probably should actually make an encoding table, but as of now we only have
 * one type.  Likely hex will be the next.
 */
function convertEncodingType(str: EncodingType): "utf8" {
    return "utf8";
}

abstract class DBGetterSetters {
    abstract getFloat32(offset: number): number;
    abstract getFloat32BE(offset: number): number;
    abstract getFloat32LE(offset: number): number;
    abstract getFloat64(offset: number): number;
    abstract getFloat64BE(offset: number): number;
    abstract getFloat64LE(offset: number): number;
    abstract getInt(offset: number, byteLength?: 1 | 2 | 3 | 4 | 5 | 6): number;
    abstract getInt16(offset: number): number;
    abstract getInt16BE(offset: number): number;
    abstract getInt16LE(offset: number): number;
    abstract getInt32(offset: number): number;
    abstract getInt32BE(offset: number): number;
    abstract getInt32LE(offset: number): number;
    abstract getInt64(offset: number): number;
    abstract getInt64BE(offset: number): number;
    abstract getInt64LE(offset: number): number;
    abstract getIntBE(offset: number, byteLength?: 1 | 2 | 3 | 4 | 5 | 6): number;
    abstract getIntLE(offset: number, byteLength?: 1 | 2 | 3 | 4 | 5 | 6): number;
    abstract getUInt(offset: number, byteLength?: 1 | 2 | 3 | 4 | 5 | 6): number;
    abstract getUInt16(offset: number): number;
    abstract getUInt16BE(offset: number): number;
    abstract getUInt16LE(offset: number): number;
    abstract getUInt32(offset: number): number;
    abstract getUInt32BE(offset: number): number;
    abstract getUInt32LE(offset: number): number;
    abstract getUInt64(offset: number): number;
    abstract getUInt64BE(offset: number): number;
    abstract getUInt64LE(offset: number): number;
    abstract getUIntBE(offset: number, byteLength?: 1 | 2 | 3 | 4 | 5 | 6): number;
    abstract getUIntLE(offset: number, byteLength?: 1 | 2 | 3 | 4 | 5 | 6): number;

    abstract setFloat32(offset: number, value: number): void;
    abstract setFloat32BE(offset: number, value: number): void;
    abstract setFloat32LE(offset: number, value: number): void;
    abstract setFloat64(offset: number, value: number): void;
    abstract setFloat64BE(offset: number, value: number): void;
    abstract setFloat64LE(offset: number, value: number): void;
    abstract setInt(offset: number, value: number, byteLength?: 1 | 2 | 3 | 4 | 5 | 6): void;
    abstract setInt16(offset: number, value: number): void;
    abstract setInt16BE(offset: number, value: number): void;
    abstract setInt16LE(offset: number, value: number): void;
    abstract setInt32(offset: number, value: number): void;
    abstract setInt32BE(offset: number, value: number): void;
    abstract setInt32LE(offset: number, value: number): void;
    abstract setInt64(offset: number, value: number): void;
    abstract setInt64BE(offset: number, value: number): void;
    abstract setInt64LE(offset: number, value: number): void;
    abstract setIntBE(offset: number, value: number, byteLength?: 1 | 2 | 3 | 4 | 5 | 6): void;
    abstract setIntLE(offset: number, value: number, byteLength?: 1 | 2 | 3 | 4 | 5 | 6): void;
    abstract setUInt(offset: number, value: number, byteLength?: 1 | 2 | 3 | 4 | 5 | 6): void;
    abstract setUInt16(offset: number, value: number): void;
    abstract setUInt16BE(offset: number, value: number): void;
    abstract setUInt16LE(offset: number, value: number): void;
    abstract setUInt32(offset: number, value: number): void;
    abstract setUInt32BE(offset: number, value: number): void;
    abstract setUInt32LE(offset: number, value: number): void;
    abstract setUInt64(offset: number, value: number): void;
    abstract setUInt64BE(offset: number, value: number): void;
    abstract setUInt64LE(offset: number, value: number): void;
    abstract setUIntBE(offset: number, value: number, byteLength?: 1 | 2 | 3 | 4 | 5 | 6): void;
    abstract setUIntLE(offset: number, value: number, byteLength?: 1 | 2 | 3 | 4 | 5 | 6): void;
};

abstract class LittleDBGetterSetters extends DBGetterSetters {
    constructor() {
        super();
    }

    getFloat32(offset: number) { return this.getFloat32LE(offset); }
    getFloat64(offset: number): number { return this.getFloat64LE(offset); }
    getInt(offset: number, byteLength?: 1 | 2 | 3 | 4 | 5 | 6): number {
        return this.getIntLE(offset, byteLength);
    }
    getInt16(offset: number): number { return this.getInt16LE(offset); }
    getInt32(offset: number): number { return this.getInt32LE(offset); }
    getInt64(offset: number): number { return this.getInt64LE(offset); }
    getUInt(offset: number, byteLength?: 1 | 2 | 3 | 4 | 5 | 6): number {
        return this.getUIntLE(offset, byteLength);
    }
    getUInt16(offset: number): number { return this.getUInt16LE(offset); }
    getUInt32(offset: number): number { return this.getUInt32LE(offset); }
    getUInt64(offset: number): number { return this.getUInt64LE(offset); }

    setFloat32(offset: number, val: number): void { this.setFloat32LE(offset, val); }
    setFloat64(offset: number, val: number): void { this.setFloat64LE(offset, val); }
    setInt(offset: number, val: number, byteLength?: 1 | 2 | 3 | 4 | 5 | 6): void {
        this.setIntLE(offset, val, byteLength);
    }
    setInt16(offset: number, val: number): void { this.setInt16LE(offset, val); }
    setInt32(offset: number, val: number): void { this.setInt32LE(offset, val); }
    setInt64(offset: number, val: number): void { this.setInt64LE(offset, val); }
    setUInt(offset: number, val: number, byteLength?: 1 | 2 | 3 | 4 | 5 | 6): void {
        this.setUIntLE(offset, val, byteLength);
    }
    setUInt16(offset: number, val: number): void { this.setUInt16LE(offset, val); }
    setUInt32(offset: number, val: number): void { this.setUInt32LE(offset, val); }
    setUInt64(offset: number, val: number): void { this.setUInt64LE(offset, val); }
};

if (os.endianness() !== "LE") {
    throw new Error("We're not prepared for this");
}


export default class DataBuffer extends LittleDBGetterSetters implements IDataBuffer {
    public buffer: Buffer;

    public byteLength: number;
    public byteOffset: number;
    public bufferLength: number;

    // TODO: Figure this part out.  We need to get a data buffer class.
    public readonly refCount: number;

    static toBuffer(buf: DataBuffer | IDataBuffer): Buffer {
        // Note: This is safe since all IDataBuffer's on the node side is
        // DataBuffer class.
        return (buf as DataBuffer).buffer.slice(0);
    }

    static fromBuffer(buf: Buffer) {
        const db = new DataBuffer(buf.byteLength);
        db.buffer = buf;

        return db;
    }

    constructor(byteCountOrBuf: number | IDataBuffer | Uint8Array | ArrayBuffer | string,
                offsetOrEnc?: number | EncodingType, length?: number) {
        super();

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

        else if (typeof byteCountOrBuf === "string") {
            if (typeof offsetOrEnc === "number") {
                throw new Error(`Cannot construct a DataBuffer with a string
and offset.  The second argument can be a string encoding.
Please see src/types.ts for DataBufferConstructor options.`);
            }

            offsetOrEnc = convertEncodingType(offsetOrEnc || "utf8");

            this.buffer = Buffer.from(byteCountOrBuf, offsetOrEnc);
            this.bufferLength = this.byteLength = this.buffer.byteLength;
            this.byteOffset = 0;
        }

        else {
            if (typeof offsetOrEnc === "string") {
                throw new Error(`You cannot construct a DataBuffer with a
string value for the second parameter, offset.`);

            }

            offsetOrEnc = offsetOrEnc || 0;
            length = length === undefined ?
                (byteCountOrBuf.byteLength - offsetOrEnc) : length;

            this.constructFromIDataBuffer(byteCountOrBuf, offsetOrEnc, length);
        }
    }

    private constructFromIDataBuffer(buf: ArrayBuffer | IDataBuffer | Uint8Array, offset: number, length: number) {
        if (buf instanceof Uint8Array || buf instanceof ArrayBuffer) {
            // always copy
            this.buffer = Buffer.from(buf.slice(offset, offset + length));
        }
        else {
            this.buffer = (buf as DataBuffer).buffer.slice(offset, offset + length);
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

    // TODO: Make this incorportate this.byteOffset
    private getOffsetAndLength(offset?: number, len?: number) {
        offset = offset === undefined ? 0 : offset;
        len = len === undefined ? this.buffer.byteLength - offset : len;

        return [offset, len];
    }

    leftSubarray(length: number): IDataBuffer {
        return new DataBuffer(this, this.byteOffset, length);
    }

    subarray(offset: number = 0, length?: number): IDataBuffer {
        // TODO: bounds check

        const buf = new DataBuffer(0);
        buf.buffer = this.buffer;
        buf.byteLength = length || this.byteLength - offset;
        buf.byteOffset = this.byteOffset + offset;
        buf.bufferLength = this.bufferLength;

        return buf;
    }
    rightSubarray(length: number): DataBuffer {
        return new DataBuffer(this, this.byteLength - length, length);
    }

    detach(): void {
        // TODO: Fill it in
    }

    /* tslint:disable:no-empty */
    clear(): void { }

    fill(data: string | ArrayBuffer | IDataBuffer | number | Uint8Array,
         o?: number, l?: number) {

        const [offset, length] = this.getOffsetAndLength(o, l);
        throw new Error("Not Implemented");
    }

    // TODO: This clearly sucks.  It has a bug, slice(0) totally ruins it all.
    slice(o?: number, l?: number): IDataBuffer {
        const [offset, length] = this.getOffsetAndLength(o, l);
        const newBuffer = new DataBuffer(length);

        this.buffer.copy(newBuffer.buffer, 0, offset, offset + length);

        return newBuffer;
    }

    /**
     * Hyper unoptimized.
     * Convert everythng to string, and rely on the string to properly handle
     * the case insensitive search
     */
    indexOf(needle: string | ArrayBuffer | IDataBuffer | number | Uint8Array,
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

    lastIndexOf(needle: string | ArrayBuffer | IDataBuffer | number | Uint8Array,
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

    includes(needle: string | ArrayBuffer | IDataBuffer | number | Uint8Array,
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

    equals(other: string | ArrayBuffer | IDataBuffer | Uint8Array): boolean {
        return this.buffer.toString() === toString(other);
    }

    toString(enc?: EncodingType, o?: number, l?: number): string {
        const [
            offset,
            length,
        ] = this.getOffsetAndLength(o, l);

        // TODO: Fix getOffsetAndLength.  Should normalize offset for ease of
        // use
        return this.buffer.toString(enc || "utf8",
                                    this.byteOffset + offset, length);
    }

    encode(enc: EncodingType, offset?: number, length?: number): IDataBuffer {
        throw new Error("Not Implement");
    }

    decode(enc: EncodingType, offset?: number, length?: number): IDataBuffer {
        throw new Error("Not Implement");
    }

    hash(hash: HashType, offset?: number, length?: number): IDataBuffer {
        throw new Error("Not Implemented");
    }
    hashToString(hash: HashType, offset?: number, length?: number): string {
        throw new Error("Not Implemented");
    }
    compress(method: CompressionMethod, offset?: number, length?: number): IDataBuffer {
        throw new Error("Not Implemented");
    }
    uncompress(method: CompressionMethod, offset?: number, length?: number): string {
        throw new Error("Not Implemented");
    }

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

    toArray(o?: number, l?: number): number[] {
        const [
            offset,
            length,
        ] = this.getOffsetAndLength(o, l);

        const out: number[] = [];
        for (let i = 0, idx = offset; i < length; ++i, ++idx) {
            out[i] = this.buffer[idx];
        }

        return out;
    }

    reverse(offset?: number, length?: number): void { throw new Error("Not Implemented"); }

    sort(func?: (l: number, r: number) => number): this { throw new Error("Not Implemented"); }
    every(func: (val: number, i: number, buffer: IDataBuffer) => boolean, thisValue?: any): boolean {
        throw new Error("Not Implemented");
    }
    filter(func: (val: number, i: number, buffer: IDataBuffer) => boolean, thisValue?: any): IDataBuffer {
        throw new Error("Not Implemented");
    }
    forEach(func: (val: number, i: number, buffer: IDataBuffer) => void, thisValue?: any): void {
        throw new Error("Not Implemented");
    }
    join(separator?: string): string {
        throw new Error("Not Implemented");
    }
    map(func: (val: number, i: number, buffer: IDataBuffer) => number, thisValue?: any): IDataBuffer {
        throw new Error("Not Implemented");
    }
    reduce(func: (previousValue: any, val: number, i: number, buffer: IDataBuffer) => any,
           previousValue?: any): any {
        throw new Error("Not Implemented");
    }
    reduceRight(func: (previousValue: any, val: number, i: number, buffer: IDataBuffer) => any,
                previousValue?: any): any {
        throw new Error("Not Implemented");
    }

    find(func: (val: number, i: number, buffer: IDataBuffer) => boolean,
         thisValue?: any): number | undefined {
        throw new Error("Not Implemented");
    }
    findIndex(func: (val: number, i: number, buffer: IDataBuffer) => boolean,
              thisValue?: any): number | undefined {
        throw new Error("Not Implemented");
    }
    get(offset: number): number { throw new Error("Not Implemented"); }

    //
    // TODO: Conflicted on this.  Should putting a src into this buffer that's
    // too large.  Should we act like a Uint8Array?
    set(o: number, src: string | ArrayBuffer | IDataBuffer, srcOffset?: number, srcLength?: number): void {
        const offset = o + this.byteOffset;
        srcOffset = srcOffset || 0;

        let buf: Buffer;
        if (src instanceof DataBuffer) {
            srcLength = srcLength || src.byteLength;
            for (let i = 0, idx = srcOffset; i < srcLength; ++i, ++idx) {
                this.buffer[offset + i] = src.getUInt8(idx);
            }
            return;
        }

        if (typeof src === 'string') {
            buf = Buffer.from(src);
        }
        else {
            srcLength = srcLength || src.byteLength;

            // How to get rid of this.  I clearly got rid of it by doing the
            // first if in this function.
            // @ts-ignore
            buf = Buffer.from(src.slice(srcOffset, srcLength));
        }

        for (let i = 0; i < buf.length; ++i) {
            this.buffer[offset + i] = buf[i];
        }
    }

    getUIntLE(offset: number, byteLength: 1 | 2 | 3 | 4 | 5 | 6): number { throw new Error("Not Implemented"); }
    getUIntBE(offset: number, byteLength: 1 | 2 | 3 | 4 | 5 | 6): number { throw new Error("Not Implemented"); }
    getIntLE(offset: number, byteLength: 1 | 2 | 3 | 4 | 5 | 6): number { throw new Error("Not Implemented"); }
    getIntBE(offset: number, byteLength: 1 | 2 | 3 | 4 | 5 | 6): number { throw new Error("Not Implemented"); }

    getUInt8(offset: number): number {
        return this.buffer[this.byteOffset + offset];
    }

    getInt8(offset: number): number { throw new Error("Not Implemented"); }

    getUInt16BE(offset: number): number {
        return this.buffer.readUInt16BE(offset);
    }

    getUInt16LE(offset: number): number { throw new Error("Not Implemented"); }
    getInt16BE(offset: number): number { throw new Error("Not Implemented"); }
    getInt16LE(offset: number): number { throw new Error("Not Implemented"); }

    getUInt32BE(offset: number): number {
        return this.buffer.readUInt32BE(this.byteOffset + offset);
    }

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

    setUInt8(offset: number, value: number): void {
        this.buffer.writeUInt8(value, this.byteOffset + offset);
    }

    setInt8(offset: number, value: number): void {
        this.buffer.writeInt8(value, this.byteOffset + offset);
    }

    setUInt16BE(offset: number, val: number): void {
        this.buffer.writeUInt16BE(val, this.byteOffset + offset);
    }

    setUInt16LE(offset: number, val: number): void {
        this.buffer.writeUInt16LE(val, this.byteOffset + offset);
    }

    setInt16BE(offset: number, val: number): void { throw new Error("Not Implemented"); }
    setInt16LE(offset: number, val: number): void { throw new Error("Not Implemented"); }

    setUInt32BE(offset: number, val: number): void {
        this.buffer.writeUInt32BE(val, this.byteOffset + offset);
    }

    setUInt32LE(offset: number, val: number): void { throw new Error("Not Implemented"); }
    setInt32BE(offset: number, val: number): void { throw new Error("Not Implemented"); }
    setInt32LE(offset: number, val: number): void { throw new Error("Not Implemented"); }

    setUInt64BE(offset: number, val: number): void { throw new Error("Not Implemented"); }
    setUInt64LE(offset: number, val: number): void { throw new Error("Not Implemented"); }
    setInt64BE(offset: number, val: number): void { throw new Error("Not Implemented"); }
    setInt64LE(offset: number, val: number): void { throw new Error("Not Implemented"); }

    setFloat32BE(offset: number, val: number): void { throw new Error("Not Implemented"); }
    setFloat32LE(offset: number, val: number): void { throw new Error("Not Implemented"); }

    setFloat64BE(offset: number, val: number): void { throw new Error("Not Implemented"); }
    setFloat64LE(offset: number, val: number): void { throw new Error("Not Implemented"); }

    compare(other: string | ArrayBuffer | IDataBuffer | Uint8Array | number | number[],
            otherByteOffset?: number,
            otherByteLength?: number,
            selfByteOffset?: number,
            selfByteLength?: number): -1 | 0 | 1 { throw new Error("Not Implemented"); }

    isEmpty(): boolean { throw new Error("Not Implemented"); }

    setIntBE(offset: number, value: number, byteLength?: 1 | 2 | 3 | 4 | 5 | 6): number { throw new Error("Not Implemented"); }
    setIntLE(offset: number, value: number, byteLength?: 1 | 2 | 3 | 4 | 5 | 6): number { throw new Error("Not Implemented"); }

    setUIntBE(offset: number, value: number, byteLength?: 1 | 2 | 3 | 4 | 5 | 6): number { throw new Error("Not Implemented"); }
    setUIntLE(offset: number, value: number, byteLength?: 1 | 2 | 3 | 4 | 5 | 6): number { throw new Error("Not Implemented"); }

    setView(byteOffset: number, byteLength: number): void {
        const startIdx = this.byteOffset + byteOffset;
        const endIdx = startIdx + byteLength;

        // resize the buffer itself as oppose to reducing the view.
        if (byteOffset + byteLength > this.byteLength) {
            /* tslint:disable:no-console */
            const previousBuffer = this.buffer;
            this.buffer = Buffer.alloc(byteLength);
            previousBuffer.copy(this.buffer, 0, this.byteOffset, this.byteLength);

            this.byteOffset = 0;
        } else {
            this.byteOffset = byteOffset;
            this.byteLength = byteLength
            this.byteLength = byteLength
        }
    }

    static concat(args: DataBufferConcatArrayArgs[]): IDataBuffer {
        const normalizedArr: Uint8Array[] = [];
        for (const arg of args) {
            if (arg instanceof ArrayBuffer) {
                normalizedArr.push(new Uint8Array(arg));
            }
            else if (arg instanceof Uint8Array) {
                normalizedArr.push(arg);
            }
            else if (Array.isArray(arg)) {
                normalizedArr.push(new Uint8Array(arg));
            } else {
                switch (typeof arg) {
                case "number":
                    normalizedArr.push(new Uint8Array([arg]));
                    break;
                case "object":
                    normalizedArr.push((arg as DataBuffer).buffer);
                    break;
                case "string":
                    normalizedArr.push(toUint8Array(arg));
                    break;
                }
            }
        }

        const normBuf = Buffer.concat(normalizedArr);
        return new DataBuffer(normBuf);
    }
}

