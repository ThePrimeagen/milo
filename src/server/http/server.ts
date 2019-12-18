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

import serverLoop from "../baseServer";
import onSelect from "../../utils/onSelect";
import wait from "../../utils/wait";
import closeOnCtrlC from "../../utils/closeOnCtrlC";
import {
    isWSUpgradeRequest,
} from "../../ws";

import {
    NotFound,
    getHTTPHeaderEndOffset,
    getContentLengthOffset,
    getEndLineOffset,
    slowCaseParseHttp,
    HTTPBuilder,
} from "../../http";

export default async function serverChat(bindings: NativeSocketInterface) {
    const {
        SOCK_STREAM,
        AF_INET,
        AI_PASSIVE,

        socket,
        getaddrinfo,
        bind,
        listen,
        close,

        recv,
        send,
        accept,

        newAddrInfo,
        isValidSocket,
        getErrorString,
        gai_strerror,
        addrInfoToObject,

        FD_CLR,
        FD_SET,
        FD_ZERO,
        FD_ISSET,
    } = bindings;

    const addrHints: AddrInfoHints = {
        ai_socktype: SOCK_STREAM,
        ai_family: AF_INET,
        ai_flags: AI_PASSIVE,
    };

    const hintsId = newAddrInfo(addrHints);
    const bindId = newAddrInfo();

    const addrInfoResult = getaddrinfo(0, "8080", hintsId, bindId);

    if (addrInfoResult) {
        console.error(
            "Unable to getaddrinfo.  Also stop using this method you dingus",
            addrInfoResult, getErrorString(), gai_strerror(addrInfoResult));
        return;
    }

    const bindData = addrInfoToObject(bindId);
    const socketId = socket(
        bindData.ai_family, bindData.ai_socktype, bindData.ai_protocol);

    if (!isValidSocket(socketId)) {
        console.error("Unable to create the socket", getErrorString());
        return;
    }

    if (bind(socketId, bindId)) {
        console.error("Unable to bind the socket.", getErrorString());
        return;
    }

    if (listen(socketId, 0)) {
        console.error("Unable to listen the socket.", getErrorString());
        return;
    }

    const readBuf = Buffer.alloc(4096);
    closeOnCtrlC(socketId);

    const wsFds = new Map();

    serverLoop(bindings, socketId, (socket: Socket, socketList: Socket[], idx: number) => {
        const readBytes = recv(socket, readBuf, 4096);

        // Houstone, we have a problem.
        if (readBytes < 0) {
            console.log("I don't knwon which erro to print, so I'll do both", getErrorString());
            return;
        }

        // Time to go to sleep on this socket...
        else if (readBytes === 0) {
            console.log("I probably should closed this down.");
            return;
        }

        // Read this thing
        if (wsFds.has(socket)) {
        }

        const content = slowCaseParseHttp(readBuf, 0, readBytes);

        // Upgrade the request
        if (isWSUpgradeRequest(content)) {
            wsFds.set(socket, true);

            // TODO: Prolly make this faster, stronger, work is literally never
            // over
            const response = new HTTPBuilder();
            response.setUpgradeProtocol(content);

            console.log("Sending", ab2str(response.getBuffer().slice(0, response.length())));
            send(socket, response.getBuffer(), response.length(), 0);
        }

        else {
            //server the request
        }

        console.log("ContentS", content);
    });
};










