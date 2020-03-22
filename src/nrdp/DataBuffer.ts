import IDataBuffer from "../IDataBuffer";
type ConcatTypes = ArrayBuffer | Uint8Array | IDataBuffer | string | number[] | number;
type DataBufferConstructor = {
    new(bytes?: number): IDataBuffer;
    new(data: string, encoding?: string): IDataBuffer;
    new(data: ArrayBuffer | IDataBuffer | Uint8Array, offset?: number, length?: number): IDataBuffer;
    compare(lhs: ConcatTypes, rhs: ConcatTypes): -1 | 0 | 1;
    concat(...args: ConcatTypes[]): IDataBuffer
    of(...args: ConcatTypes[]): IDataBuffer;
    random(size: number): IDataBuffer;
}

declare const DataBuffer: DataBufferConstructor;
export default DataBuffer;

