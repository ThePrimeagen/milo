import Url from "url-parse";

export default interface IConnectionOptions {
    url: Url;
    freshConnect?: boolean;
    forbidReuse?: boolean;
    connectTimeout: number;
    dnsTimeout: number;
};
