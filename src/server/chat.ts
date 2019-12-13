import {
    AddrId,
    AddrInfoHints,

    NativeSocketInterface
} from '../types';

import {
    str2ab,
    ab2str
} from '../utils/index';

export default function serverChat({
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
}: NativeSocketInterface) {
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

    console.log("bind");
    if (bind(socketId, bindId)) {
        console.error("Unable to bind the socket.", getErrorString());
    }


    console.log("listen");
    if (listen(socketId, 0)) {
        console.error("Unable to listen the socket.", getErrorString());
    }

    console.log("closing");
    if (close(socketId)) {
        console.error("Unable to close the socket.", getErrorString());
    }
};

