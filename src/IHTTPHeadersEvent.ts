import { HTTPMethod, HTTPEncoding } from "./types";

export default interface IHTTPHeadersEvent {
    contentLength?: number;
    headers: string[];
    headersSize: number;
    httpVersion: string;
    method: HTTPMethod;
    requestSize: number;
    statusCode: number;
    timeToFirstByteRead: number;
    timeToFirstByteWritten: number;
    redirectUrl?: string;
    transferEncoding?: HTTPEncoding[];
    contentEncoding?: HTTPEncoding[];
    setCookie?: string[] | string;
};

