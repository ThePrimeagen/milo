import {
    AddrId,
    AddrInfoHints,

    NativeSocketInterface,
    fd_set,
    select,
    Socket,
} from '../../types';

import {
    str2ab,
    ab2str
} from '../../utils/index';

import onSelect from "../../utils/onSelect";
import wait from "../../utils/wait";
import closeOnCtrlC from "../../utils/closeOnCtrlC";
import {
    NotFound,
    getHTTPHeaderEndOffset,
    getContentLengthOffset,
    r, n,
    getEndLineOffset,
    HTTPBuilder,
} from "../../http";

import readline from 'readline';

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

export default async function clientHTTP(bindings: NativeSocketInterface) {
    const {
        SOCK_STREAM,
        AF_INET,
        AI_PASSIVE,

        socket,
        getaddrinfo,
        connect,
        send,
        recv,
        accept,
        select,
        close,

        FD_CLR,
        FD_SET,
        FD_ZERO,
        FD_ISSET,

        newAddrInfo,
        isValidSocket,
        getErrorString,
        gai_strerror,
        addrInfoToObject,
    } = bindings;

    const addrHints: AddrInfoHints = {
        ai_socktype: SOCK_STREAM,
        ai_family: AF_INET
    };

    const hintsId = newAddrInfo(addrHints);
    const bindId = newAddrInfo();
    const addrInfoResult =
        getaddrinfo(0, "8080", hintsId, bindId);

    if (addrInfoResult) {
        console.error("Unable to getaddrinfo.  Also stop using this method you dingus");
        return;
    }

    const bindData = addrInfoToObject(bindId);
    const socketId = socket(
        bindData.ai_family, bindData.ai_socktype, bindData.ai_protocol);

    if (!isValidSocket(socketId)) {
        console.error("Unable to create the socket", getErrorString());
        return;
    }

    const connectStatus = connect(socketId, bindId);
    if (connectStatus) {
        console.error("Unable to connect to the socket", getErrorString());
        return;
    }

    // TODO: This interface kind of sucks...
    const buf: Buffer = Buffer.alloc(4096);
    let cliLen = 0;
    let lastWasEmpty = false;

    while (true) {
        console.log("Starting at", cliLen);
        const len = await onReadLine(buf.slice(cliLen));
        const str = ab2str(buf.slice(cliLen, cliLen + len));
        console.log("It actually worked", str, str === "__end__");

        if (str === "__ws_upgrade__") {
            const wsUpgrade = new HTTPBuilder();

            wsUpgrade.addString("GET /chat HTTP/1.1");
            wsUpgrade.addNewLine();
            wsUpgrade.addString("Host: example.com:8000");
            wsUpgrade.addNewLine();
            wsUpgrade.addString("Upgrade: websocket");
            wsUpgrade.addNewLine();
            wsUpgrade.addString("Connection: Upgrade");
            wsUpgrade.addNewLine();
            wsUpgrade.addString("Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==");
            wsUpgrade.addNewLine();
            wsUpgrade.addString("Sec-WebSocket-Version: 13");
            wsUpgrade.addNewLine();
            wsUpgrade.addNewLine();

            console.log("Sending", ab2str(wsUpgrade.getBuffer().slice(0, wsUpgrade.length())));
            send(socketId, wsUpgrade.getBuffer(), wsUpgrade.length(), 0);
        }
        else if (str === "__end__") {
            break;
        }
        else {
            cliLen += len;
        }

        buf[cliLen] = r;
        buf[cliLen + 1] = n;
        cliLen += 2;

        console.log(ab2str(buf.slice(0, cliLen)));
    }

    console.log(ab2str(buf.slice(0, cliLen)));

    send(socketId, buf, cliLen);
    const len = bindings.recv(socketId, buf, buf.byteLength);
    console.log(ab2str(buf.slice(0, len)));
};


let cb: (len: number) => void = null;
function listenToReadLine(buf: Buffer) {
    rl.on('line', function _newLine(line) {
        cb && cb(buf.write(line));
        cb = null;
        rl.off('line', _newLine);
    });
}


function onReadLine(buf: Buffer): Promise<number> {
    return new Promise(res => {
        cb = res;
        listenToReadLine(buf);
    });
}









