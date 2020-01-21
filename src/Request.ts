// import * as Url from "url-parse";
import Url = require("url-parse");
import Platform from "./Platform";
import { NetworkPipe, DnsResult } from "./types";
import { ChunkyParser } from "./http1/ChunkyParser";
import { assert } from "./utils"

let recvBuffer = new Uint8Array(8192);
let nextId = 0;

export enum DnsType {
    DNS_Unknown = 0,
    DNS_Literal = 1,
    DNS_HostsFile = 2,
    DNS_Lookup = 3,
    DNS_CacheHit = 4,
    DNS_Preresolved = 5
};

export interface RequestTimeouts
{
    timeout?: number;
    connectTimeout?: number;
    dnsTimeout?: number;
    dnsFallbackTimeoutWaitFor4?: number;
    dnsFallbackTimeoutWaitFor6?: number;
    happyEyeballsHeadStart?: number;
    lowSpeedLimit?: number;
    lowSpeedTime?: number; // ### this is in seconds in curl
    delay?: number;
};

export interface RequestData
{
    url: string;
    baseUrl?: string;
    method?: "POST" | "HEAD" | "PUT" | "DELETE" | "PATCH" | "GET";
    body?: string | ArrayBuffer | Uint8Array,
    timeouts?: RequestTimeouts;
    ipConnectivityMode?: 4 | 6 | 10;
    freshConnect?: boolean;
    forbidReuse?: boolean;
    format?: string;
    async?: boolean;
    pipeWait?: boolean;
    debugThroughput?: boolean;
    noProxy?: boolean;
    tcpNoDelay?: boolean;
    secure?: boolean;
    networkMetricsPrecision?:  "us" | "ms" | "none";
    receiveBufferSize?: number;
    maxRecvSpeed?: number;
    maxSendSpeed?: number;
    ipAddresses?: string[];
    dnsTime?: number;
    dnsChannel?: string;
    dnsType?: DnsType;
    headers?: { [key: string]: string };
    cache?: string;
    http2?: boolean;
    weight?: number;
    exclusiveDepends?: boolean;
    dependsOn?: string | ArrayBuffer | Uint8Array | number;
};

export class RequestResponse
{
    constructor(id: number)
    {
        this.id = id;
        this.headers = [];
    }
    id: number;
    state?: string;
    cacheKey?: ArrayBuffer;
    statusCode?: number;
    errorCode?: number;
    reason?: number;
    errorcode?: number;
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
    sslVersion?: string|undefined;
    dns?: string;
    dnsChannel?: string;
    socket?: number;
    data?: string|{}|Uint8Array;
    size?: number;
    urls?: string[];
    headers: string[];
    httpVersion?: string;
};

enum RequestState
{
    Initial = 0,
    Connected = 1,
    ReceivedHeaders = 2,
    Closed = 3,
    Finished = 4,
    Error = -1
};

export class Request
{
    state?: RequestState;
    requestData: RequestData;
    url: Url;
    id: number;
    networkPipe?: NetworkPipe;

    private resolve?: Function;
    private reject?: Function;
    private dnsResult?: DnsResult;
    private writeBuffer?: Uint8Array;
    private writeBufferOffset?: number;
    private requestResponse: RequestResponse;
    private headerBuffer?: ArrayBuffer;
    private responseData?: Uint8Array;
    private responseDataOffset: number = 0;
    private responseDataArray?: ArrayBuffer[];
    private chunks?: ArrayBuffer[];
    private chunkyParser?: ChunkyParser
    private bytesReceived: number = 0;
    private connection?: string;
    private onConnections: Array<() => void>;

    constructor(data: RequestData | string)
    {
        this.onConnections = [];
        this.id = ++nextId;
        this.requestResponse = new RequestResponse(this.id);
        if (typeof data === "string") {
            data = { url: data };
        }
        if (data.http2) {
            throw new Error("http2 not implemented yet");
        }


        this.requestData = data;
        this.url = new Url(this.requestData.url, this.requestData.baseUrl || Platform.location);
        this.state = RequestState.Initial;
        return this;
    }

    onConnection(cb: () => void) {
        if (this.state === RequestState.Connected) {
            cb();
            return;
        }
        this.onConnections.push(cb);
    }

    send(): Promise<RequestResponse> {
        // Platform.log("send called", this.state, this.url);
        if (this.state != RequestState.Initial) {
            throw new Error("Bad state transition");
        }

        Platform.log("Request#send");
        const ret = new Promise<RequestResponse>((resolve, reject) => {
            Platform.log("Request#send return promise");
            this.resolve = resolve;
            this.reject = reject;
        });

        let port: number = 0;
        if (this.url.port) {
            port = parseInt(this.url.port);
        }

        Platform.log("Request#send port", port);
        if (!port) {
            switch (this.url.protocol) {
                case "https:":
                case "wss:":
                    port = 443;
                    break;
                default:
                    port = 80;
                    break;
            }
        }
        debugger;
        Platform.log("Request#send creating TCP pipe");
        Platform.createTCPNetworkPipe({ host: this.url.hostname, port: port }).then((pipe: NetworkPipe) => {
            Platform.log("Request#send#createTCPNetworkPipe pipe");
            this.networkPipe = pipe;
            this.networkPipe.onclose = this._onNetworkPipeClose.bind(this);
            this.networkPipe.onerror = this._onNetworkPipeError.bind(this);
            this.networkPipe.ondata = this._onNetworkPipeData.bind(this);

            this.transition(RequestState.Connected);
        }, (err: Error) => {
            Platform.log("Request#send#createTCPNetworkPipe error", err);
            this._httpError(-1, err.toString());
        });

        return ret;
    }

    private transition(state: RequestState): void {
        Platform.log("transition", this.state, "to", state);
        this.state = state;
        switch (state) {
            case RequestState.Initial:
                throw new Error("Invalid state transition to Initial");
            case RequestState.Connected:
                const method = this.requestData.method || (this.requestData.body ? "POST" : "GET");
                let str =
`${method} ${this.url.pathname || "/"} HTTP/1.1\r
Host: ${this.url.hostname}\r
User-Agent: Milo 0.1\r
Accept: */*\r\n`;
                if (this.requestData.headers) {
                    for (let key in this.requestData.headers) {
                        str += `${key}: ${this.requestData.headers[key]}\r\n`;
                    }
                }
                if (this.requestData.cache) {
                    str += `X-Gibbon-Cache-Control: ${this.requestData.cache}\r\n`;
                }

                const lang = Platform.UILanguages;
                if (lang && lang.length) {
                    str += `Language: ${lang.join(",")}\r\n`;
                }

                str += "\r\n";

                assert(this.networkPipe, "Must have network pipe");
                this.networkPipe.write(str);

                break;
            case RequestState.Closed:
                this.transition(RequestState.Finished);
                break;
            case RequestState.Error:
                break;
            case RequestState.Finished:
                let responseArrayBuffer: ArrayBuffer;
                if (this.chunks) {
                    responseArrayBuffer = Platform.concatBuffers.apply(undefined, this.chunks);
                } else if (this.responseDataArray) {
                    Platform.log("GOT HERE 1", this.responseDataArray);
                    responseArrayBuffer = Platform.concatBuffers.apply(undefined, this.responseDataArray);
                } else if (this.responseData) {
                    Platform.log("GOT HERE 2", this.responseData);
                    responseArrayBuffer = this.responseData;
                } else {
                    responseArrayBuffer = new ArrayBuffer(0);
                }
                Platform.log("BALLS", this.requestData.format, responseArrayBuffer);
                switch (this.requestData.format) {
                    case "xml":
                    case "json":
                    case "jsonstream":
                    case "none":
                        throw new Error("Not implemented " + this.requestData.format);
                        break;
                    case "arraybuffer":
                        this.requestResponse.data = responseArrayBuffer;
                        break;
                    case "uint8array":
                        if (responseArrayBuffer)
                            this.requestResponse.data = new Uint8Array(responseArrayBuffer);
                        break;
                    default:
                        if (responseArrayBuffer) {
                            this.requestResponse.data = Platform.utf8toa(responseArrayBuffer);
                            Platform.log("fuck", this.requestResponse.data);
                        }
                        break;
                }
                assert(this.resolve, "Must have resolve");
                this.resolve(this.requestResponse);
                break;
        }
    }
    private _httpError(code: number, text: string): void {
        Platform.log("got error", code, text);
        assert(this.reject, "Must have reject");
        if (this.networkPipe)
            this.networkPipe.close();
        this.reject(code, text);
    }

    private _onNetworkPipeError(code: number, message?: string) {
        assert(this.reject, "Must have reject");
        this.reject(code, message);
    }

    private _onNetworkPipeClose() {
        Platform.log("got closed", Platform.stacktrace());
        this.transition(RequestState.Finished);
    }

    private _onNetworkPipeData(): void {
        while (true) {
            assert(this.networkPipe, "Must have network pipe");
            const read = this.networkPipe.read(recvBuffer, 0, recvBuffer.byteLength);
            if (read <= 0) {
                break;
            } else {
                this.bytesReceived += read;
                if (this.state === RequestState.Connected) { // waiting for headers
                    Platform.assert(!this.requestResponse.headers, "Shouldn't have headers here");
                    if (this.headerBuffer) {
                        this.headerBuffer = Platform.concatBuffers(this.headerBuffer, read < recvBuffer.byteLength ? recvBuffer.buffer.slice(0, read) : recvBuffer);
                    } else {
                        this.headerBuffer = recvBuffer.buffer.slice(0, read);
                    }
                    const rnrn = Platform.bufferIndexOf(this.headerBuffer, 0, undefined, "\r\n\r\n");
                        debugger;
                    if (rnrn != -1 && this._parseHeaders(rnrn)) {
                        this.transition(RequestState.ReceivedHeaders);
                        const remaining = this.headerBuffer.byteLength - (rnrn + 4);
                        if (remaining)
                            this._processResponseData(this.headerBuffer, this.headerBuffer.byteLength - remaining, remaining);
                        this.headerBuffer = undefined;
                        debugger;
                        if (this.connection == "Upgrade") {
                            this.transition(RequestState.Finished);
                        }
                    }
                } else {
                    Platform.assert(this.state === RequestState.ReceivedHeaders, "State unrest");
                    this._processResponseData(recvBuffer.buffer, 0, read);
                }
            }
        }
    }

    private _parseHeaders(rnrn: number): boolean {
        assert(this.headerBuffer, "Must have headerBuffer");
        const str = Platform.utf8toa(this.headerBuffer, 0, rnrn);
        const split = str.split("\r\n");
        // Platform.log("got string\n", split);
        const statusLine = split[0];
        Platform.log("got status", statusLine);
        if (statusLine.lastIndexOf("HTTP/1.", 0) != 0) {
            this._httpError(-1, "Bad status line " + statusLine);
            return false;
        }
        if (statusLine[7] == "1") {

        } else if (statusLine[7] == "0") {

        } else {
            this._httpError(-1, "Bad status line " + statusLine);
            return false;
        }

        const space = statusLine.indexOf(' ', 9);
        // Platform.log("got status", space, statusLine.substring(9, space))
        this.requestResponse.statusCode = parseInt(statusLine.substring(9, space));
        if (isNaN(this.requestResponse.statusCode) || this.requestResponse.statusCode < 0) {
            this._httpError(-1, "Bad status line " + statusLine);
            return false;
        }

        // this.requestResponse.headers = new ResponseHeaders;
        let contentLength: string | undefined;
        let transferEncoding: string | undefined;
        this.requestResponse.headers = [];

        for (var i=1; i<split.length; ++i) {
            // split \r\n\r\n by \r\n causes 2 empty lines.
            if (split.length === 0) {
                Platform.log("IGNORING LINE....");
                continue;
            }
            let idx = split[i].indexOf(":");
            if (idx <= 0) {
                this._httpError(-1, "Bad header " + split[i]);
                return false;
            }
            const key = split[i].substr(0, idx);
            ++idx;
            while (split[i].charCodeAt(idx) === 32) {
                ++idx;
            }
            let end = split[i].length;
            while (end > idx && split[i].charCodeAt(end - 1) === 32)
                --end;

            const lower = key.toLowerCase();
            const value = split[i].substring(idx, end);
            if (lower === "content-length") {
                contentLength = value;
            } else if (lower === "transfer-encoding") {
                transferEncoding = value;
            } else if (lower == "connection") {
                this.connection = value;
            }
            this.requestResponse.headers.push(key + ": " + value);
        }
        Platform.log("headers", this.requestResponse.headers);
        if (contentLength) {
            const len = parseInt(contentLength);
            if (len > 0 && len < 1024 * 1024 * 16) {
                this.responseData = new Uint8Array(len);
            } else {
                this._httpError(-1, "Bad content length " + len);
                return false;
            }
        } else if (transferEncoding === "chunked") {
            this.chunks = [];
            this.chunkyParser = new ChunkyParser;
        } else {
            this.responseDataArray = [];
        }
        return true;
    }

    private _processResponseData(data: ArrayBuffer, offset: number, length: number): void {
        // Platform.log("got some data here", length, Platform.utf8toa(data.slice(offset, offset + length)));
        if (this.chunks) {
            throw new Error("Gotta implment chunks");
        } else if (this.responseData) {
            // ### should make this more efficient, also should make it okay to set an arraybuffer
            this.responseData.set(new Uint8Array(data, offset, length), this.responseDataOffset);
            this.responseDataOffset += length;
        } else if (this.responseDataArray) {
            this.responseDataArray.push(data.slice(offset, offset + length));
            // this.responseDataArray(data
        }
    }
}
