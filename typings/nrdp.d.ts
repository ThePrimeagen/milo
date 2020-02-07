declare namespace nrdp {
    type DataBuffer = import('../src/types').DataBuffer;
    type IpVersion = import('../src/types').IpVersion;
    type DnsResult = import('../src/types').DnsResult;

    namespace dns {
        function lookupHost(host: string,
                            ipVersion: IpVersion,
                            timeout: number,
                            callback: (result: DnsResult) => void): void;
    }

    namespace device {
        let UILanguages: string[];
        let ipConnectivityMode: "4" | "6" | "dual" | "invalid";
    }

    namespace gibbon {
        let location: string;
    }

    namespace l {
        function success(...args: any[]): void;
        function error(...args: any[]): void;
        function trace(...args: any[]): void;
    }

    namespace options {
        let default_network_connect_timeout: number;
        let default_network_delay: number;
        let default_network_dns_fallback_timeout_wait_for_4: number;
        let default_network_dns_fallback_timeout_wait_for_6: number;
        let default_network_dns_timeout: number;
        let default_network_happy_eyeballs_head_start: number;
        let default_network_low_speed_limit: number;
        let default_network_low_speed_time: number;
        let default_network_max_recv_speed: number;
        let default_network_max_send_speed: number;
        let default_network_timeout: number;
    }

    function exit(exitCode: number): void;
    function stacktrace(): string;
    function now(): number;
    let trustStoreHash: string;
    let trustStore: ArrayBuffer;

    let cipherList: string;

    function mono(): number;

    function assert(cond: any, message?: string): void;
    function atoutf8(input: Uint8Array | ArrayBuffer | DataBuffer | string): Uint8Array;
    function utf8toa(input: Uint8Array | ArrayBuffer | DataBuffer | string, offset?: number, length?: number): string;
    function hash(type: string, data: Uint8Array | ArrayBuffer | DataBuffer | string): Uint8Array;
    function btoa(buffer: Uint8Array | ArrayBuffer | DataBuffer | string, returnUint8Array: true): Uint8Array;
    function btoa(buffer: Uint8Array | ArrayBuffer | DataBuffer | string, returnUint8Array: false | undefined): string;
    function btoa(buffer: Uint8Array | ArrayBuffer | DataBuffer | string): string;
    function atob(buffer: Uint8Array | ArrayBuffer | DataBuffer | string, returnUint8Array: true): Uint8Array;
    function atob(buffer: Uint8Array | ArrayBuffer | DataBuffer | string, returnUint8Array: false | undefined): string;
    function atob(buffer: Uint8Array | ArrayBuffer | DataBuffer | string): string;
}
