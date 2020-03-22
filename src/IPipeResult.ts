import NetworkPipe from "./NetworkPipe";
import { DnsType } from "./types";

export default interface IPipeResult {
    pipe: NetworkPipe;
    dnsTime: number;
    dnsType: DnsType;
    dnsChannel?: string;
    cname: string;
    connectTime: number;
};
