import { HTTPRequestHeaders, HTTPMethod } from "./types";

export default interface IHTTPRequest {
    networkStartTime: number,
    url: import("url-parse");
    method: HTTPMethod;
    requestHeaders: HTTPRequestHeaders;
    body?: string | Uint8Array | ArrayBuffer;
};
