import Url from "url-parse";
import { ChunkyParser } from "./HTTP1/ChunkyParser";
import Platform from "./Platform";
import { CreateTCPNetworkPipeOptions, DnsResult, IpConnectivityMode, NetworkPipe, RequestTimeouts, HTTPMethod } from "./types";
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
    private responseData?: Uint8Array;
    private responseDataOffset: number;
    private responseDataArray?: ArrayBuffer[];
    private responseDataLength: number;
    private chunks?: ArrayBuffer[];
    private chunkyParser?: ChunkyParser
    private bytesReceived: number;
    private connection?: string;
    private onConnections: Array<() => void>;
    private contentLength?: number;

    constructor(data: RequestData | string) {
        this.bytesReceived = 0;
        this.responseDataOffset = 0;
        this.responseDataLength = 0;
        this.onConnections = [];
        this.id = ++nextId;
        this.requestResponse = new RequestResponse(this.id);
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

    onConnection(cb: () => void) {
        if (this.state === RequestState.Connected) {
            cb();
            return;
        }
        this.onConnections.push(cb);
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
            this.networkPipe.onclose = this._onNetworkPipeClose.bind(this);
            this.networkPipe.onerror = this._onNetworkPipeError.bind(this);
            this.networkPipe.ondata = this._onNetworkPipeData.bind(this);

            this.transition(RequestState.Connected);
        }).catch(err => {
            // Platform.trace("Request#send#createTCPNetworkPipe error", err);
            this._httpError(-1, err.toString());
        });

        return ret;
    }

    private transition(state: RequestState): void {
        // Platform.trace("transition", this.state, "to", state);
        this.state = state;
        switch (state) {
            case RequestState.Initial:
                throw new Error("Invalid state transition to Initial");
            case RequestState.Connected:
                const method = this.requestData.method || (this.requestData.body ? "POST" : "GET");

                // TODO: With HTTP2 upgrade, do we know that the host can do it or should we
                // do the connection handshake everytime?
                let str =
`${method} ${this.url.pathname || "/"} HTTP/1.1\r
Host: ${this.url.hostname}\r
User-Agent: Milo/0.1\r
Connection: close\r
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
            // Platform.trace("CALLING WRITE", str);
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
                responseArrayBuffer = Platform.bufferConcat.apply(undefined, this.chunks);
            } else if (this.responseDataArray) {
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
    private _httpError(code: number, text: string): void {
        // Platform.trace("got error", code, text);
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
        Platform.trace("got closed", Platform.stacktrace());
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
                Platform.trace("bytes received", this.bytesReceived, this.responseDataLength, this.contentLength);
                if (this.state === RequestState.Connected) { // waiting for headers
                    if (this.headerBuffer) {
                        this.headerBuffer = Platform.bufferConcat(this.headerBuffer, read < recvBuffer.byteLength ? recvBuffer.buffer.slice(0, read) : recvBuffer);
                    } else {
                        this.headerBuffer = recvBuffer.buffer.slice(0, read);
                    }

                    const rnrn = Platform.bufferIndexOf(this.headerBuffer, 0, undefined, "\r\n\r\n");
                    if (rnrn != -1 && this._parseHeaders(rnrn)) {
                        assert(this.requestResponse, "Gotta have a requestResponse");
                        assert(this.requestResponse.networkStartTime, "Gotta have a requestResponse.networkStartTime");
                        // Platform.log("GOT HEADERS AFTER", Platform.mono() - this.requestResponse.networkStartTime);
                        this.transition(RequestState.ReceivedHeaders);
                        const remaining = this.headerBuffer.byteLength - (rnrn + 4);
                        if (remaining)
                            this._processResponseData(this.headerBuffer, this.headerBuffer.byteLength - remaining, remaining);
                        this.headerBuffer = undefined;
                        if (this.connection == "Upgrade") {
                            this.transition(RequestState.Finished);
                        }
                    }
                } else {
                    assert(this.state === RequestState.ReceivedHeaders, "State unrest");
                    this._processResponseData(recvBuffer.buffer, 0, read);
                }
            }
        }
    }

    private _parseHeaders(rnrn: number): boolean {
        assert(this.networkPipe, "Gotta have a pipe");
        assert(this.requestResponse, "Gotta have requestResponse");
        assert(this.requestResponse.networkStartTime, "Gotta have networkStartTime");

        if (this.networkPipe.firstByteRead) {
            this.requestResponse.timeToFirstByteRead = this.networkPipe.firstByteRead - this.requestResponse.networkStartTime;
        }
        if (this.networkPipe.firstByteWritten) {
            this.requestResponse.timeToFirstByteWritten = this.networkPipe.firstByteWritten - this.requestResponse.networkStartTime;
        }

        assert(this.headerBuffer, "Must have headerBuffer");
        const str = Platform.utf8toa(this.headerBuffer, 0, rnrn);
        const split = str.split("\r\n");
        // Platform.trace("got string\n", split);
        const statusLine = split[0];
        // Platform.trace("got status", statusLine);
        if (statusLine.lastIndexOf("HTTP/1.", 0) != 0) {
            this._httpError(-1, "Bad status line " + statusLine);
            return false;
        }
        if (statusLine[7] == "1") {
            this.requestResponse.httpVersion = "1.1";
        } else if (statusLine[7] == "0") {
            this.requestResponse.httpVersion = "1.0";
        } else {
            this._httpError(-1, "Bad status line " + statusLine);
            return false;
        }

        const space = statusLine.indexOf(' ', 9);
        // Platform.trace("got status", space, statusLine.substring(9, space))
        this.requestResponse.statusCode = parseInt(statusLine.substring(9, space));
        if (isNaN(this.requestResponse.statusCode) || this.requestResponse.statusCode < 0) {
            this._httpError(-1, "Bad status line " + statusLine);
            return false;
        }

        // this.requestResponse.headers = new ResponseHeaders;
        let contentLength: string | undefined;
        let transferEncoding: string | undefined;

        for (var i = 1; i < split.length; ++i) {
            // split \r\n\r\n by \r\n causes 2 empty lines.
            if (split.length === 0) {
                // Platform.trace("IGNORING LINE....");
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
        // Platform.trace("headers", this.requestResponse.headers.join("\n"));
        if (this.requestData.onHeaders) {
            this.requestData.onHeaders({ statusCode: this.requestResponse.statusCode, headers: this.requestResponse.headers });
        }
        if (!this.requestData.onData) {
            if (contentLength) {
                const len = parseInt(contentLength);
                if (len) {
                    if (len < 1024 * 1024 * 16 && len > 0) {
                        this.responseData = new Uint8Array(len);
                        this.contentLength = len;
                    } else {
                        this._httpError(-1, "Bad content length " + len);
                        return false;
                    }
                }
                Platform.log("SHITTY", contentLength);
            } else if (transferEncoding === "chunked") {
                if (!this.requestData.onChunk)
                    this.chunks = [];
                this.chunkyParser = new ChunkyParser;
                this.chunkyParser.onchunk = (chunk: ArrayBuffer) => {
                    if (this.chunks) {
                        this.chunks.push(chunk);
                    } else {
                        assert(this.requestData.onChunk);
                        this.requestData.onChunk(chunk);
                    }
                };
                this.chunkyParser.onerror = (code: number, message: string) => {
                    Platform.error(`Got error in the chunky parser - code: ${code} message: ${message}`);
                    this._httpError(code, message);
                };

                this.chunkyParser.ondone = (buffer: ArrayBuffer | undefined) => {
                    this._finish();
                    if (buffer) {
                        assert(this.networkPipe, "Must have networkPipe");
                        this.networkPipe.unread(buffer);
                    }
                };
            } else {
                this.responseDataArray = [];
            }
        }
        return true;
    }

    private _processResponseData(data: ArrayBuffer, offset: number, length: number): void { // have to copy data, the buffer will be reused
        this.responseDataLength += length;
        // Platform.trace("got some data here", length, Platform.utf8toa(data.slice(offset, offset + length)));
        if (this.requestData.onData) {
            this.requestData.onData(data.slice(offset, length));
        } else if (this.chunkyParser) {
            this.chunkyParser.feed(data, offset, length);
        } else if (this.responseData) {
            Platform.bufferSet(this.responseData, this.responseDataOffset, data, offset, length);
            this.responseDataOffset += length;
        } else if (this.responseDataArray) {
            this.responseDataArray.push(data.slice(offset, offset + length));
        }
    }

    private _finish() {
        this.transition(RequestState.Finished);
    }
}
