declare namespace nrdp {
    type IDataBuffer = import("../src/IDataBuffer").default;
    type IpVersion = import("../src/types").IpVersion;
    type IDnsResult = import("../src/IDnsResult").default;
    type RequestResponse = import("../src/RequestResponse").default;
    type IRequestData = import("../src/IRequestData").default;
    type IMilo = import("../src/IMilo").default;

    namespace dns {
        function lookupHost(host: string,
                            ipVersion: IpVersion,
                            timeout: number,
                            callback: (result: IDnsResult) => void): void;
    }

    namespace device {
        let UILanguages: string[];
        let ipConnectivityMode: "4" | "6" | "dual" | "invalid";
        let tlsv13SmallAssetsEnabled: boolean;
        let tlsv13StreamingEnabled: boolean;
        const SDKVersion: { [key: string]: any };
        const ESNPrefix: string;
        const certificationVersion: number;
    }

    namespace gibbon {
        let location: string;
        let load: (req: IRequestData | string, callback?: (response: RequestResponse) => void) => number;
        let loadScript: (req: IRequestData | string, callback?: (response: RequestResponse) => void) => number;
        let stopLoad: (id: number) => void;
        const eval: (data: string | Uint8Array | IDataBuffer | ArrayBuffer, url: string) => any;
    }

    namespace resourcemanager {
        function processCookie(url: string, value?: string): void;
        function cookies(url: string): string;
    }

    namespace l {
        function success(...args: any[]): void;
        function error(...args: any[]): void;
        function trace(...args: any[]): void;
    }

    namespace options {
        /* tslint:disable:variable-name */
        const default_network_connect_timeout: number;
        const default_network_delay: number;
        const default_network_dns_fallback_timeout_wait_for_4: number;
        const default_network_dns_fallback_timeout_wait_for_6: number;
        const default_network_dns_timeout: number;
        const default_network_happy_eyeballs_head_start: number;
        const default_network_low_speed_limit: number;
        const default_network_low_speed_time: number;
        const default_network_max_recv_speed: number;
        const default_network_max_send_speed: number;
        const default_network_timeout: number;
        const ssl_peer_verification: boolean;
        const send_secure_cookies: boolean;
    }

    function exit(exitCode?: number): void;
    function stacktrace(): string;
    function now(): number;
    const trustStoreHash: string;
    let trustStore: ArrayBuffer;

    let cipherList: string;

    function mono(): number;

    function assert(cond: any, message: string): void;
    function atoutf8(input: Uint8Array | ArrayBuffer | IDataBuffer | string): Uint8Array;
    function utf8toa(input: Uint8Array | ArrayBuffer | IDataBuffer | string, offset?: number, length?: number): string;
    function hash(type: string, data: Uint8Array | ArrayBuffer | IDataBuffer | string): Uint8Array;
    function btoa(buffer: Uint8Array | ArrayBuffer | IDataBuffer | string, returnUint8Array: true): Uint8Array;
    /* tslint:disable:unified-signatures */
    function btoa(buffer: Uint8Array | ArrayBuffer | IDataBuffer | string, returnUint8Array: false | undefined): string;
    function btoa(buffer: Uint8Array | ArrayBuffer | IDataBuffer | string): string;
    function atob(buffer: Uint8Array | ArrayBuffer | IDataBuffer | string, returnUint8Array: true): Uint8Array;
    function atob(buffer: Uint8Array | ArrayBuffer | IDataBuffer | string, returnUint8Array: false | undefined): string;
    function atob(buffer: Uint8Array | ArrayBuffer | IDataBuffer | string): string;

    const js_options: any;

    let milo: IMilo | undefined;
}
