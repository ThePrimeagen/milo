import Url from "url-parse";
import { ChunkyParser } from "./HTTP1/ChunkyParser";
import { HTTP1 } from "./HTTP1/HTTP1";
import Platform from "./Platform";
import {
    CreateTCPNetworkPipeOptions, DnsResult, IpConnectivityMode,
    NetworkPipe, RequestTimeouts, HTTP, HTTPMethod, HTTPHeadersEvent,
    HTTPTransferEncoding, ErrorCode
} from "./types";
import { assert, escapeData } from "./utils";

let recvBuffer = new Uint8Array(16 * 1024);
let nextId = 0;

export enum DnsType {
    DNS_Unknown = 0,
    DNS_Literal = 1,
    DNS_HostsFile = 2,
    DNS_Lookup = 3,
    DNS_CacheHit = 4,
    DNS_Preresolved = 5
};

export interface OnHeadersData {
    statusCode: number;
    headers: string[];
};

export interface RequestData {
    url: string;
    baseUrl?: string;
    method?: HTTPMethod;
    body?: string | ArrayBuffer | Uint8Array;
    timeouts?: RequestTimeouts;
    ipConnectivityMode?: IpConnectivityMode;
    freshConnect?: boolean;
    forbidReuse?: boolean;
    format?: "xml" | "json" | "jsonstream" | "arraybuffer" | "uint8array" | "none";
    async?: boolean;
    pipeWait?: boolean;
    debugThroughput?: boolean;
    noProxy?: boolean;
    tcpNoDelay?: boolean;
    secure?: boolean;
    networkMetricsPrecision?: "us" | "ms" | "none";
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

    onChunk?: (chunk: ArrayBuffer) => void;
    onHeaders?: (data: OnHeadersData) => void;
    onData?: (data: ArrayBuffer) => void;
};

export class RequestResponse {
    constructor(id: number) {
        this.id = id;
        this.headers = [];
    }
    id: number;
    state?: string;
    cacheKey?: ArrayBuffer;
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
    sslVersion?: string | undefined;
    dns?: string;
    dnsChannel?: string;
    socket?: number;
    data?: string | ArrayBuffer | Uint8Array;
    size?: number;
    urls?: string[];
    headers: string[];
    httpVersion?: string;
};

enum RequestState {
    Initial = 0,
    Connected = 1,
    ReceivedHeaders = 2,
    Closed = 3,
    Finished = 4,
    Error = -1
};

export class Request {
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
    private responseData?: ArrayBuffer;
    private responseDataOffset?: number;
    private responseDataArray?: ArrayBuffer[];
    private responseDataLength: number;
    private transferEncoding: HTTPTransferEncoding;
    private http: HTTP;

    constructor(data: RequestData | string) {
        this.transferEncoding = 0;
        this.responseDataLength = 0;
        this.id = ++nextId;
        this.requestResponse = new RequestResponse(this.id);

        this.http = new HTTP1;
        this.http.onheaders = this._onHeaders.bind(this);
        this.http.ondata = this._onData.bind(this);
        this.http.onerror = this._onError.bind(this);
        this.http.onfinished = () => {
            this._transition(RequestState.Finished);
        };

        if (typeof data === "string") {
            data = { url: data };
        }

        if (!data.timeouts) {
            data.timeouts = Platform.defaultRequestTimeouts;
        }

        if (data.http2) {
            throw new Error("http2 not implemented yet");
        }

        this.requestData = data;

        this.url = new Url(this.requestData.url, this.requestData.baseUrl || Platform.location);
        this.state = RequestState.Initial;
        return this;
    }

    send(): Promise<RequestResponse> {
        this.requestResponse.networkStartTime = Platform.mono();
        // Platform.trace("send called", this.state, this.url);
        if (this.state != RequestState.Initial) {
            throw new Error("Bad state transition");
        }

        // Platform.trace("Request#send");
        const ret = new Promise<RequestResponse>((resolve, reject) => {
            // Platform.trace("Request#send return promise");
            this.resolve = resolve;
            this.reject = reject;
        });

        let port: number = 0;
        if (this.url.port) {
            port = parseInt(this.url.port);
        }

        // Platform.trace("Request#send port", port);
        let ssl = false;
        switch (this.url.protocol) {
        case "https:":
        case "wss:":
            ssl = true;
            if (!port) {
                port = 443;
            }
            break;
        default:
            if (!port)
                port = 80;
            break;
        }
        // Platform.trace("Request#send creating TCP pipe");
        assert(this.requestData.timeouts);
        const tcpOpts = {
            host: this.url.hostname,
            port: port,
            dnsTimeout: this.requestData.timeouts.dnsTimeout,
            connectTimeout: this.requestData.timeouts.connectTimeout,
            ipVersion: 4 // gotta do happy eyeballs and send off multiple tcp network pipe things
        } as CreateTCPNetworkPipeOptions;
        Platform.createTCPNetworkPipe(tcpOpts).then((pipe: NetworkPipe) => {
            if (pipe.dnsTime) {
                this.requestResponse.dnsTime = pipe.dnsTime;
            }
            if (pipe.connectTime) {
                this.requestResponse.connectTime = pipe.connectTime;
            }

            // Platform.trace("Request#send#createTCPNetworkPipe pipe");
            if (ssl) {
                return Platform.createSSLNetworkPipe({ pipe: pipe });
            } else {
                return pipe;
            }
        }).then((pipe: NetworkPipe) => {
            // Platform.trace("GOT OUR PIPE NOW");
            this.networkPipe = pipe;

            this._transition(RequestState.Connected);
        }).catch(err => {
            // Platform.trace("Request#send#createTCPNetworkPipe error", err);
            this._onError(-1, err.toString());
        });

        return ret;
    }

    private _transition(state: RequestState): void {
        // Platform.trace("transition", this.state, "to", state);
        this.state = state;
        switch (state) {
        case RequestState.Initial:
            throw new Error("Invalid state transition to Initial");
        case RequestState.Connected:
            assert(this.networkPipe);
            this.requestResponse.serverIp = this.networkPipe.ipAddress;
            this.requestResponse.dns = this.networkPipe.dns;
            if (this.networkPipe.dnsChannel)
                this.requestResponse.dnsChannel = this.networkPipe.dnsChannel;

            if (!this.requestData.headers)
                this.requestData.headers = {};

            if (this.requestData.cache) {
                if ("X-Gibbon-Cache-Control" in this.requestData.headers) {
                    this.requestData.headers["X-Gibbon-Cache-Control"] += `, ${this.requestData.cache}`;
                } else {
                    this.requestData.headers["X-Gibbon-Cache-Control"] = this.requestData.cache;
                }
            }
            let cacheKey: ArrayBuffer | undefined;
            if ("X-Gibbon-Cache-Control" in this.requestData.headers) {
                this.requestData.headers["X-Gibbon-Cache-Control"].split(',').forEach((val: String) => {
                    val = val.trim();
                    if (val.lastIndexOf("key=", 0)) {
                        cacheKey = Platform.atoutf8(val.substr(4));
                    } else {
                        // ### handle other cache controls
                    }
                });
            }
            if (!cacheKey) {
                const hash = this.requestData["X-Gibbon-Hash"];
                if (hash) {
                    cacheKey = Platform.atoutf8(hash.trim());
                } else {


                }
            }

            assert(this.requestResponse.networkStartTime, "Gotta have networkStartTime");
            const req = {
                url: this.url,
                method: this.requestData.method || (this.requestData.body ? "POST" : "GET"),
                requestHeaders: this.requestData.headers,
                body: this.requestData.body,
                networkStartTime: this.requestResponse.networkStartTime
            };
            this.http.send(this.networkPipe, req);
            // Platform.trace("CALLING WRITE", str);
            break;
        case RequestState.Closed:
            this._transition(RequestState.Finished);
            break;
        case RequestState.Error:
            break;
        case RequestState.Finished:
            let responseArrayBuffer: ArrayBuffer;
            if (this.responseDataArray) {
                // Platform.trace("GOT HERE 1", this.responseDataArray);
                responseArrayBuffer = Platform.bufferConcat.apply(undefined, this.responseDataArray);
            } else if (this.responseData) {
                // Platform.trace("GOT HERE 2", this.responseData);
                responseArrayBuffer = this.responseData;
            } else {
                responseArrayBuffer = new ArrayBuffer(0);
            }
            assert(this.requestResponse, "Gotta have a requestResponse");
            assert(this.requestResponse.networkStartTime, "Gotta have a requestResponse.networkStartTime");
            this.requestResponse.duration = Platform.mono() - this.requestResponse.networkStartTime;
            this.requestResponse.size = this.responseDataLength;
            this.requestResponse.httpVersion = this.http.httpVersion;
            this.requestResponse.state = "network";

            switch (this.requestData.format) {
            case "xml":
            case "json":
            case "jsonstream":
            case "none":
                throw new Error("Not implemented " + this.requestData.format);
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
                }
                break;
            }
            assert(this.resolve, "Must have resolve");
            this.resolve(this.requestResponse);
            break;
        }
    }

    private _onHeaders(event: HTTPHeadersEvent): void {
        Platform.log("balls", this.requestResponse, event, typeof this.requestData.onData, typeof this.requestData.onChunk);
        this.requestResponse.statusCode = event.statusCode;
        this.requestResponse.headers = event.headers;
        this.transferEncoding = event.transferEncoding;
        this.requestResponse.requestSize = event.requestSize;
        this.requestResponse.timeToFirstByteWritten = this.http.timeToFirstByteWritten;
        this.requestResponse.timeToFirstByteRead = this.http.timeToFirstByteRead;

        if (!(this.transferEncoding & HTTPTransferEncoding.Chunked))
            this.requestData.onChunk = undefined;
        if (!this.requestData.onData && !this.requestData.onChunk) {
            Platform.log("shit contentLength", event.contentLength);
            if (typeof event.contentLength === "undefined") {
                this.responseDataArray = [];
            } else if (event.contentLength && event.contentLength > 0) {
                if (event.contentLength > 1024 * 1024 * 16) {
                    this._onError(-1, "Content length too long");
                    return;
                }
                this.responseDataOffset = 0;
                this.responseData = new ArrayBuffer(event.contentLength);
            }
        }
    }

    private _onData(data: ArrayBuffer, offset: number, length: number): void { // have to copy data, the buffer will be reused
        this.responseDataLength += length;
        Platform.trace("got some data here", length);
        if (this.requestData.onData) {
            this.requestData.onData(data.slice(offset, length));
        } else if (this.requestData.onChunk) { // this arrayBuffer is created by ChunkyParser
            assert(!offset, "No offsets for chunks");
            assert(length != data.byteLength, "No offsets for chunks");
            this.requestData.onChunk(data);
        } else if (this.responseData) {
            assert(typeof this.responseDataOffset !== "undefined", "Must have responseDataOffset");
            Platform.bufferSet(this.responseData, this.responseDataOffset, data, offset, length);
            this.responseDataOffset += length;
            Platform.log("GOT DATA", this.responseDataOffset, "of", this.responseData.byteLength);
            if (this.responseDataOffset == this.responseData.byteLength) {
                this._transition(RequestState.Finished);
            }
        } else if (this.responseDataArray) {
            this.responseDataArray.push(data.slice(offset, offset + length));
        }
    }

    private _onError(code: number, message: string) {
        // Platform.trace("got error", code, text);
        assert(this.reject, "Must have reject");
        if (this.networkPipe)
            this.networkPipe.close();
        this.reject(code, message);
    }
}
