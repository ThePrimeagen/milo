// TODO: Error Handling?

import {
    Socket,
    NativeSocketInterface
} from '../types';

import {
    uint8ArraySlice
} from "../utils";

import b from '../bindings';
const bindings = b as NativeSocketInterface;
const noop = () => {};

// sends structured data
type SendFragment = {
    socketId: Socket,
    buffer: Uint8Array,
    flags: number,
    idx: number,
    cb: () => void | null,
};

const queue: SendFragment[] = [];
let running = false;

// TODO: If buffer creation is making everything slow then we will split the
// header from the body, but ensure we can send that.
function sendWithQueue() {
    if (queue.length === 0) {
        return;
    }

    const item = queue[0];

    const buf = uint8ArraySlice(item.buffer, item.idx, item.buffer.byteLength);
    const len = item.buffer.byteLength - item.idx;

    const sentBytes = bindings.send(
        item.socketId, buf, len, item.flags);

    // TODO: write yourself a damn linked listn already.
    if (sentBytes === len) {
        const sf = queue.shift();
        sf.cb && sf.cb();
    }
    else {
        item.idx += sentBytes;
    }

    if (queue.length) {
        setImmediate(sendWithQueue);
    }
}

// uint8ArraySlice(buf, 0, length)
export function send(
    socketId: Socket, buffer: Uint8Array, flags: number = 0, cb: () => void = null) {

    const sF = {
        socketId,
        buffer,
        idx: 0,
        flags,
        cb
    };

    queue.push(sF);
    sendWithQueue();
};

