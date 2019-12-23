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
    slowCaseParseHttp,
} from "../../http/index";

import {
    NotFound,
    r,
    n,
} from "../../http/buffer";

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

    // TODO: First connect to the websocket stuff


    while (true) {
        console.log("Starting at", cliLen);
        const len = await onReadLine(buf.slice(cliLen));
        const str = ab2str(buf.slice(cliLen, cliLen + len));
        console.log("It actually worked", str, str === "__end__");

        if (str === "__ws_upgrade__") {
            break;
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









