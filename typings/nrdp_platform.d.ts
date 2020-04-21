declare namespace nrdp_platform {
    type IDataBuffer = import("../src/IDataBuffer").default;
    type ArrayBufferConcatType = Uint8Array | IDataBuffer | ArrayBuffer;

    function utf8Length(str: string): number;
    function arrayBufferConcat(...buffers: ArrayBufferConcatType[]): ArrayBuffer;
    function bufferSet(dest: Uint8Array | ArrayBuffer | IDataBuffer,
                       destOffset: number,
                       src: Uint8Array | ArrayBuffer | string | IDataBuffer,
                       srcOffset?: number,
                       srcLength?: number): void;

    function random(length: number): Uint8Array;
    class Hasher {
        constructor(type: "sha1" | "sha256" | "sha512" | "md5");
        add(data: string | Uint8Array | ArrayBuffer | IDataBuffer): void;
        final(): ArrayBuffer;
        final(md: Uint8Array | ArrayBuffer | IDataBuffer): number;
        reset(): void;
    }

    namespace JSON {
        function parse(data: string | IDataBuffer): any[] | undefined;
    }
    class CompressionStream {
        constructor(method: "zlib" | "gzip", type: boolean | "compress" | "uncompress");

        process(output: Uint8Array | ArrayBuffer | IDataBuffer,
                outputOffset: number,
                outputLength: number | undefined,
                input: Uint8Array | ArrayBuffer | IDataBuffer | string,
                inputOffset?: number,
                inputLength?: number): number;

        readonly inputUsed: number;
        readonly method: string;
        readonly type: string;
    }

    function utf8Length(str: string): number;

    function parseXML(data: string | IDataBuffer): any;

    const hasServerTime: boolean;
}
