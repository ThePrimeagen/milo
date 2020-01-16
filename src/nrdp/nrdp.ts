import { IpVersion, DnsResult } from "../types";

declare namespace nrdp {
    namespace dns {
        function lookupHost(host: string,
                            ipVersion: IpVersion,
                            timeout: number,
                            callback: (result: DnsResult) => void): void;
    }
    function l(...args: any[]): void;
    function assert(cond: any, message?: string): void;
    function atoutf8(input: Uint8Array | ArrayBuffer | string): Uint8Array;
    function utf8toa(input: Uint8Array | ArrayBuffer | string, offset?: number, length?: number): string;
    function hash(type: string, data: string): Uint8Array;
    function btoa(buffer: Uint8Array|ArrayBuffer|string, returnUint8Array: true): Uint8Array;
    function btoa(buffer: Uint8Array|ArrayBuffer|string, returnUint8Array: false|undefined): string;
    function btoa(buffer: Uint8Array|ArrayBuffer|string): string;
    function atob(buffer: Uint8Array|ArrayBuffer|string, returnUint8Array: true): Uint8Array;
    function atob(buffer: Uint8Array|ArrayBuffer|string, returnUint8Array: false|undefined): string;
    function atob(buffer: Uint8Array|ArrayBuffer|string): string;
    function random(len: number): Uint8Array
}

export default nrdp;
