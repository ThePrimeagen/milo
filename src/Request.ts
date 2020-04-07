import DataBuffer from "./DataBuffer";
import HTTP1 from "./HTTP1/HTTP1";
import IConnectionOptions from "./IConnectionOptions";
import IDataBuffer from "./IDataBuffer";
import IHTTP from "./IHTTP";
import IHTTPHeadersEvent from "./IHTTPHeadersEvent";
import INetworkError from "./INetworkError";
import IPendingConnection from "./IPendingConnection";
import IRequestData from "./IRequestData";
import NetworkError from "./NetworkError";
import NetworkPipe from "./NetworkPipe";
import Platform from "./Platform";
import RequestResponse from "./RequestResponse";
import Url from "url-parse";
import assert from "./utils/assert.macro";
import { HTTPTransferEncoding, NetError, NetworkErrorCode } from "./types";

let nextId = 0;

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

enum RedirectState {
    Redirected,
    NotRedirected,
    TooManyRedirects
}

export default class Request {
    state: RequestState;
    requestData: IRequestData;
    url: Url;
    id: number;
    networkPipe?: NetworkPipe;

    private resolve?: (response: RequestResponse) => void;
    private reject?: (error: INetworkError) => void;
    private requestResponse: RequestResponse;
    private responseData?: IDataBuffer;
    private responseDataOffset?: number;
    private responseDataArray?: IDataBuffer[];
    private responseDataLength: number;
    private transferEncoding: HTTPTransferEncoding;
    private http: IHTTP;
    private _onTimeoutTimer?: any;
    private transactionStartTime?: number;
    private redirected: RedirectState;

    constructor(data: IRequestData, redirects?: string[]) {
        this.requestData = data;
        this.id = --nextId;
        if (this.id === -2147483648)
            nextId = 0;


        this.requestResponse = new RequestResponse(this.id, redirects ? redirects : this.requestData.url);
        if (redirects) {
            assert(redirects[redirects.length - 1] === data.url,
                   "This should be the same url");
            assert(redirects.length <= 10, "This should be less than or equal to 10 " + redirects.length);
        }
        this.requestResponse.reason = NetError.SUCCESS;
        this.transferEncoding = 0;
        this.responseDataLength = 0;
        this.redirected = RedirectState.NotRedirected;

        this.http = new HTTP1();
        this.http.on("headers", this._onHeaders.bind(this));
        this.http.on("data", this._onData.bind(this));
        this.http.on("error", this._onError.bind(this));
        this.http.on("finished", () => {
            if (this.state !== RequestState.Finished)
                this._transition(RequestState.Finished);
        });

        if (!this.requestData.timeouts) {
            this.requestData.timeouts = Platform.defaultRequestTimeouts;
        }

        if (!this.requestData.method) {
            this.requestData.method = this.requestData.body ? "POST" : "GET";
        }

        this.requestData.http2 = this.requestData.http2 || false;
        if (this.requestData.http2) {
            throw new NetworkError(NetworkErrorCode.NotImplemented, "http2 is not implemented yet");
        }

        Platform.log("Going to", this.requestData.url);
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

        // Platform.log(`${this.url} SENT`);

        // Platform.trace("Request#send");
        const ret = new Promise<RequestResponse>((resolve, reject) => {
            // Platform.trace("Request#send return promise");
            this.resolve = resolve;
            this.reject = reject;
        });

        // Platform.trace("Request#send creating TCP pipe");
        assert(this.requestData.timeouts, "must have timeouts by now");
        const timeouts = this.requestData.timeouts;
        if (timeouts && timeouts.timeout && timeouts.timeout > 0) {
            this._onTimeoutTimer = setTimeout(this._onTimeout.bind(this), timeouts.timeout);
        }

        const connectionOpts = {
            url: this.url,
            dnsTimeout: timeouts && timeouts.dnsTimeout,
            connectTimeout: timeouts && timeouts.connectTimeout,
            freshConnect: this.requestData.freshConnect,
            forbidReuse: this.requestData.forbidReuse,
            tlsv13: this.requestData.tlsv13
        } as IConnectionOptions;

        let pendingConnection: IPendingConnection;
        Platform.connectionPool.requestConnection(connectionOpts).then((conn: IPendingConnection) => {
            Platform.trace(`got a pending connection ${conn.id}`);
            // conn is abortable
            pendingConnection = conn;
            return conn.onNetworkPipe();
        }).then((pipe: NetworkPipe) => {
            Platform.trace(`actually got the connection ${pipe.socket} ${this.url}`);
            this.transactionStartTime = Platform.mono();
            this.networkPipe = pipe;
            this.requestResponse.socket = pipe.socket;
            this.requestResponse.cname = pendingConnection.cname;
            this.requestResponse.connectTime = pendingConnection.connectTime;
            this.requestResponse.dnsChannel = pendingConnection.dnsChannel;
            this.requestResponse.dnsTime = pendingConnection.dnsTime;
            this.requestResponse.dns = pendingConnection.dnsType;
            this.requestResponse.dnsWireTime = pendingConnection.dnsWireTime;
            this.requestResponse.socketReused = pendingConnection.socketReused;
            if (pendingConnection.sslVersion) {
                this.requestResponse.sslVersion = pendingConnection.sslVersion;
                this.requestResponse.sslSessionResumed = pendingConnection.sslSessionResumed;
                this.requestResponse.sslHandshakeTime = pendingConnection.sslHandshakeTime;
            }
            this._transition(RequestState.Connected);
        }).catch((err: any) => {
            let e: INetworkError;
            if (!(err instanceof NetworkError)) {
                assert(err instanceof Error, "This has to be an error");
                e = err as INetworkError;
                e.code = NetworkErrorCode.UnknownError;
            } else {
                e = err;
            }
            Platform.error("got an error", err);
            // Platform.trace("Request#send#createTCPNetworkPipe error", err);
            this._onError(e);
        });

        return ret;
    }

    private _transition(state: RequestState): void {
        Platform.trace("transition", requestStateToString(this.state), "to", requestStateToString(state));
        assert(this.state !== state, `Shouldn't transition to the same state ${requestStateToString(state)}`);
        this.state = state;

        switch (state) {
        case RequestState.Initial:
            throw new Error("Invalid state transition to Initial");
        case RequestState.Connected:
            assert(this.networkPipe, "must have networkPipe");
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
                        if (val.lastIndexOf("key=", 0) === 0) {
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
            break;
        case RequestState.Closed:
            this._transition(RequestState.Finished);
            break;
        case RequestState.Error:
            break;
        case RequestState.Finished:
            assert(this.transactionStartTime, "Gotta have a transactionStartTime");
            assert(this.requestResponse, "Gotta have a requestResponse");
            assert(this.requestResponse.networkStartTime, "Gotta have a requestResponse.networkStartTime");

            if (this._onTimeoutTimer) {
                clearTimeout(this._onTimeoutTimer);
                this._onTimeoutTimer = undefined;
            }

            switch (this.redirected) {
            case RedirectState.NotRedirected:
                const now = Platform.mono();
                this.requestResponse.duration = now - this.requestResponse.networkStartTime;
                this.requestResponse.transactionTime = now - this.transactionStartTime;
                this.requestResponse.size = this.responseDataLength;
                this.requestResponse.state = "network";
                assert(this.networkPipe, "must have networkPipe");
                Platform.log(`Finished ${this.networkPipe.socket} ${this.url} ${this.requestResponse.statusCode}`);
                this.requestResponse.bytesRead = this.networkPipe.bytesRead;
                if (this.requestData.format !== "none") {
                    let handled = false;
                    switch (this.requestData.format) {
                    case "xml":
                        const xml = Platform.parseXML(this.responseDataToDataBuffer());
                        if (xml) {
                            handled = true;
                            this.requestResponse.xml = xml;
                        }
                        break;
                    case "json":
                        const json = Platform.parseJSON(this.responseDataToDataBuffer());
                        if (!json) {
                            this.requestResponse.jsonError = true;
                        } else {
                            handled = true;
                            this.requestResponse.json = json;
                        }
                        break;
                    case "jsonstream":
                        const jsonstream = Platform.parseJSONStream(this.responseDataToDataBuffer());
                        if (!jsonstream) {
                            this.requestResponse.jsonError = true;
                        } else {
                            handled = true;
                            this.requestResponse.json = jsonstream;
                        }
                        break;
                    case "arraybuffer":
                        this.requestResponse.data = this.responseDataToArrayBuffer();
                        handled = true;
                        break;
                    case "uint8array":
                        this.requestResponse.data = new Uint8Array(this.responseDataToArrayBuffer());
                        handled = true;
                        break;
                    case "databuffer":
                        this.requestResponse.data = this.responseDataToDataBuffer();
                        handled = true;
                        break;
                    default:
                        break;
                    }
                    if (!handled) {
                        this.requestResponse.data = this.responseDataToDataBuffer().toString();
                    }
                }
                break;
            case RedirectState.Redirected:
                Platform.log(`Got a redirect ${this.requestResponse.urls}`);
                this.requestData.url = this.requestResponse.finalURL;
                break;
            case RedirectState.TooManyRedirects:
                break;
            }
            assert(this.networkPipe, "must have networkpipe");
            Platform.log("got to finished, pipe is closed?", this.networkPipe.closed,
                         this.requestData.format, this.requestResponse.statusCode,
                         this.responseDataLength);
            // this.requestResponse.json);
            this.networkPipe.removeEventHandlers();
            if (!this.http.upgrade || this.networkPipe.closed) {
                Platform.connectionPool.finish(this.networkPipe);
                this.networkPipe = undefined;
            }

            assert(this.resolve && this.reject, "must have resolve and reject");
            switch (this.redirected) {
            case RedirectState.Redirected:
                new Request(this.requestData, this.requestResponse.urls).send().then(this.resolve, this.reject);
                break;
            case RedirectState.NotRedirected:
                this.resolve(this.requestResponse);
                break;
            case RedirectState.TooManyRedirects:
                this.reject(new NetworkError(NetworkErrorCode.TooManyRedirects));
                break;
            }
            break;
        }
    }

    private _onHeaders(event: IHTTPHeadersEvent): void {
        this.requestResponse.statusCode = event.statusCode;
        this.requestResponse.headers = event.headers;
        this.transferEncoding = event.transferEncoding;
        this.requestResponse.requestSize = event.requestSize;
        this.requestResponse.timeToFirstByteWritten = event.timeToFirstByteWritten;
        this.requestResponse.timeToFirstByteRead = event.timeToFirstByteRead;
        this.requestResponse.headersSize = event.headersSize;
        this.requestResponse.httpVersion = event.httpVersion;
        if (event.redirectUrl) {
            const count = this.requestResponse.addUrl(event.redirectUrl);
            if (count <= 10) {
                this.redirected = RedirectState.Redirected;
            } else {
                this.redirected = RedirectState.TooManyRedirects;
                return;
            }
        } else {
            assert(this.redirected === RedirectState.NotRedirected, "Must be not redirected");
        }

        if (!(this.transferEncoding & HTTPTransferEncoding.Chunked)) {
            this.requestData.onChunk = undefined;
        }

        if (!this.requestData.onData && !this.requestData.onChunk && this.requestData.format !== "none") {
            if (typeof event.contentLength === "undefined") {
                this.responseDataArray = [];
            } else if (event.contentLength && event.contentLength > 0) {
                if (event.contentLength > 1024 * 1024 * 16) {
                    this._onError(new NetworkError(NetworkErrorCode.ContentLengthTooLong));
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
        } // else format === "none"
    }

    private _onTimeout(): void {
        assert(this.state !== RequestState.Finished, "We can't be finished");
        const now = Platform.mono();
        assert(this.requestResponse, "Gotta have a requestResponse");
        assert(this.requestResponse.networkStartTime, "Gotta have a requestResponse.networkStartTime");
        this._onError(new NetworkError(NetworkErrorCode.Timeout, `Request timed out after ${now - this.requestResponse.networkStartTime}ms`));
    }

    private _onError(error: INetworkError) {
        Platform.error("got error", error);
        assert(this.reject, "Must have reject");
        if (this.networkPipe)
            this.networkPipe.close();
        if (this._onTimeoutTimer) {
            clearTimeout(this._onTimeoutTimer);
            this._onTimeoutTimer = undefined;
        }

        this.reject(error);
    }

    private responseDataToDataBuffer(): IDataBuffer {
        // let responseDataBuffer: IDataBuffer;
        if (this.responseDataArray) {
            // Platform.trace("GOT HERE 1", this.responseDataArray);
            return DataBuffer.concat(this.responseDataArray);
        } else if (this.responseData) {
            // Platform.trace("GOT HERE 2", this.responseData);
            return this.responseData;
        } else {
            return new DataBuffer(0);
        }
    }

    private responseDataToArrayBuffer(): ArrayBuffer {
        // let responseDataBuffer: IDataBuffer;
        if (this.responseDataArray) {
            // Platform.trace("GOT HERE 1", this.responseDataArray);
            return Platform.arrayBufferConcat.apply(Platform, this.responseDataArray);
        } else if (this.responseData) {
            // Platform.trace("GOT HERE 2", this.responseData);
            return this.responseData.toArrayBuffer();
        } else {
            return new ArrayBuffer(0);
        }
    }


}
