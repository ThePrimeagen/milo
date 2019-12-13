import {
    AddrId,
    AddrInfoHints,

    NativeSocketInterface
} from '../types';

import {
    str2ab,
    ab2str
} from '../utils/index';

export default function clientChat({
    SOCK_STREAM,
    AF_INET,
    AI_PASSIVE,

    socket,
    getaddrinfo,
    connect,
    send,
    onRecv,
    close,

    newAddrInfo,
    isValidSocket,
    getErrorString,
    gai_strerror,
    addrInfoToObject,
}: NativeSocketInterface) {

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
    const buf = Buffer.alloc(1024)
    /*
    buf[0] = 69;
    buf[1] = 70;
    buf[2] = 71;
    buf[3] = 72;
     */

    onRecv(socketId, buf, 0, readBytes => {
        str2ab;
        ab2str;
        debugger;
    });
};








