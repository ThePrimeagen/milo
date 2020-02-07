declare namespace nrdp_platform {
    type DataBuffer = import('../src/types').DataBuffer;

    function bufferIndexOf(haystack: Uint8Array | ArrayBuffer | DataBuffer | string,
                           haystackOffset: number,
                           haystackLength: number | undefined,
                           needle: Uint8Array | ArrayBuffer | string | DataBuffer,
                           needleOffset?: number,
                           needleLength?: number | undefined,
                           caseInsensitive?: boolean): number;
    function bufferLastIndexOf(haystack: Uint8Array | ArrayBuffer | DataBuffer | string,
                               haystackOffset: number,
                               haystackLength: number | undefined,
                               needle: Uint8Array | ArrayBuffer | DataBuffer | string,
                               needleOffset?: number,
                               needleLength?: number | undefined,
                               caseInsensitive?: boolean): number;
    function bufferSet(dest: Uint8Array | ArrayBuffer | DataBuffer,
                       destOffset: number,
                       src: Uint8Array | ArrayBuffer | string | DataBuffer,
                       srcOffset?: number,
                       srcLength?: number | undefined): void;
    function random(length: number): Uint8Array;
    class Hasher {
        constructor(type: "sha1" | "sha256" | "sha512" | "md5");
        add(data: string | Uint8Array | ArrayBuffer | DataBuffer): void;
        final(): ArrayBuffer;
        final(md: Uint8Array | ArrayBuffer | DataBuffer): number;
        reset(): void;
    }
}
