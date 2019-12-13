import {
    AddrId,
    AddrInfoHints,

    NativeSocketInterface,
    fd_set,
    Socket,
} from '../types';

import {
    str2ab,
    ab2str
} from '../utils/index';

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

        onRecv,
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

    console.log("bind with", socketId);
    if (bind(socketId, bindId)) {
        console.error("Unable to bind the socket.", getErrorString());
        return;
    }

    console.log("listen");
    if (listen(socketId, 0)) {
        console.error("Unable to listen the socket.", getErrorString());
        return;
    }

    console.log("Here 1");

    const fdSet = bindings.fd_set();
    FD_ZERO(fdSet);
    FD_SET(socketId, fdSet);

    while (true) {

        try {
            console.log("Here 2");
            await onSelect(bindings, socketId, fdSet);
            console.log("Here 3");
        } catch (e) {
            console.log("Error", e, getErrorString());
        }

        console.log("closing because we received input.");
        if (close(socketId)) {
            console.error("Unable to close the socket.", getErrorString());
        }
        return;
    }

};

function onSelect(bindings: NativeSocketInterface, sockfd: Socket, fdSet: fd_set) {
    return new Promise((res, rej) => {
        bindings.select(sockfd, fdSet, (err, value) => {
            if (err) {
                rej(err);
                return;
            }
            res(value);
            return;
        });
    });
}
























