import { IpVersion } from "./types";

export default interface ICreateTCPNetworkPipeOptions {
    hostname: string; // could be an ip literal
    port: number;
    connectTimeout: number;
    dnsTimeout: number;
    ipVersion: IpVersion;
    ipAddresses?: string[];
    dnsName?: string;
};
