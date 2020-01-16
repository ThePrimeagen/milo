import { Platform, IpVersion, DnsResult } from "../types";
import nrdp from "./nrdp";
import createNrdpTCPNetworkPipe from "./NrdpTCPNetworkPipe";
import nrdp_platform from "./nrdp_platform";


class NrdpPlatform implements Platform {
    sha1(input: string): Uint8Array { return nrdp.hash("sha1", input); }

    log = nrdp.l;
    assert = nrdp.assert;
    btoa = nrdp.btoa;
    atob = nrdp.atob;
    atoutf8 = nrdp.atoutf8;
    utf8toa = nrdp.utf8toa;
    randomBytes = nrdp_platform.random;

    createTCPNetworkPipe = createNrdpTCPNetworkPipe;
    concatBuffers(...args: ArrayBuffer[]|Uint8Array[]) {
        // @ts-ignore
        return ArrayBuffer.concat(...args);
    }
    bufferIndexOf = nrdp_platform.indexOf;
    bufferLastIndexOf = nrdp_platform.lastIndexOf;
    lookupDnsHost = nrdp.dns.lookupHost.bind(nrdp.dns);
};

export default new NrdpPlatform;
