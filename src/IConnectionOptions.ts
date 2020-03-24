import Url from "url-parse";
import ICreateSSLNetworkPipeOptions from "./ICreateSSLNetworkPipeOptions";

export default interface IConnectionOptions extends ICreateSSLNetworkPipeOptions {
    url: Url;
    freshConnect?: boolean;
    forbidReuse?: boolean;
    connectTimeout: number;
    dnsTimeout: number;
};
