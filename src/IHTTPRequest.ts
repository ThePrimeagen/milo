import IDataBuffer from "./IDataBuffer";
import { HTTPRequestHeaders, HTTPMethod } from "./types";

export default interface IHTTPRequest {
    networkStartTime: number,
    url: import("url-parse");
    method: HTTPMethod;
    requestHeaders: HTTPRequestHeaders;
    body?: string | { [key: string]: any } | Uint8Array | ArrayBuffer | IDataBuffer;
};
