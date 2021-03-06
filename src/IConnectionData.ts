import IConnectionDataSSL from "./IConnectionDataSSL";
import { DnsType } from "./types";

export default interface IConnectionData extends IConnectionDataSSL {
    cname: string;
    connectTime: number;
    dnsChannel: string;
    // this is how long it took us to get a dns result, regardless of
    // happy eyeballs, caches etc
    dnsTime: number;
    // this is the time it took the platform to get this particular
    // dns result
    dnsWireTime: number;
    dnsType: DnsType;
    socketReused: boolean;
};
