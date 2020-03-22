import { CompressionMethod, EncodingType, HashType } from "./types";

export default interface IDataBuffer {
    // properties
    bufferLength: number;
    byteLength: number;
    byteOffset: number;
    readonly refCount: number;

    // methods
    clear(): void;
    compare(other: string | ArrayBuffer | IDataBuffer | Uint8Array | number | number[],
            otherByteOffset?: number,
            otherByteLength?: number,
            selfByteOffset?: number,
            selfByteLength?: number): -1 | 0 | 1;
    /**
     * Deep Copy
     */
    compress(method: CompressionMethod, offset?: number, length?: number): IDataBuffer;
    /**
     * Deep Copy
     */
    decode(enc: EncodingType, offset?: number, length?: number): IDataBuffer;
    detach(): void;
    encode(enc: EncodingType, offset?: number, length?: number): IDataBuffer;
    equals(other: string | ArrayBuffer | IDataBuffer | Uint8Array | number | number[]): boolean;
    every(func: (value: number, i: number, buffer: IDataBuffer) => boolean, thisValue?: any): boolean;
    fill(data: string | ArrayBuffer | IDataBuffer | number | Uint8Array,
         offset?: number, length?: number): void;

    /**
     * Deep Copy
     */
    filter(func: (value: number, i: number, buffer: IDataBuffer) => boolean, thisValue?: any): IDataBuffer;
    find(func: (value: number, i: number, buffer: IDataBuffer) => boolean, thisValue?: any): number | undefined;
    findIndex(func: (value: number, i: number, buffer: IDataBuffer) => boolean, thisValue?: any): number | undefined;
    forEach(func: (value: number, i: number, buffer: IDataBuffer) => void, thisValue?: any): void;

    get(offset: number): number;
    getFloat32(offset: number): number;
    getFloat32BE(offset: number): number;
    getFloat32LE(offset: number): number;
    getFloat64(offset: number): number;
    getFloat64BE(offset: number): number;
    getFloat64LE(offset: number): number;
    getInt(offset: number, byteLength?: 1 | 2 | 3 | 4 | 5 | 6): number;
    getInt16(offset: number): number;
    getInt16BE(offset: number): number;
    getInt16LE(offset: number): number;
    getInt32(offset: number): number;
    getInt32BE(offset: number): number;
    getInt32LE(offset: number): number;
    getInt64(offset: number): number;
    getInt64BE(offset: number): number;
    getInt64LE(offset: number): number;
    getInt8(offset: number): number;
    getIntBE(offset: number, byteLength?: 1 | 2 | 3 | 4 | 5 | 6): number;
    getIntLE(offset: number, byteLength?: 1 | 2 | 3 | 4 | 5 | 6): number;
    getUInt(offset: number, byteLength?: 1 | 2 | 3 | 4 | 5 | 6): number;
    getUInt16(offset: number): number;
    getUInt16BE(offset: number): number;
    getUInt16LE(offset: number): number;
    getUInt32(offset: number): number;
    getUInt32BE(offset: number): number;
    getUInt32LE(offset: number): number;
    getUInt64(offset: number): number;
    getUInt64BE(offset: number): number;
    getUInt64LE(offset: number): number;
    getUInt8(offset: number): number;
    getUIntBE(offset: number, byteLength?: 1 | 2 | 3 | 4 | 5 | 6): number;
    getUIntLE(offset: number, byteLength?: 1 | 2 | 3 | 4 | 5 | 6): number;

    hash(hash: HashType, offset?: number, length?: number): IDataBuffer;
    hashToString(hash: HashType, offset?: number, length?: number): string;

    includes(needle: string | ArrayBuffer | IDataBuffer | number | Uint8Array | number[],
             offset?: number, length?: number, caseInsensitive?: boolean): boolean;

    indexOf(needle: string | ArrayBuffer | IDataBuffer | number | Uint8Array | number[],
            offset?: number, length?: number, caseInsensitive?: boolean): number;

    isEmpty(): boolean;
    join(separator?: string): string;
    lastIndexOf(needle: string | ArrayBuffer | IDataBuffer | number | Uint8Array | number[],
                offset?: number, length?: number, caseInsensitive?: boolean): number;

    map(func: (value: number, i: number, buffer: IDataBuffer) => number, thisValue?: any): IDataBuffer;
    randomize(offset?: number, length?: number): void;
    reduce(func: (previousValue: any, value: number, i: number,
                  buffer: IDataBuffer) => any, previousValue?: any): any;
    reduceRight(func: (previousValue: any, value: number, i: number,
                       buffer: IDataBuffer) => any, previousValue?: any): any;

    reverse(offset?: number, length?: number): void;

    set(offset: number, src: string | ArrayBuffer | IDataBuffer | number | Uint8Array | number[],
        srcOffset?: number, srcLength?: number): void;
    setFloat32(offset: number, value: number): void;
    setFloat32BE(offset: number, value: number): void;
    setFloat32LE(offset: number, value: number): void;
    setFloat64(offset: number, value: number): void;
    setFloat64BE(offset: number, value: number): void;
    setFloat64LE(offset: number, value: number): void;
    setInt(offset: number, value: number, byteLength?: 1 | 2 | 3 | 4 | 5 | 6): void;
    setInt16(offset: number, value: number): void;
    setInt16BE(offset: number, value: number): void;
    setInt16LE(offset: number, value: number): void;
    setInt32(offset: number, value: number): void;
    setInt32BE(offset: number, value: number): void;
    setInt32LE(offset: number, value: number): void;
    setInt64(offset: number, value: number): void;
    setInt64BE(offset: number, value: number): void;
    setInt64LE(offset: number, value: number): void;
    setInt8(offset: number, value: number): void;
    setIntBE(offset: number, value: number, byteLength?: 1 | 2 | 3 | 4 | 5 | 6): void;
    setIntLE(offset: number, value: number, byteLength?: 1 | 2 | 3 | 4 | 5 | 6): void;
    setUInt(offset: number, value: number, byteLength?: 1 | 2 | 3 | 4 | 5 | 6): void;
    setUInt16(offset: number, value: number): void;
    setUInt16BE(offset: number, value: number): void;
    setUInt16LE(offset: number, value: number): void;
    setUInt32(offset: number, value: number): void;
    setUInt32BE(offset: number, value: number): void;
    setUInt32LE(offset: number, value: number): void;
    setUInt64(offset: number, value: number): void;
    setUInt64BE(offset: number, value: number): void;
    setUInt64LE(offset: number, value: number): void;
    setUInt8(offset: number, value: number): void;
    setUIntBE(offset: number, value: number, byteLength?: 1 | 2 | 3 | 4 | 5 | 6): void;
    setUIntLE(offset: number, value: number, byteLength?: 1 | 2 | 3 | 4 | 5 | 6): void;

    setView(byteOffset: number, byteLength: number): void;

    /**
     * Deep Copy
     */
    slice(offset?: number, length?: number): IDataBuffer;

    sort(func?: (l: number, r: number) => number): this;

    /**
     * Subarray with length instead of endIdx
     *
     * equivalent to.
     * const offset = this.byteOffset + offset;
     * subarray(offset, offset + length);
     *
     *
     * Shallow Copy
     */
    subarray(offset?: number, length?: number): IDataBuffer;

    toArray(offset?: number, length?: number): number[];

    /**
     * Deep Copy
     */
    toArrayBuffer(offset?: number, length?: number): ArrayBuffer;

    toString(enc?: EncodingType, offset?: number, length?: number): string;
    uncompress(method: CompressionMethod, offset?: number, length?: number): string;
}
