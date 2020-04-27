import Url from "url-parse";
import ICreateSSLNetworkPipeOptions from "./ICreateSSLNetworkPipeOptions";
import { DnsType } from "./types";

export default interface IConnectionOptions extends ICreateSSLNetworkPipeOptions {
    url: Url;
    ipAddresses?: string[];
    dnsName?: string;
    freshConnect?: boolean;
    forbidReuse?: boolean;
    connectTimeout: number;
    dnsTimeout: number;
};
