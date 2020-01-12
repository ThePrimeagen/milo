declare module "nrdp" {
    export function hash(type: string, data: string): Uint8Array;
    export function btoa(buffer: Uint8Array|ArrayBuffer|string, returnUint8Array?: boolean): string|Uint8Array;
    export function atob(buffer: Uint8Array|ArrayBuffer|string, returnUint8Array?: boolean): string|Uint8Array;
    export function atoutf8(buffer: string): Uint8Array;
    export function utf8toa(buffer: Uint8Array|ArrayBuffer): string;
}
