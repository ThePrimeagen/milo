import { HTTPMethod, HTTPTransferEncoding } from "./types";

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
    transferEncoding: HTTPTransferEncoding;
};
