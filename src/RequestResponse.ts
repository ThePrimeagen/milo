import { ErrorCode } from "./types";
import IDataBuffer from "./IDataBuffer";

export default class RequestResponse {
    constructor(id: number) {
        this.id = id;
        this.headers = [];
    }
    id: number;
    state?: string;
    cacheKey?: ArrayBuffer;
    bytesRead?: number;
    cname?: string;
    statusCode?: number;
    reason?: number;
    errorcode?: ErrorCode;
    errorgroup?: number;
    nativeErrorCode?: number;
    headersSize?: number;
    errorString?: string;
    dnsTime?: number;
    connectTime?: number;
    transactionTime?: number;
    duration?: number;
    timeToFirstByteRead?: number;
    timeToFirstByteWritten?: number;
    networkStartTime?: number;
    metricsPrecision?: "us" | "ms" | "none";
    requestSize?: number;
    serverIp?: string;
    sslSessionResumed?: boolean;
    sslHandshakeTime?: number;
    sslVersion?: string;
    dns?: string;
    dnsChannel?: string;
    socket?: number;
    socketReused?: boolean;
    data?: string | ArrayBuffer | Uint8Array | IDataBuffer;
    size?: number;
    urls?: string[];
    headers: string[];
    httpVersion?: string;

    get responseDataLength() {
        return this.size || 0;
    }
};
