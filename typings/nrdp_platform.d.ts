declare namespace nrdp_platform {
    function bufferIndexOf(haystack: Uint8Array | ArrayBuffer | string,
                           haystackOffset: number,
                           haystackLength: number | undefined,
                           needle: Uint8Array | ArrayBuffer | string,
                           needleOffset?: number,
                           needleLength?: number | undefined,
                           caseInsensitive?: boolean): number;
    function bufferLastIndexOf(haystack: Uint8Array | ArrayBuffer | string,
                               haystackOffset: number,
                               haystackLength: number | undefined,
                               needle: Uint8Array | ArrayBuffer | string,
                               needleOffset?: number,
                               needleLength?: number | undefined,
                               caseInsensitive?: boolean): number;
    function bufferSet(dest: Uint8Array | ArrayBuffer,
                       destOffset: number,
                       src: Uint8Array | ArrayBuffer | string,
                       srcOffset?: number,
                       srcLength?: number | undefined): void;
    function random(length: number): Uint8Array;
}