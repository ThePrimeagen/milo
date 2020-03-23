import NetworkPipe from "./NetworkPipe";
import { DnsType } from "./types";

export default interface IPipeResult {
    cname: string;
    connectTime: number;
    dnsChannel?: string;
    dnsTime: number;
    dnsType: DnsType;
    pipe: NetworkPipe;
};
