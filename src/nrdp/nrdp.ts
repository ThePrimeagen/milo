import { DnsResult, IpVersion } from "../types";

interface nrdp {
    dns: {
        lookupHost(host: string,
                   ipVersion: IpVersion,
                   timeout: number,
                   callback: (result: DnsResult) => void): void;
    }

    device: {
        UILanguages: string[];
        ipConnectivityMode: "4" | "6" | "dual" | "invalid";
    }

    gibbon: {
        location: string;
    }

    l: {
        success(...args: any[]): void;
        error(...args: any[]): void;
        trace(...args: any[]): void;
    }

    options: {
        default_network_connect_timeout: number;
        default_network_delay: number;
        default_network_dns_fallback_timeout_wait_for_4: number;
        default_network_dns_fallback_timeout_wait_for_6: number;
        default_network_dns_timeout: number;
        default_network_happy_eyeballs_head_start: number;
        default_network_low_speed_limit: number;
        default_network_low_speed_time: number;
        default_network_max_recv_speed: number;
        default_network_max_send_speed: number;
        default_network_timeout: number;
    }

    exit(exitCode: number): void;
    stacktrace(): string;
    now(): number;
    trustStoreHash: string;
    trustStore: ArrayBuffer;

    cipherList: string;

    mono(): number;

    assert(cond: any, message?: string): void;
    atoutf8(input: Uint8Array | ArrayBuffer | string): Uint8Array;
    utf8toa(input: Uint8Array | ArrayBuffer | string, offset?: number, length?: number): string;
    hash(type: string, data: string): Uint8Array;
    btoa(buffer: Uint8Array | ArrayBuffer | string, returnUint8Array: true): Uint8Array;
    btoa(buffer: Uint8Array | ArrayBuffer | string, returnUint8Array: false | undefined): string;
    btoa(buffer: Uint8Array | ArrayBuffer | string): string;
    atob(buffer: Uint8Array | ArrayBuffer | string, returnUint8Array: true): Uint8Array;
    atob(buffer: Uint8Array | ArrayBuffer | string, returnUint8Array: false | undefined): string;
    atob(buffer: Uint8Array | ArrayBuffer | string): string;
}

// @ts-ignore
export default globalThis.nrdp as nrdp;
