import IDataBuffer from "./IDataBuffer";
import Url from "./Url";
import { HTTPRequestHeaders, HTTPMethod } from "./types";

export default interface IHTTPRequest {
    networkStartTime: number,
    url: Url,
    method: HTTPMethod;
    requestHeaders: HTTPRequestHeaders;
    body?: string | { [key: string]: any } | Uint8Array | ArrayBuffer | IDataBuffer;
};
