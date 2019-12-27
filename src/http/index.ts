// TODO: Come back to the HTTP frame builder
import bindings from '../bindings';

// 1117 aabb aabb 7b22636f756e74223a307d
// 1117
// 0001 0001 0001 1110 1010 1010 1011 1011
//      rrrf
//      sssi
//      vvvn
//      123

import {
    ab2str
} from '../utils/index';

import {
    NativeSocketInterface,
    Socket
} from '../types';

import {
    HeaderKey,
    Protocol,
    RequestTypes,
    SlowParsedHttp,
    SlowPath,
} from './types';

import {
    NotFound,
    r,
    n,
    getSpaceIdx,
    getColonIdx,
    getEndLineOffset,
    createBufferBuilder,
} from './buffer';

import * as wsUtils from './ws.utils';

const switchingProtocolsStr = "HTTP/1.1 101 Switching Protocols";
const switchingProtocolsBuf = Buffer.alloc(switchingProtocolsStr.length);
switchingProtocolsBuf.write(switchingProtocolsStr);

export default class HTTP {
    private wsKeyGenerated: string;

    public static isWSUpgradeRequest(packet: SlowParsedHttp): boolean {
        return packet.headers[HeaderKey.Upgrade] === 'websocket' &&
            !!packet.headers[HeaderKey.SecWebSocketKey];
    }

    getWsKeyGenerated() {
        return this.wsKeyGenerated;
    }

    upgradeToWS(socketId: Socket, host: string, path: string) {
        const wsUpgrade = createBufferBuilder(1024);
        const key = this.wsKeyGenerated = wsUtils.generateWSUpgradeKey();

        wsUpgrade.addString("GET ");
        wsUpgrade.addString(path);
        wsUpgrade.addString(" HTTP/1.1");
        wsUpgrade.addNewLine();
        wsUpgrade.addString("Host: ");
        wsUpgrade.addString(host);
        wsUpgrade.addNewLine();
        wsUpgrade.addString("Upgrade: websocket");
        wsUpgrade.addNewLine();
        wsUpgrade.addString("Connection: Upgrade");
        wsUpgrade.addNewLine();
        wsUpgrade.addString("Sec-WebSocket-Key: ");
        wsUpgrade.addString(key);
        wsUpgrade.addNewLine();
        wsUpgrade.addString("Sec-WebSocket-Version: 13");
        wsUpgrade.addNewLine();
        wsUpgrade.addNewLine();

        console.log("Sending", ab2str(wsUpgrade.getBuffer().slice(0, wsUpgrade.length())));

        const buf = wsUpgrade.getBuffer();
        const len = wsUpgrade.length();
        bindings.send(socketId, buf, len, 0);
    }

    respondToWSUpgrade(socketId: Socket, incoming: SlowParsedHttp) {
        const key = incoming.headers[HeaderKey.SecWebSocketKey];
        const base64Key = wsUtils.getResponseWSKey(key);

        const buffer = createBufferBuilder(1024);
        wsUtils.switchProtocolResponse(base64Key).forEach(str => {
            buffer.addString(str);
            buffer.addNewLine();
        });

        bindings.send(socketId, buffer.getBuffer(), buffer.length(), 0);
    }

    validateUpgrade(httpRequest: SlowParsedHttp): boolean {
        const base64Key = wsUtils.getResponseWSKey(this.wsKeyGenerated);
        return base64Key === httpRequest.headers[HeaderKey.SecWebSocketAccept];
    }
}

function isUpgradeToWebsockets(buf: Buffer): boolean {
    let isEqual = true;
    for (let i = 0; i < switchingProtocolsBuf.byteLength && isEqual; ++i) {
        isEqual = isEqual && buf[i] === switchingProtocolsBuf[i];
    }

    return isEqual;
}

function getSlowCasePath(buf: Buffer, offset: number, maxLength: number): SlowPath {
    const out = {} as SlowPath;

    let ptr = offset;
    let spaceIdx = getSpaceIdx(buf, ptr);

    const requestType = ab2str(buf.slice(ptr, spaceIdx));
    if (requestType !== RequestTypes.GET &&
        requestType !== RequestTypes.POST) {
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

    if (!isUpgradeToWebsockets(buf.slice(offset))) {
        const path = buf.slice(offset, endLineIdx);
        out.path = getSlowCasePath(buf, offset, endLineIdx);
    }

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

