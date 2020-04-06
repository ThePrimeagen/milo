import IDataBuffer from "./IDataBuffer";

export default interface ICompressionStream {
    process(output: Uint8Array | ArrayBuffer | IDataBuffer,
            outputOffset: number,
            outputLength: number | undefined,
            input: Uint8Array | ArrayBuffer | IDataBuffer | string,
            inputOffset?: number,
            inputLength?: number): number;

    readonly inputUsed: number;
    readonly method: string;
    readonly type: string;
};
