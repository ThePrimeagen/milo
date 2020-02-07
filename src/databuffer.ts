export type encodingType = "escaped" | "base32" | "base64" | "base64_urlsafe" | "base85" | "url" | "hex";
export type hashType = "sha1" | "sha256" | "sha512" | "md5";
export type compressionMethod = "zlib" | "zlibbase64" | "zlibgzip" | "lzham" | "lz4";
export type ConcatTypes = ArrayBuffer | Uint8Array | DataBuffer | string;
export declare class DataBuffer {
    constructor(bytes: number);
    constructor();
    constructor(data: string, encoding?: string);
    constructor(data: ArrayBuffer | DataBuffer | Uint8Array, offset?: number, length?: number);
    static concat(...args: ConcatTypes[]): DataBuffer;

    byteLength: number;
    byteOffset: number;
    bufferLength: number;
    readonly refCount: number;

    detach(): DataBuffer;
    clear(): void;

    left(length: number): DataBuffer;
    right(length: number): DataBuffer;
    mid(offset?: number, length?: number): DataBuffer;

    slice(offset?: number, length?: number): DataBuffer; // deep copy

    indexOf(needle: string | ArrayBuffer | DataBuffer | number | Uint8Array,
            offset?: number, length?: number, caseInsensitive?: boolean): number;
    lastIndexOf(needle: string | ArrayBuffer | DataBuffer | number | Uint8Array,
                offset?: number, length?: number, caseInsensitive?: boolean): number;
    includes(needle: string | ArrayBuffer | DataBuffer | number | Uint8Array,
             offset?: number, length?: number, caseInsensitive?: boolean): boolean;
    equals(other: string | ArrayBuffer | DataBuffer | Uint8Array): boolean;
    fill(data: string | ArrayBuffer | DataBuffer | number | Uint8Array,
         offset?: number, length?: number): void;
    toString(offset?: number, length?: number, enc?: encodingType): string;
    encode(enc: encodingType, offset?: number, length?: number): DataBuffer;
    decode(enc: encodingType, offset?: number, length?: number): DataBuffer;
    hash(hash: hashType, offset?: number, length?: number): DataBuffer;
    hashToString(hash: hashType, offset?: number, length?: number): string;
    compress(method: compressionMethod, offset?: number, length?: number): DataBuffer;
    uncompress(method: compressionMethod, offset?: number, length?: number): string;
    random(offset?: number, length?: number): void;

    toArrayBuffer(offset?: number, length?: number): ArrayBuffer;
    toArray(offset?: number, length?: number): [number];
    reverse(): void;

    sort(func?: (l: number, r: number) => number): void;
    every(func: (val: number, i: number, buffer: DataBuffer) => boolean, thisValue?: any): boolean;
    filter(func: (val: number, i: number, buffer: DataBuffer) => boolean, thisValue?: any): DataBuffer;
    forEach(func: (val: number, i: number, buffer: DataBuffer) => void, thisValue?: any): void;
    join(separator?: string): string;
    map(func: (val: number, i: number, buffer: DataBuffer) => number, thisValue?: any): DataBuffer;
    reduce(func: (previousValue: any, val: number, i: number, buffer: DataBuffer) => any, previousValue?: any): any;
    reduceRight(func: (previousValue: any, val: number, i: number, buffer: DataBuffer) => any, previousValue?: any): any;

    find(func: (val: number, i: number, buffer: DataBuffer) => boolean, thisValue?: any): number | undefined;
    findIndex(func: (val: number, i: number, buffer: DataBuffer) => boolean, thisValue?: any): number | undefined;

    get(offset: number): number;
    set(offset: number, src: string | ArrayBuffer | DataBuffer | number | Uint8Array, srcOffset?: number, srcLength?: number): void;

    getUIntLE(offset: number, byteLength: 1 | 2 | 3 | 4 | 5 | 6): number;
    getUIntBE(offset: number, byteLength: 1 | 2 | 3 | 4 | 5 | 6): number;
    getIntLE(offset: number, byteLength: 1 | 2 | 3 | 4 | 5 | 6): number;
    getIntBE(offset: number, byteLength: 1 | 2 | 3 | 4 | 5 | 6): number;

    getUInt8(offset: number): number;
    getInt8(offset: number): number;

    getUInt16BE(offset: number): number;
    getUInt16LE(offset: number): number;
    getInt16BE(offset: number): number;
    getInt16LE(offset: number): number;

    getUInt32BE(offset: number): number;
    getUInt32LE(offset: number): number;
    getInt32BE(offset: number): number;
    getInt32LE(offset: number): number;

    getUInt64BE(offset: number): number;
    getUInt64LE(offset: number): number;
    getInt64BE(offset: number): number;
    getInt64LE(offset: number): number;

    getFloat32BE(offset: number): number;
    getFloat32LE(offset: number): number;

    getFloat64BE(offset: number): number;
    getFloat64LE(offset: number): number;

    setUInt8(offset: number): number;
    setInt8(offset: number): number;

    setUInt16BE(offset: number, val: number): number;
    setUInt16LE(offset: number, val: number): number;
    setInt16BE(offset: number, val: number): number;
    setInt16LE(offset: number, val: number): number;

    setUInt32BE(offset: number, val: number): number;
    setUInt32LE(offset: number, val: number): number;
    setInt32BE(offset: number, val: number): number;
    setInt32LE(offset: number, val: number): number;

    setUInt64BE(offset: number, val: number): number;
    setUInt64LE(offset: number, val: number): number;
    setInt64BE(offset: number, val: number): number;
    setInt64LE(offset: number, val: number): number;

    setFloat32BE(offset: number, val: number): number;
    setFloat32LE(offset: number, val: number): number;

    setFloat64BE(offset: number, val: number): number;
    setFloat64LE(offset: number, val: number): number;
}
