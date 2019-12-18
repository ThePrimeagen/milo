import {
    AddrId,
    AddrInfoHints,

    NativeSocketInterface,
    fd_set,
    select,
    Socket,
} from '../types';

import onSelect from "../utils/onSelect";
import wait from "../utils/wait";

export type ServerLoopCallback = (socket: Socket, socketList: Socket[], idx: number) => void;

export default async function serverLoop(
    bindings: NativeSocketInterface,
    socketId: number,
    cb: ServerLoopCallback,
    opts: {shouldPause: boolean, pauseMS: number} = {
        shouldPause: true,
        pauseMS: 200
    },
) {
    const {
        recv,
        send,
        accept,

        isValidSocket,
        getErrorString,
        gai_strerror,

        FD_CLR,
        FD_SET,
        FD_ZERO,
        FD_ISSET,
    } = bindings;

    const fdSet = bindings.fd_set();
    const socketList: number[] = [];
    const receivingBuf = Buffer.alloc(4096);

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
                for (let i = socketList.length - 1; i >= 0; --i) {
                    if (FD_ISSET(socketList[i], fdSet)) {

                        // TODO: maybe a problem.
                        // expects sync behavior...
                        cb(socketList[i], socketList, i);
                    }
                }
            }

        } catch (e) {
            console.log("Error", e, getErrorString());
            break;
        }

        if (opts.shouldPause) {
            await wait(opts.pauseMS);
        }
    }
};

