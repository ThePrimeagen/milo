// TODO: Error Handling?

import {
    Socket,
    NativeSocketInterface
} from '../types';

import b from '../bindings';
const bindings = b as NativeSocketInterface;
const noop = () => {};

// sends structured data
type SendFragment = {
    socketId: Socket,
    buffer: Buffer,
    endingIdx: number,
    flags: number,
    idx: number,
    cb: () => void,
};

const queue: SendFragment[] = [];
let running = false;

function sendWithQueue() {
    if (queue.length === 0) {
        return;
    }

    const item = queue[0];

    const buf = item.buffer.slice(item.idx, item.endingIdx);
    const len = item.endingIdx - item.idx;
    const sentBytes = bindings.send(
        item.socketId, buf, len, item.flags);

    // TODO: write yourself a damn linked listn already.
    if (sentBytes === len) {
        const sf = queue.shift();
        sf.cb();
    }
    else {
        item.idx += sentBytes;
    }

    if (queue.length) {
        setImmediate(sendWithQueue);
    }
}

export function send(socketId: Socket, buffer: Buffer, offset: number, length: number, flags: number = 0, cb: () => void = noop) {
    const sF = {
        socketId,
        buffer,
        idx: offset,
        endingIdx: offset + length,
        flags,
        cb
    };
    queue.push(sF);
    sendWithQueue();
};

