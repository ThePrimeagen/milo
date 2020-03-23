import { ErrorCode } from "./types";
import IDataBuffer from "./IDataBuffer";

export default class RequestResponse {
    constructor(id: number, url: string) {
        this.id = id;
        this.url = url;
        this.headers = [];
    }
    bytesRead?: number;
    cacheKey?: ArrayBuffer;
    cname?: string;
    connectTime?: number;
    data?: string | ArrayBuffer | Uint8Array | IDataBuffer;
    dns?: string;
    dnsChannel?: string;
    dnsTime?: number;
    dnsWireTime?: number;
    duration?: number;
    errorString?: string;
    errorcode?: ErrorCode;
    errorgroup?: number;
    headers: string[];
    headersSize?: number;
    httpVersion?: string;
    id: number;
    metricsPrecision?: "us" | "ms" | "none";
    nativeErrorCode?: number;
    networkStartTime?: number;
    reason?: number;
    requestSize?: number;
    serverIp?: string;
    size?: number;
    socket?: number;
    socketReused?: boolean;
    sslHandshakeTime?: number;
    sslSessionResumed?: boolean;
    sslVersion?: string;
    state?: string;
    statusCode?: number;
    timeToFirstByteRead?: number;
    timeToFirstByteWritten?: number;
    transactionTime?: number;
    url: string;

    get urls() {
        if (this._urls)
            return this._urls;
        return [this.url];
    }

    get finalURL() {
        return this._urls ? this._urls[this._urls.length - 1] : this.url;
    }

    get responseDataLength() {
        return this.size || 0;
    }


    private _urls?: string[];
};
