import {
    AddrId,
    AddrInfoHints,

    NativeSocketInterface
} from '../types';

import {
    slowCaseParseHttp
} from '../http';

import {
    str2ab,
    ab2str
} from '../utils/index';

import onSelect from "../utils/onSelect";
import readline from 'readline';

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

export default async function clientChat(bindings: NativeSocketInterface) {
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
    console.log("XXXX - localhost", "8080");
    const addrInfoResult =
        getaddrinfo(0, "8080", hintsId, bindId);

    if (addrInfoResult) {
        console.error("Unable to getaddrinfo.  Also stop using this method you dingus");
        return;
    }

    const bindData = addrInfoToObject(bindId);
    const socketId = socket(
        bindData.ai_family, bindData.ai_socktype, bindData.ai_protocol);

    console.log("Sacket id" , socketId);
    if (!isValidSocket(socketId)) {
        console.error("Unable to create the socket", getErrorString());
        return;
    }

    console.log("about to connect");
    const connectStatus = connect(socketId, bindId);
    console.log("connectStatus" , connectStatus);
    if (connectStatus) {
        console.error("Unable to connect to the socket", getErrorString());
        return;
    }

    // TODO: This interface kind of sucks...
    const buf = Buffer.alloc(4096);
    const fdSet = bindings.fd_set();

    rl.on('line', function(line) {
        const len = buf.write(line);

        console.log("onLine", buf.slice(0, len), len);
        send(socketId, buf, len);
    });

    while (true) {
        FD_ZERO(fdSet);
        FD_SET(socketId, fdSet);

        await onSelect(select, socketId, fdSet);

        if (FD_ISSET(socketId, fdSet)) {
            // TODO: Build a message larger than a single MTU
            const len = bindings.recv(socketId, buf, buf.byteLength);

            if (len === 0) {
                const closeValue = close(socketId);
                if (closeValue) {
                    console.log("Things went wrong closing the server socket", gai_strerror(closeValue), getErrorString());
                }
                console.log("Closing the ship down");
                return;
            }

            console.log(slowCaseParseHttp(buf, 0, len));
        }
    }
};



