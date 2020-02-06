import { DataBuffer } from "../databuffer";

type DataBufferConstructor = {
    new(bytes: number): DataBuffer;
    new(ignored: null | number): DataBuffer;
    new(data: string, encoding?: string): DataBuffer;
    Concat(...args: ArrayBuffer[] | Uint8Array[] | DAta) {

    };


    declare global {
        const DataBuffer: DataBufferConstructor;
    }
