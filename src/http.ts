// TODO: Come back to the HTTP frame builder
import sha1 from 'sha1';

import {
    ab2str
} from './utils/index';

enum RequestTypes {
    GET = 'GET',
    POST = 'POST'
}

enum HeaderKey {
    Upgrade = 'Upgrade',
    Connection = 'Connection',
    SecWebSocketKey = 'Sec-WebSocket-Key',
};

enum Protocol {
    HTTP1_1 = 'HTTP/1.1',
};

type SlowPath = {
    requestType: RequestTypes;
    uri: string;
    protocol: Protocol;
};

type SlowParsedHttp = {
    headers: { [key: string]: string };
    path: SlowPath;
    body: Buffer;
};

const r = "\r".charCodeAt(0);
const n = "\n".charCodeAt(0);
const newLine = [r, n];
const space = " ".charCodeAt(0);
const colon = ":".charCodeAt(0);
const contentLength = "content-length".split('').map(x => x.charCodeAt(0));

const NotFound = -1;

export {
    NotFound,
    SlowParsedHttp,
    SlowPath,
    HeaderKey,
    r,
    n,
};

function switchProtocolResponse(key: string) {
    return [
        "HTTP/1.1 101 Switching Protocols",
        "Upgrade: websocket",
        "Connection: Upgrade",
        `Sec-WebSocket-Accept: ${key}`,
    ];
}

export class HTTPBuilder {
    private buffer: Buffer;
    private ptr: number;

    public static WS_KEY = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"

    constructor(size = 4096) {

        // TODO: Pool?
        this.buffer = Buffer.allocUnsafe(size);
        this.ptr = 0;
    }

    length() {
        return this.ptr;
    }

    getBuffer() {
        return this.buffer;
    }

    setUpgradeProtocol(incoming: SlowParsedHttp) {
        const sentKey = incoming.headers[HeaderKey.SecWebSocketKey];
        const shadKey = sha1(sentKey + HTTPBuilder.WS_KEY);
        const base64Key = Buffer.from(shadKey, 'hex').toString('base64');

        switchProtocolResponse(base64Key).forEach(str => {
            this.addString(str);
            this.addNewLine();
        });
    }

    addString(str: string) {
        for (let i = 0; i < str.length; ++i) {
            this.buffer[this.ptr++] = str.charCodeAt(i);
        }
    }

    addNewLine() {
        this.buffer[this.ptr++] = r;
        this.buffer[this.ptr++] = n;
    }
}

function getCharacterIdx(buf: Buffer, needle: number, offset: number, maxLength?: number) {
    let idx = NotFound;
    maxLength = maxLength || buf.length;
    for (let i = offset; idx === NotFound && i < maxLength; ++i) {
        if (buf[i] === needle) {
            idx = i;
        }
    }

    return idx;
}

function getColonIdx(buf: Buffer, offset: number, maxLength: number): number {
    return getCharacterIdx(buf, colon, offset, maxLength);
}

function getSpaceIdx(buf: Buffer, offset: number) {
    return getCharacterIdx(buf, space, offset);
}

function getSlowCasePath(buf: Buffer, offset: number, maxLength: number): SlowPath {
    const out = {} as SlowPath;

    let ptr = offset;
    let spaceIdx = getSpaceIdx(buf, ptr);

    const requestType = ab2str(buf.slice(ptr, spaceIdx));
    if (requestType !== RequestTypes.GET && requestType !== RequestTypes.POST) {
        throw new Error('Unsupported HTTP types');
    }

    out.requestType = requestType;
    ptr =  spaceIdx + 1;

    spaceIdx = getSpaceIdx(buf, ptr);
    out.uri = ab2str(buf.slice(ptr, spaceIdx));
    ptr =  spaceIdx + 1;

    const protocol = ab2str(buf.slice(ptr, maxLength));
    if (protocol !== Protocol.HTTP1_1) {
        throw new Error(`Unsupported Protocol ${protocol}` );
    }

    out.protocol = protocol;

    return out;
}

export function slowCaseParseHttp(buf: Buffer, offset: number, maxLength: number): SlowParsedHttp {
    let ptr = offset;

    const out = { headers: {} } as SlowParsedHttp;
    const headers = out.headers;

    let endLineIdx = getEndLineOffset(buf, ptr, maxLength);
    if (endLineIdx === NotFound) {
        throw new Error("Not valid HTTP");
    }

    const path = buf.slice(offset, endLineIdx);
    out.path = getSlowCasePath(buf, offset, endLineIdx);

    ptr += endLineIdx + 2;

    do {
        endLineIdx = getEndLineOffset(buf, ptr, maxLength);

        // We just got the ol 2 in a row (\r\n\r\n)
        if (endLineIdx === ptr) {
            ptr += 2;

            // DONE WITH BODY, Baby
            break;
        }

        const colonIdx = getColonIdx(buf, ptr, maxLength);
        const key = ab2str(buf.slice(ptr, colonIdx));

        ptr = colonIdx + 1;
        let value = ab2str(buf.slice(ptr, endLineIdx));
        if (value[0] === ' ') {
            value = value.substring(1);
        }

        ptr = endLineIdx + 2;
        headers[key] = value;

    } while (true);

    out.body = buf.slice(ptr, maxLength);

    return out;
};

export function getEndLineOffset(buf: Buffer, offset: number, maxLength: number): number {
    let i = offset;
    let found = false;

    for (; i < maxLength; ++i) {
        if (buf[i] === r &&
            buf[i + 1] === n) {

            found = true;
            break;
        }
    }

    return found ? i : -1;
}

export function getContentLength(buf: Buffer, offset: number, maxLength: number): number {
    const co = getContentLengthOffset(buf, offset, maxLength);
    if (co == NotFound) {
        return co;
    }

    const endLine = getEndLineOffset(buf, offset + co, maxLength);

    // TODO: How to make this more efficient.  This seems insane that I have to
    // take a buffer of ascii, convert this to a string then make this into a
    // number.
    return +ab2str(buf.slice(co + 1, endLine));
}

export function getContentLengthOffset(buf: Buffer, offset: number, maxLength: number): number {
    let i = offset;
    let found = false;

    for (; i < maxLength - contentLength.length; ++i) {
        if (contentLength.every((x, cIdx) => buf[i + cIdx] === x || buf[i + cIdx] === (x - 32)) &&
            buf[i + contentLength.length] === colon) {
            found = true;
            break;
        }
    }

    return found ? i + contentLength.length + 1 : -1;
};
export function getHTTPHeaderEndOffset(buf: Buffer, offset: number, maxLength: number): number {
    let i = offset;
    let found = false;

    for (; i < maxLength; ++i) {
        if (buf[i] === r &&
            buf[i + 1] === n &&
            buf[i + 2] === r &&
            buf[i + 3] === n) {

            found = true;
            break;
        }
    }

    return found ? i : -1;
};
