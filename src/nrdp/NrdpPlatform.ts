import { Platform, IpVersion, DnsResult } from "../types";
import nrdp from "./nrdp";
import createNrdpTCPNetworkPipe from "./NrdpTCPNetworkPipe";
import nrdp_platform from "./nrdp_platform";


class NrdpPlatform implements Platform {
    sha1(input: string): Uint8Array
    {
        return nrdp.hash("sha1", input);
    }

    log(...args: any[]): void { nrdp.l(...args); }
    assert(cond: any, message?: string) { nrdp.assert(cond, message); }
    btoa(buffer: Uint8Array|ArrayBuffer|string) { return nrdp.btoa(buffer); }
    atob(buffer: Uint8Array|ArrayBuffer|string) { return nrdp.atob(buffer); }
    atoutf8(buffer: Uint8Array|ArrayBuffer|string) { return nrdp.atoutf8(buffer); }
    utf8toa(buffer: Uint8Array|ArrayBuffer|string) { return nrdp.utf8toa(buffer); }
    randomBytes(bytes: number) { return nrdp_platform.random(bytes); }

    createTCPNetworkPipe(hostOrIpAddress: string, port: number) { return createNrdpTCPNetworkPipe(hostOrIpAddress, port); }
    concatBuffers(...args: ArrayBuffer[]|Uint8Array[]) {
        // @ts-ignore
        return ArrayBuffer.concat(...args);
    }
    bufferIndexOf(haystack: Uint8Array | ArrayBuffer | string, haystackOffset: number, haystackLength: number|undefined,
                  needle: Uint8Array | ArrayBuffer | string, needleOffset?: number, needleLength?: number|undefined)
    {
        return nrdp_platform.indexOf(haystack, haystackOffset, haystackLength,
                                     needle, needleOffset, needleLength);
    }

    bufferLastIndexOf(haystack: Uint8Array | ArrayBuffer | string, haystackOffset: number, haystackLength: number|undefined,
                      needle: Uint8Array | ArrayBuffer | string, needleOffset?: number, needleLength?: number|undefined)
    {
        return nrdp_platform.lastIndexOf(haystack, haystackOffset, haystackLength,
                                         needle, needleOffset, needleLength);
    }

    lookupDnsHost(host: string,
                  ipVersion: IpVersion,
                  timeout: number,
                  callback: (result: DnsResult) => void): void
    {
        nrdp.dns.lookupHost(host, ipVersion, timeout, callback);
    }
};

export default new NrdpPlatform;
