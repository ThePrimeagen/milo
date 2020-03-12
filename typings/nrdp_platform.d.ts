declare namespace nrdp_platform {
    type IDataBuffer = import("../src/types").IDataBuffer;

    function bufferIndexOf(haystack: Uint8Array | ArrayBuffer | IDataBuffer | string,
                           haystackOffset: number,
                           haystackLength: number | undefined,
                           needle: Uint8Array | ArrayBuffer | string | IDataBuffer,
                           needleOffset?: number,
                           needleLength?: number | undefined,
                           caseInsensitive?: boolean): number;
    function bufferLastIndexOf(haystack: Uint8Array | ArrayBuffer | IDataBuffer | string,
                               haystackOffset: number,
                               haystackLength: number | undefined,
                               needle: Uint8Array | ArrayBuffer | IDataBuffer | string,
                               needleOffset?: number,
                               needleLength?: number | undefined,
                               caseInsensitive?: boolean): number;
    function bufferSet(dest: Uint8Array | ArrayBuffer | IDataBuffer,
                       destOffset: number,
                       src: Uint8Array | ArrayBuffer | string | IDataBuffer,
                       srcOffset?: number,
                       srcLength?: number | undefined): void;
    function random(length: number): Uint8Array;
    class Hasher {
        constructor(type: "sha1" | "sha256" | "sha512" | "md5");
        add(data: string | Uint8Array | ArrayBuffer | IDataBuffer): void;
        final(): ArrayBuffer;
        final(md: Uint8Array | ArrayBuffer | IDataBuffer): number;
        reset(): void;
    }

    function utf8Length(str: string): number;
}
