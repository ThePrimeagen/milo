import {
    HTTP, HTTPMethod, HTTPTransferEncoding, HTTPRequest, NetworkPipe, HTTPHeadersEvent, OnError, ErrorCode
} from "../types";
import Platform from "../#{platform}/Platform";
import { ChunkyParser } from "./ChunkyParser";
import { assert } from "../utils";

export class HTTP1 implements HTTP {
    public httpVersion: string;
    networkPipe?: NetworkPipe;
    request?: HTTPRequest;
    public timeToFirstByteRead?: number;
    public timeToFirstByteWritten?: number;
    private headerBuffer?: ArrayBuffer;
    private connection?: string;
    private headersFinished: boolean;
    private chunkyParser?: ChunkyParser;
    private requestSize?: number;

    constructor() {
        this.headersFinished = false;
        this.httpVersion = "";
    }

    send(networkPipe: NetworkPipe, request: HTTPRequest): boolean {
        this.networkPipe = networkPipe;
        this.request = request;
        let str =
            `${request.method} ${request.url.pathname || "/"} HTTP/1.1\r
Host: ${request.url.hostname}\r
`;
        for (let key in Platform.standardHeaders) {
            if (!(key in request.requestHeaders)) {
                str += `${key}: ${Platform.standardHeaders[key]}\r\n`;
            }
        }
        for (let key in request.requestHeaders) {
            str += `${key}: ${request.requestHeaders[key]}\r\n`;
        }
        str += "\r\n";
        this.networkPipe.write(str);
        this.requestSize = str.length; // headers are latin1

        switch (typeof request.body) {
        case "string":
            this.networkPipe.write(request.body);
            this.requestSize += request.body.length; // if this has utf8 this would be wrong
            break;
        case "object":
            this.networkPipe.write(request.body, 0, request.body.byteLength);
            this.requestSize += request.body.byteLength;
            break;
        }

        let scratch = Platform.scratch;
        this.networkPipe.ondata = () => {
            while (true) {
                assert(this.networkPipe, "Must have network pipe");
                const read = this.networkPipe.read(scratch, 0, scratch.byteLength);
                Platform.trace("We read some bytes from the pipe", read, this.headersFinished);
                if (read <= 0) {
                    break;
                } else if (!this.headersFinished) {
                    if (this.headerBuffer) {
                        let b = new ArrayBuffer(this.headerBuffer.byteLength + read);
                        Platform.bufferSet(b, 0, this.headerBuffer);
                        Platform.bufferSet(b, this.headerBuffer.byteLength, scratch, 0, read);
                        this.headerBuffer = b;
                    } else {
                        this.headerBuffer = scratch.slice(0, read);
                    }
                    const rnrn = Platform.bufferIndexOf(this.headerBuffer, 0, undefined, "\r\n\r\n");
                    if (rnrn != -1) {
                        this._parseHeaders(rnrn);
                        this.headersFinished = true;
                        const remaining = this.headerBuffer.byteLength - (rnrn + 4);
                        if (remaining) {
                            this._processResponseData(this.headerBuffer, this.headerBuffer.byteLength - remaining, remaining);
                        }
                        this.headerBuffer = undefined;
                        if (this.connection == "Upgrade") {
                            this._finish();
                        }
                    }
                } else {
                    this._processResponseData(scratch, 0, read);
                }
            }
        }
        this.networkPipe.onclose = () => {
            this._finish(); // ### check if we're okay to be closed?
        };
        return true;
    }

    private _parseHeaders(rnrn: number): boolean {
        assert(this.networkPipe, "Gotta have a pipe");
        assert(this.request, "Gotta have a pipe");

        if (this.networkPipe.firstByteRead) {
            this.timeToFirstByteRead = this.networkPipe.firstByteRead - this.request.networkStartTime;
        }
        if (this.networkPipe.firstByteWritten) {
            this.timeToFirstByteWritten = this.networkPipe.firstByteWritten - this.request.networkStartTime;
        }

        assert(this.headerBuffer, "Must have headerBuffer");
        const str = Platform.utf8toa(this.headerBuffer, 0, rnrn);
        const split = str.split("\r\n");
        // Platform.trace("got string\n", split);
        const statusLine = split[0];
        // Platform.trace("got status", statusLine);
        if (statusLine.lastIndexOf("HTTP/1.", 0) != 0) {
            this._error(-1, "Bad status line " + statusLine);
            return false;
        }
        if (statusLine[7] == "1") {
            this.httpVersion = "1.1";
        } else if (statusLine[7] == "0") {
            this.httpVersion = "1.0";
        } else {
            this._error(-1, "Bad status line " + statusLine);
            return false;
        }

        assert(this.request, "Gotta have request");
        const event = {
            contentLength: undefined,
            headers: [],
            headersSize: rnrn + 4,
            method: this.request.method,
            requestSize: this.requestSize,
            statusCode: -1,
            transferEncoding: 0
        } as HTTPHeadersEvent;

        const space = statusLine.indexOf(' ', 9);
        // Platform.trace("got status", space, statusLine.substring(9, space))
        event.statusCode = parseInt(statusLine.substring(9, space));
        if (isNaN(event.statusCode) || event.statusCode < 0) {
            this._error(-1, "Bad status line " + statusLine);
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
                this._error(-1, "Bad header " + split[i]);
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
            event.headers.push(key + ": " + value);
        }

        if (transferEncoding) {
            const transferEncodings = transferEncoding.split(",");
            Platform.trace("got some encodings", transferEncodings);
            for (let idx = 0; idx < transferEncodings.length; ++idx) {
                switch (transferEncodings[idx].trim()) {
                case "chunked":
                    this.chunkyParser = new ChunkyParser;
                    this.chunkyParser.onchunk = (chunk: ArrayBuffer) => {
                        Platform.trace("got a chunk right here", chunk.byteLength, typeof this.ondata);
                        if (this.ondata)
                            this.ondata(chunk, 0, chunk.byteLength);
                    };
                    this.chunkyParser.onerror = this._error.bind(this);

                    this.chunkyParser.ondone = (buffer: ArrayBuffer | undefined) => {
                        if (buffer) {
                            assert(this.networkPipe, "Must have networkPipe");
                            this.networkPipe.unread(buffer);
                        }
                        this._finish();
                    };

                    event.transferEncoding |= HTTPTransferEncoding.Chunked;
                    break;
                case "compress":
                    event.transferEncoding |= HTTPTransferEncoding.Compress;
                    break;
                case "deflate":
                    event.transferEncoding |= HTTPTransferEncoding.Deflate;
                    break;
                case "gzip":
                    event.transferEncoding |= HTTPTransferEncoding.Gzip;
                    break;
                case "identity":
                    event.transferEncoding |= HTTPTransferEncoding.Identity;
                    break;
                }
            }
        }

        if (contentLength) {
            const len = parseInt(contentLength);
            if (len < 0 || isNaN(len)) {
                this._error(-1, "Bad content length " + contentLength);
                return false;
            }
            event.contentLength = len;
        }

        if (this.onheaders) {
            this.onheaders(event);
        }
        return true;
    }

    private _processResponseData(data: ArrayBuffer, offset: number, length: number): void { // have to copy data, the buffer will be reused
        Platform.trace("processing data", typeof this.chunkyParser, length);
        if (this.chunkyParser) {
            this.chunkyParser.feed(data, offset, length);
        } else if (this.ondata) {
            this.ondata(data, offset, length);
        }
    }

    private _finish() {
        if (this.onfinished)
            this.onfinished();
    }

    private _error(code: number, message: string) {
        if (this.onerror)
            this.onerror(code, message);
    }

    onheaders?: (headers: HTTPHeadersEvent) => void;
    ondata?: (data: ArrayBuffer, offset: number, length: number) => void;
    onfinished?: () => void;
    onerror?: OnError;
};

