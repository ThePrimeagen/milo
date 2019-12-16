import {
    AddrId,
    AddrInfoHints,

    NativeSocketInterface,
    fd_set,
    select,
    Socket,
} from '../types';

import {
    str2ab,
    ab2str
} from '../utils/index';

import onSelect from "../utils/onSelect";
import wait from "../utils/wait";

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

    const fdSet = bindings.fd_set();
    const socketList: number[] = [];
    const receivingBuf = Buffer.alloc(4096);

    process.on('SIGINT', function() {
        console.log("Caught interrupt signal");

        close(socketId);
        process.exit();
    });

    while (true) {
        FD_ZERO(fdSet);
        FD_SET(socketId, fdSet);

        socketList.forEach(fd => FD_SET(fd, fdSet));

        try {
            await onSelect(bindings.select, socketId, fdSet);

            if (FD_ISSET(socketId, fdSet)) {
                const clientfd = accept(socketId);

                if (!isValidSocket(clientfd)) {
                    throw new Error(`WHATNHOEUNTHOENTUHOE  --- accept ${getErrorString()}`);
                }

                socketList.push(clientfd);
            }
            else {
                routeOrClose(bindings, fdSet, socketList);
            }

        } catch (e) {
            console.log("Error", e, getErrorString());
        }

        await wait(2000);
    }

    console.log("closing because we received input.");
    if (close(socketId)) {
        console.error("Unable to close the socket.", getErrorString());
    }
};

function routeOrClose(
    bindings: NativeSocketInterface,
    fdSet: fd_set,
    socketList: Socket[]) {

    const receivingBuf = Buffer.alloc(4096);

    for (let i = socketList.length - 1; i >= 0; --i) {
        const clientfd = socketList[i];

        if (bindings.FD_ISSET(clientfd, fdSet)) {
            const out = bindings.recv(clientfd, receivingBuf, 4096);
            console.log("onrecv", out);

            if (out === 0 || out === -1) {
                bindings.FD_CLR(clientfd, fdSet);
                socketList.splice(socketList.indexOf(clientfd), 1);
                if (bindings.close(clientfd)) {
                    if (out !== -1) {
                        throw new Error(`Unable to close the socket. ${bindings.getErrorString()}`);
                    }
                }
            }
            else {
                console.log("Received", ab2str(receivingBuf.slice(0, out)));
                socketList.forEach((sockfd, idx) => {
                    if (i === idx) {
                        return;
                    }
                    bindings.send(sockfd, receivingBuf, out);
                });
            }
        }
    }
}
























