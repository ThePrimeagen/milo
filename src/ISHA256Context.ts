import IDataBuffer from "./IDataBuffer";

export default interface ISHA256Context {
    add(buf: Uint8Array | ArrayBuffer | IDataBuffer | string): void;

    final(): ArrayBuffer;
    final(md: ArrayBuffer | Uint8Array | IDataBuffer, offset?: number): number;
    reset(): void;
};
