declare namespace nrdp_platform {
    function indexOf(haystack: Uint8Array | ArrayBuffer | string, haystackOffset: number, haystackLength: number|undefined,
                     needle: Uint8Array | ArrayBuffer | string, needleOffset?: number, needleLength?: number|undefined): number;
    function lastIndexOf(haystack: Uint8Array | ArrayBuffer | string, haystackOffset: number, haystackLength: number|undefined,
                         needle: Uint8Array | ArrayBuffer | string, needleOffset?: number, needleLength?: number|undefined): number;
    function random(length: number): Uint8Array;
}

export default nrdp_platform;
