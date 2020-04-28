import ChunkyParser from "./ChunkyParser";
import DataBuffer from "../DataBuffer";
import EventEmitter from "../EventEmitter";
import IDataBuffer from "../IDataBuffer";
import IHTTP from "../IHTTP";
import IHTTPHeadersEvent from "../IHTTPHeadersEvent";
import IHTTPRequest from "../IHTTPRequest";
import NetworkError from "../NetworkError";
import NetworkPipe from "../NetworkPipe";
import Platform from "../Platform";
import assert from "../utils/assert.macro";
import { HTTPEncoding, NetworkErrorCode } from "../types";

function setEncodings(headerValue: string): undefined | HTTPEncoding[] {
    const encodings = headerValue.split(",");
    Platform.trace("got some encodings", headerValue);
    let ret: undefined | HTTPEncoding[];
    for (const encoding of encodings) {
        let enc: HTTPEncoding | undefined;
        switch (encoding.trim()) {
        case "chunked":
            enc = HTTPEncoding.Chunked;
            break;
        case "compress":
            enc = HTTPEncoding.Compress;
            break;
        case "deflate":
            enc = HTTPEncoding.Deflate;
            break;
        case "gzip":
            enc = HTTPEncoding.Gzip;
            break;
        case "identity":
            enc = HTTPEncoding.Identity;
            break;
        default:
            continue;
        }
        if (Array.isArray(ret)) {
            ret.push(enc);
        } else {
            ret = [enc];
        }
    }
    return ret;
}

export default class HTTP1 extends EventEmitter implements IHTTP {
    private headerBuffer?: IDataBuffer;
    private connection?: string;
    private headersFinished: boolean;

    public networkPipe?: NetworkPipe;
    public request?: IHTTPRequest;
    public chunkyParser?: ChunkyParser;

    public upgrade: boolean;
    constructor() {
        super();
        this.headersFinished = false;
        this.upgrade = false;
    }

    private getPathName(hostName: string, query: string): string {
        return `${hostName}${query}`;
    }
    send(networkPipe: NetworkPipe, request: IHTTPRequest): boolean {
        this.networkPipe = networkPipe;
        this.request = request;
        let str =
            `${request.method} ${this.getPathName(request.url.pathname || "/", request.url.query as unknown as string)} HTTP/1.1\r
Host: ${request.url.host}\r\n`;

        const standardHeaders = Platform.standardHeaders;
        for (const key in standardHeaders) {
            if (Platform.standardHeaders.hasOwnProperty(key) && !(key in request.requestHeaders)) {
                const value: string = standardHeaders[key];
                str += `${key}: ${value}\r\n`;
            }
        }
        const hasBody = typeof request.body !== "undefined";
        let hasContentLength = false;
        let hasContentType = false;
        for (const key in request.requestHeaders) {
            if (request.requestHeaders.hasOwnProperty(key)) {
                let value = request.requestHeaders[key];
                if (typeof value === "object") {
                    value = JSON.stringify(value);
                }
                str += `${key}: ${value}\r\n`;
                if (hasBody) {
                    if (!hasContentLength) {
                        hasContentLength = (key === "Content-Length" || (key.length === 14 && key.toLowerCase() === "content-length"));
                    }
                    if (!hasContentType) {
                        hasContentType = (key === "Content-Type" || (key.length === 12 && key.toLowerCase() === "content-type"));
                    }
                }
            }
        }
        if (hasBody) {
            if (!hasContentType) {
                // curl defaults tot x-www-form-urlencoded
                str += "Content-Type: application/x-www-form-urlencoded\r\n";
            }
            switch (typeof request.body) {
            case "string":
                if (!hasContentLength) {
                    str += `Content-Length: ${Platform.utf8Length(request.body)}\r\n\r\n`;
                } else {
                    str += "\r\n";
                }
                this.networkPipe.write(str);
                this.networkPipe.write(request.body);

                break;
            case "number":
            case "boolean":
                const body = JSON.stringify(request.body);
                if (!hasContentLength) {
                    str += `Content-Length: ${body.length}\r\n\r\n`;
                } else {
                    str += "\r\n";
                }
                str += body;
                this.networkPipe.write(str);

                break;
            case "object":
                if (request.body instanceof DataBuffer
                    || request.body instanceof Uint8Array
                    || request.body instanceof ArrayBuffer) {
                    if (!hasContentLength) {
                        str += `Content-Length: ${request.body.byteLength}\r\n\r\n`;
                    } else {
                        str += "\r\n";
                    }
                    this.networkPipe.write(str);
                    this.networkPipe.write(request.body, 0, request.body.byteLength);
                } else {
                    const json = JSON.stringify(request.body);
                    if (!hasContentLength) {
                        str += `Content-Length: ${Platform.utf8Length(json)}\r\n\r\n`;
                    } else {
                        str += "\r\n";
                    }

                    this.networkPipe.write(str);
                    this.networkPipe.write(json);
                }
                break;
            }
        } else {
            str += "\r\n";
            this.networkPipe.write(str);
        }

        this.networkPipe.on("data", this._onData.bind(this));
        this.networkPipe.on("close", this.emit.bind(this, "finished"));
        return true;
    }

    private _parseHeaders(rnrn: number): boolean {
        assert(this.networkPipe, "Gotta have a pipe");
        assert(this.request, "Gotta have a pipe");

        assert(this.headerBuffer, "Must have headerBuffer");
        const str = Platform.utf8toa(this.headerBuffer, 0, rnrn);
        const split = str.split("\r\n");
        // Platform.trace("got string\n", split);
        const statusLine = split[0];
        if (statusLine.lastIndexOf("HTTP/1.", 0) !== 0) {
            this.emit("error", new NetworkError(NetworkErrorCode.BadStatusLine,
                                                "Bad status line " + statusLine));
            return false;
        }
        let httpVersion;
        switch (statusLine.charCodeAt(7)) {
        case 49: // 1
            httpVersion = "1.1";
            break;
        case 48: // 0
            httpVersion = "1.0";
            break;
        default:
            this.emit("error", new NetworkError(NetworkErrorCode.BadStatusLine,
                                                "Bad status line " + statusLine));
            return false;
        }

        assert(this.request, "Gotta have request");
        const event = {
            headers: [],
            headersSize: rnrn + 4,
            method: this.request.method,
            requestSize: this.networkPipe.bytesWritten,
            statusCode: -1,
            httpVersion,
            timeToFirstByteRead: this.networkPipe.firstByteRead - this.request.networkStartTime,
            timeToFirstByteWritten: this.networkPipe.firstByteWritten - this.request.networkStartTime
        } as IHTTPHeadersEvent;

        const space = statusLine.indexOf(' ', 9);
        event.statusCode = parseInt(statusLine.substring(9, space), 10);
        if (isNaN(event.statusCode) || event.statusCode < 0) {
            this.emit("error", new NetworkError(NetworkErrorCode.BadStatusLine,
                                                "Bad status line " + statusLine));
            return false;
        }
        const redirectStatus = (event.statusCode >= 300
            && event.statusCode < 400
            && event.statusCode !== 304);
        // this.requestResponse.headers = new ResponseHeaders;
        let contentLength: string | undefined;
        let transferEncoding: string | undefined;
        let contentEncoding: string | undefined;

        for (let i = 1; i < split.length; ++i) {
            // split \r\n\r\n by \r\n causes 2 empty lines.
            if (split.length === 0) {
                // Platform.trace("IGNORING LINE....");
                continue;
            }
            let idx = split[i].indexOf(":");
            if (idx <= 0) {
                this.emit("error", new NetworkError(NetworkErrorCode.BadHeader,
                                                    "Bad header " + split[i]));
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

            const value = split[i].substring(idx, end);

            switch (key.length) {
            case 8:
                if (redirectStatus && (key === "Location" || key.toLowerCase() === "location")) {
                    event.redirectUrl = value;
                }
                break;
            case 10:
                let setCookie = false;
                if (key === "Connection") {
                    this.connection = value;
                } else if (key === "Set-Cookie") {
                    setCookie = true;
                } else {
                    const lower = key.toLowerCase();
                    if (lower === "connection") {
                        this.connection = value;
                    } else if (lower === "set-cookie") {
                        setCookie = true;
                    }
                }
                if (setCookie) {
                    if (!event.setCookie) {
                        event.setCookie = value;
                    } else if (typeof event.setCookie === "string") {
                        event.setCookie = [event.setCookie, value];
                    } else {
                        event.setCookie.push(value);
                    }
                }
                break;
            case 14:
                if (key === "Content-Length" || key.toLowerCase() === "content-length") {
                    contentLength = value;
                }
                break;
            case 16:
                if (key === "Content-Encoding" || key.toLowerCase() === "content-encoding") {
                    contentEncoding = value;
                }
                break;
            case 17:
                if (key === "Transfer-Encoding" || key.toLowerCase() === "transfer-encoding") {
                    transferEncoding = value;
                }
                break;
            }
            event.headers.push(key + ": " + value);
        }

        if (transferEncoding) {
            event.transferEncoding = setEncodings(transferEncoding);
            if (event.transferEncoding && event.transferEncoding.indexOf(HTTPEncoding.Chunked) !== -1) {
                this.chunkyParser = new ChunkyParser();
                this.chunkyParser.on("chunk", (chunk: IDataBuffer) => {
                    Platform.trace("got a chunk right here", chunk.byteLength);
                    this.emit("data", chunk, 0, chunk.byteLength);
                });
                this.chunkyParser.on("error", (err: Error) => {
                    this.emit("error", err);
                });

                this.chunkyParser.on("done", (buffer: IDataBuffer | undefined) => {
                    if (buffer) {
                        assert(this.networkPipe, "Must have networkPipe");
                        this.networkPipe.stash(buffer, 0, buffer.byteLength);
                    }
                    this.chunkyParser = undefined;
                    this.emit("finished");
                });
            }
        }

        if (contentEncoding) {
            event.contentEncoding = setEncodings(contentEncoding);
        }

        if (contentLength) {
            const len = parseInt(contentLength, 10);
            if (len < 0 || isNaN(len)) {
                this.emit("error", new NetworkError(NetworkErrorCode.BadContentLength,
                                                    "Bad content length " + contentLength));
                return false;
            }
            event.contentLength = len;
        }

        this.emit("headers", event);
        return true;
    }

    // have to copy data, the buffer will be reused
    private _processResponseData(data: IDataBuffer, offset: number, length: number): void {
        Platform.trace("processing data", typeof this.chunkyParser, length);
        if (this.chunkyParser) {
            this.chunkyParser.feed(data, offset, length);
        } else {
            this.emit("data", data, offset, length);
        }
    }

    private _onData(): void {
        assert(this.networkPipe, "Must have network pipe");
        // BRB, Upping my bits above 3000...
        const scratch = Platform.scratch;
        assert(!this.networkPipe.closed, "Shouldn't be closed here");
        do {
            const read = this.networkPipe.read(scratch, 0, scratch.byteLength);
            Platform.trace("We read some bytes from the pipe", read, this.headersFinished);
            if (read <= 0) {
                break;
            } else if (!this.headersFinished) {
                if (this.headerBuffer) {
                    const len = this.headerBuffer.byteLength;
                    this.headerBuffer.bufferLength = len + read;
                    this.headerBuffer.set(len, scratch, 0, read);
                } else {
                    this.headerBuffer = scratch.slice(0, read);
                }
                assert(this.headerBuffer, "must have headerBuffer");
                const rnrn = this.headerBuffer.indexOf("\r\n\r\n");
                if (rnrn !== -1) {
                    this._parseHeaders(rnrn);
                    this.headersFinished = true;

                    const remaining = this.headerBuffer.byteLength - (rnrn + 4);
                    const hOffset = this.headerBuffer.byteLength - remaining;
                    if (this.connection === "Upgrade") {
                        if (remaining) {
                            this.networkPipe.stash(this.headerBuffer, hOffset, remaining);
                        }

                        this.upgrade = true;
                        this.emit("finished");

                        // TODO: Something is off here.  We will have to re
                        // think this in the near future.  It should be
                        // better than this, but there is complication with
                        // empting the pipe and stashing.
                        //
                        // TODO: Old Note
                        // If you don't break, you will
                        // continue to process what's
                        // left in the buffer which is
                        // wrong on upgrade.
                        this.headerBuffer = undefined;
                        break;
                    } else if (remaining) {
                        this._processResponseData(this.headerBuffer, hOffset, remaining);
                    }

                    this.headerBuffer = undefined;
                }
            } else {
                this._processResponseData(scratch, 0, read);
            }
        } while (!this.networkPipe.closed);
    }
};

