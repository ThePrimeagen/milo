import Url from "url-parse";
import HTTP1 from "./HTTP1/HTTP1";
import Platform from "./Platform";
import DataBuffer from "./DataBuffer";
import NetworkPipe from "./NetworkPipe";
import connectionPool, { ConnectionOptions, PendingConnection } from "./ConnectionPool";

import {
    ICreateTCPNetworkPipeOptions, IpConnectivityMode,
    IRequestTimeouts, IHTTP, HTTPMethod, IHTTPHeadersEvent,
    HTTPTransferEncoding, ErrorCode, IDataBuffer
} from "./types";
import { assert } from "./utils";

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
    async?: boolean;
    baseUrl?: string;
    body?: string | ArrayBuffer | Uint8Array;
    cache?: string;
    debugThroughput?: boolean;
    dependsOn?: string | ArrayBuffer | Uint8Array | number;
    dnsChannel?: string;
    dnsTime?: number;
    dnsType?: DnsType;
    exclusiveDepends?: boolean;
    forbidReuse?: boolean;
    format?: "xml" | "json" | "jsonstream" | "arraybuffer" | "uint8array" | "databuffer" | "none";
    freshConnect?: boolean;
    headers?: { [key: string]: string };
    http2?: boolean;
    ipAddresses?: string[];
    ipConnectivityMode?: IpConnectivityMode;
    maxRecvSpeed?: number;
    maxSendSpeed?: number;
    method?: HTTPMethod;
    networkMetricsPrecision?: "us" | "ms" | "none";
    noProxy?: boolean;
    onChunk?: (chunk: ArrayBuffer) => void;
    onData?: (data: ArrayBuffer) => void;
    onHeaders?: (data: OnHeadersData) => void;
    pipeWait?: boolean;
    receiveBufferSize?: number;
    secure?: boolean;
    tcpNoDelay?: boolean;
    timeouts?: IRequestTimeouts;
    tlsv13?: boolean;
    url: string;
    weight?: number;
};

export class RequestResponse {
    constructor(id: number) {
        this.id = id;
        this.headers = [];
    }
    id: number;
    state?: string;
    cacheKey?: ArrayBuffer;
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
};

enum RequestState {
    Initial = 0,
    Connected = 1,
    ReceivedHeaders = 2,
    Closed = 3,
    Finished = 4,
    Error = -1
};

function requestStateToString(state: RequestState): string {
    switch (state) {
    case RequestState.Initial: return "Initial";
    case RequestState.Connected: return "Connected";
    case RequestState.ReceivedHeaders: return "ReceivedHeaders";
    case RequestState.Closed: return "Closed";
    case RequestState.Finished: return "Finished";
    case RequestState.Error: return "Error";
    }
}

export class Request {
    state: RequestState;
    requestData: RequestData;
    url: Url;
    id: number;
    networkPipe?: NetworkPipe;

    private resolve?: (response: RequestResponse) => void;
    private reject?: (error: Error) => void;
    private requestResponse: RequestResponse;
    private responseData?: IDataBuffer;
    private responseDataOffset?: number;
    private responseDataArray?: IDataBuffer[];
    private responseDataLength: number;
    private transferEncoding: HTTPTransferEncoding;
    private http: IHTTP;

    constructor(data: RequestData | string) {
        this.transferEncoding = 0;
        this.responseDataLength = 0;
        this.id = ++nextId;
        this.requestResponse = new RequestResponse(this.id);

        this.http = new HTTP1();
        this.http.on("headers", this._onHeaders.bind(this));
        this.http.on("data", this._onData.bind(this));
        this.http.on("error", this._onError.bind(this));
        this.http.on("finished", () => {
            this._transition(RequestState.Finished);
        });

        if (typeof data === "string") {
            data = { url: data };
        }

        if (!data.timeouts) {
            data.timeouts = Platform.defaultRequestTimeouts;
        }

        if (!data.method) {
            data.method = data.body ? "POST" : "GET";
        }

        data.http2 = data.http2 || false;
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
        if (this.state !== RequestState.Initial) {
            throw new Error("Bad state transition");
        }

        // Platform.trace("Request#send");
        const ret = new Promise<RequestResponse>((resolve, reject) => {
            // Platform.trace("Request#send return promise");
            this.resolve = resolve;
            this.reject = reject;
        });

        // Platform.trace("Request#send creating TCP pipe");
        assert(this.requestData.timeouts);
        const timeouts = this.requestData.timeouts;

        const connectionOpts = {
            url: this.url,
            dnsTimeout: timeouts && timeouts.dnsTimeout,
            connectTimeout: timeouts && timeouts.connectTimeout,
            freshConnect: this.requestData.freshConnect,
            forbidReuse: this.requestData.forbidReuse
        } as ConnectionOptions;

        let pendingConnection: PendingConnection;
        connectionPool.requestConnection(connectionOpts).then((conn: PendingConnection) => {
            Platform.trace(`got a pending connection ${conn.id}`);
            // conn is abortable
            pendingConnection = conn;
            return conn.onNetworkPipe();
        }).then((pipe: NetworkPipe) => {
            Platform.trace("GOT OUR PIPE NOW");
            this.networkPipe = pipe;
            this.requestResponse.socket = pipe.socket;
            if (pendingConnection.dnsTime) {
                this.requestResponse.dnsTime = pendingConnection.dnsTime;
            }
            if (pendingConnection.connectTime) {
                this.requestResponse.connectTime = pendingConnection.connectTime;
            }

            this._transition(RequestState.Connected);
        }).catch((err: Error) => {
            Platform.error("got an error", err);
            // Platform.trace("Request#send#createTCPNetworkPipe error", err);
            this._onError(err);
        });

        return ret;
    }

    private _transition(state: RequestState): void {
        Platform.trace("transition", requestStateToString(this.state), "to", requestStateToString(state));
        this.state = state;
        switch (state) {
        case RequestState.Initial:
            throw new Error("Invalid state transition to Initial");
        case RequestState.Connected:
            assert(this.networkPipe);
            this.requestResponse.serverIp = this.networkPipe.ipAddress;
            // this.requestResponse.dns = this.networkPipe.dns;
            // if (this.networkPipe.dnsChannel)
            //     this.requestResponse.dnsChannel = this.networkPipe.dnsChannel;
            // if (this.networkPipe.cname)
            //     this.requestResponse.cname = this.networkPipe.cname;
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
                const cacheControl = this.requestData.headers["X-Gibbon-Cache-Control"];
                if (cacheControl) {
                    const split = cacheControl.split(',');
                    for (const val of split) {
                        if (val.lastIndexOf("key=", 0)) {
                            cacheKey = Platform.atoutf8(val.substr(4));
                        } else {
                            // ### handle other cache controls
                        }
                    }
                }
            }

            assert(this.requestData.method, "Gotta have method");
            if (!cacheKey) {
                let hash = this.requestData.headers["X-Gibbon-Hash"];
                if (hash) {
                    hash = hash.trim();
                    const eq = hash.indexOf("=");
                    if (eq !== -1) {
                        cacheKey = Platform.atoutf8(hash.substr(eq + 1));
                    }
                }
                if (!cacheKey) {
                    const hasher = Platform.createSHA256Context();
                    hasher.add(this.requestData.method);
                    hasher.add(this.requestData.http2 ? "2" : "1");
                    hasher.add(this.requestData.url);
                    if (this.requestData.body)
                        hasher.add(this.requestData.body);

                    for (const header in this.requestData.headers) {
                        if (this.requestData.headers.hasOwnProperty(header)) {
                            switch (header) {
                            case "If-None-Match":
                            case "If-Modified-Since":
                            case "Referer":
                            case "X-Gibbon-Cache-Control":
                                Platform.trace("Skipped header", header);
                                continue;
                            }
                            hasher.add(header);
                            hasher.add(this.requestData.headers[header]);
                        }
                    }
                    cacheKey = hasher.final();
                }
            }
            assert(cacheKey, "Gotta have cacheKey");
            this.requestResponse.cacheKey = cacheKey;
            // Platform.log("got cache key", cacheKey);

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
            let responseDataBuffer: IDataBuffer;
            if (this.responseDataArray) {
                // Platform.trace("GOT HERE 1", this.responseDataArray);
                responseDataBuffer = DataBuffer.concat.apply(undefined, this.responseDataArray);
            } else if (this.responseData) {
                // Platform.trace("GOT HERE 2", this.responseData);
                responseDataBuffer = this.responseData;
            } else {
                responseDataBuffer = new DataBuffer(0);
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
                this.requestResponse.data = responseDataBuffer.toArrayBuffer();
                break;
            case "uint8array":
                if (responseDataBuffer)
                    this.requestResponse.data = new Uint8Array(responseDataBuffer.toArrayBuffer());
                break;
            case "databuffer":
                if (responseDataBuffer)
                    this.requestResponse.data = responseDataBuffer;
                break;
            default:
                if (responseDataBuffer) {
                    this.requestResponse.data = responseDataBuffer.toString();
                }
                break;
            }
            assert(this.resolve, "Must have resolve");
            this.resolve(this.requestResponse);
            assert(this.networkPipe);
            Platform.trace("got to finished, pipe is closed?", this.networkPipe.closed);
            if (!this.networkPipe.closed) {
                this.networkPipe.removeEventHandlers();
                if (!this.http.upgrade) {
                    connectionPool.finish(this.networkPipe);
                    this.networkPipe = undefined;
                }
            }
            break;
        }
    }

    private _onHeaders(event: IHTTPHeadersEvent): void {
        this.requestResponse.statusCode = event.statusCode;
        this.requestResponse.headers = event.headers;
        this.transferEncoding = event.transferEncoding;
        this.requestResponse.requestSize = event.requestSize;
        this.requestResponse.timeToFirstByteWritten = this.http.timeToFirstByteWritten;
        this.requestResponse.timeToFirstByteRead = this.http.timeToFirstByteRead;
        this.requestResponse.headersSize = event.headersSize;

        if (!(this.transferEncoding & HTTPTransferEncoding.Chunked)) {
            this.requestData.onChunk = undefined;
        }

        if (!this.requestData.onData && !this.requestData.onChunk) {

            if (typeof event.contentLength === "undefined") {
                this.responseDataArray = [];
            } else if (event.contentLength && event.contentLength > 0) {
                if (event.contentLength > 1024 * 1024 * 16) {
                    this._onError(new Error("Content length too long"));
                    return;
                }
                this.responseDataOffset = 0;
                this.responseData = new DataBuffer(event.contentLength);
            }
        }
    }

    private _onData(data: IDataBuffer, offset: number, length: number): void {
        // have to copy data, the buffer will be reused
        this.responseDataLength += length;
        Platform.trace("got some data here", length);
        if (this.requestData.onData) {
            this.requestData.onData(data.toArrayBuffer(offset, length));
        } else if (this.requestData.onChunk) { // this arrayBuffer is created by ChunkyParser
            assert(!offset, "No offsets for chunks");
            assert(length === data.byteLength, "No offsets for chunks");
            this.requestData.onChunk(data.toArrayBuffer());
        } else if (this.responseData) {
            assert(typeof this.responseDataOffset !== "undefined", "Must have responseDataOffset");
            this.responseData.set(this.responseDataOffset, data, offset, length);
            this.responseDataOffset += length;
            // Platform.log("GOT DATA", this.responseDataOffset, "of", this.responseData.byteLength);
            if (this.responseDataOffset === this.responseData.byteLength) {
                this._transition(RequestState.Finished);
            }
        } else if (this.responseDataArray) {
            if (this.transferEncoding & HTTPTransferEncoding.Chunked) {
                assert(!offset, "No offsets for chunks");
                assert(length === data.byteLength, "No offsets for chunks");
                this.responseDataArray.push(data); // whole chunks, created by the chunky parser
            } else {
                this.responseDataArray.push(data.slice(offset, offset + length));
            }
        }
    }

    private _onError(error: Error) {
        Platform.error("got error", error);
        assert(this.reject, "Must have reject");
        if (this.networkPipe)
            this.networkPipe.close();
        this.reject(error);
    }
}
