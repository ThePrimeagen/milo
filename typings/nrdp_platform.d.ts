declare namespace nrdp_platform {
    type IDataBuffer = import("../src/IDataBuffer").default;
    type ArrayBufferConcatType = Uint8Array | IDataBuffer | ArrayBuffer;

    function utf8Length(str: string): number;
    function arrayBufferConcat(...buffers: ArrayBufferConcatType[]): ArrayBuffer;

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

    function parseXML(data: string | IDataBuffer): any;
}
