import { DataBuffer } from "../types";

type DataBufferConstructor = {
    new(bytes: number): DataBuffer;
    new(ignored: null | number): DataBuffer;
    new(data: string, encoding?: string): DataBuffer;
    concat(...args: ArrayBuffer[] | Uint8Array[] | DataBuffer[]): DataBuffer;
    of(...args: number[]): DataBuffer;
};

declare global {
    const DataBuffer: DataBufferConstructor;
}
