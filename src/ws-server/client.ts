import HTTP, {
    slowCaseParseHttp
} from '../http/index';

import WS from '../http/ws/index';
import bindings from '../bindings';

import {
    AddrId,
    AddrInfoHints,
    NativeSocketInterface
} from '../types';

import {
    str2ab,
    ab2str
} from '../utils/index';

import onSelect from "../utils/onSelect";
import readline from 'readline';

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
    process.abort();
}

const bindData = addrInfoToObject(bindId);
const socketId = socket(
    bindData.ai_family, bindData.ai_socktype, bindData.ai_protocol);

console.log("Sacket id" , socketId);
if (!isValidSocket(socketId)) {
    console.error("Unable to create the socket", getErrorString());
    process.abort();
}

console.log("about to connect");
const connectStatus = connect(socketId, bindId);
console.log("connectStatus" , connectStatus);
if (connectStatus) {
    console.error("Unable to connect to the socket", getErrorString());
    process.abort();
}

// TODO: This interface kind of sucks...

/*
rl.on('line', function(line) {
    const len = buf.write(line);

    console.log("onLine", buf.slice(0, len), len);
    send(socketId, buf, len);
});
 */

const http = new HTTP();

const host = "localhost:8080";
const path = "/";

http.upgradeToWS(socketId, host, path);

async function run() {
    const buf = Buffer.alloc(4096);
    const fdSet = bindings.fd_set();

    let count = 0;
    let connected = false;

    do {
        FD_ZERO(fdSet);
        FD_SET(socketId, fdSet);
        await onSelect(select, socketId, fdSet);
        connected = FD_ISSET(socketId, fdSet);
    } while (!connected && ++count < 5);

    if (!connected) {
        throw new Error("You are dumb");
    }

    let bytesRead = recv(socketId, buf, 4096);
    if (bytesRead === 0) {
        throw new Error("How did you get closed so fast?");
    }

    let parsedMsg = slowCaseParseHttp(buf, 0, bytesRead);
    if (!http.validateUpgrade(parsedMsg)) {
        throw new Error("Not a valid rvsp");
    }

    console.log("We actually really did it.  Like for real, ws are connected.");

    const ws = new WS(socketId);

    let dataCount = 0;
    let then = Date.now();
    let bytesReceived = 0;

    ws.send("send");
    ws.onData(function parseWSData(state, buffer) {
        bytesReceived += buffer.byteLength;

        if (++dataCount === 1000) {
            const now = Date.now();
            console.log("Total Bytes Received:", bytesReceived);
            console.log("Time Spent:", now - then);
            console.log("Mbps:", (bytesReceived / (now - then)) * 1000);
            return;
        }
        else if (dataCount < 1000) {
            ws.send("send");
        }
    });

    const countObj = {count: 0};
    ws.send(countObj);

    while (true) {

        FD_ZERO(fdSet);
        FD_SET(socketId, fdSet);
        await onSelect(select, socketId, fdSet);

        if (FD_ISSET(socketId, fdSet)) {
            const bytesRead = recv(socketId, buf, 4096, 0);
            ws.pushData(buf, 0, bytesRead);
        }
    }
}

run();
