import {
    BufferPool,
    parse64BigInt,
} from '../buffer';

import maskFn from './mask';

import {
    uint8ArraySlice,
    uint8ArrayConcat
} from "../../utils";

import {
    Socket,
} from '../../types';

import {
    SlowParsedHttp,
    HeaderKey,
} from '../types';

import {
    Opcodes
} from './types';

import * as SocketUtils from '../socket.utils';

// @ts-ignore
import {
    htonl,
    ntohl,
    htons,
    ntohs,
// @ts-ignore
} from 'network-byte-order';

type WSCallback = (buffer: Uint8Array, state: WSState) => void;

enum State {
    Waiting = 1,
    ParsingHeader,
    WaitingForCompleteHeader,
    ParsingBody,
};

// NOTE: For teh stream, not for the streamer
// 1.  How to open up, insert, command, and quit.
// 2.  How to hjkl
// 3.  How to wb
// 4.  How to yp
// 5.  How to d
// 6.  How to ft
// 7.  How to xs
// 8.  How to ci({|(|[)
// 9.  How to $%
//
// TODO: Probably should do some sort of object pool.

const MAX_HEADER_SIZE = 8;
const headerPool = new BufferPool(MAX_HEADER_SIZE);

const maskNumber = 0xAABBAABB;
const maskBuf = new Uint8Array(4);
const maskView = new DataView(maskBuf.buffer);
maskView.setUint32(0, maskNumber, true);

let payloadHeadersReceived = 0;

// TODO: Fulfill the RFCs requirement for masks.
// TODO: ws module may not allow us to use as simple one like this.
function generateMask(): Uint8Array {
    return maskBuf;
}

export function constructFrameHeader(
    buf: Uint8Array,
    isFinished: boolean,
    opCode: number,
    payloadLength: number,
    mask?: Uint8Array,
): number {
    let ptr = 0;

    let firstByte = 0x0;
    if (isFinished) {
        firstByte |= (0x1) << 7;
    }

    firstByte |= (opCode & 0xF);
    buf[ptr++] = firstByte;

    // payload encoding
    let secondByte = 0;
    if (mask !== undefined) {
        secondByte = 0x1 << 7;
    }

    ptr++;
    if (payloadLength <= 125) {
        secondByte |= (payloadLength & 0x7F);
    }
    else if (payloadLength < 0xFFFF) {
        secondByte |= (126 & 0x7F);
        // TODO: check my endiannes first.  This assumes LittleEndian to BigEndian.
        htons(buf, ptr, payloadLength);

        ptr += 2;
    }
    else {
        // NOTE: This should just never be an option.  It really is
        // insanity wolf to make a packet this big that would throttle the
        // whole ws pipeline.
        throw new Error('Bad implementation, Prime');
    }

    buf[1] = secondByte;

    if (mask !== undefined) {
        buf.set(mask, ptr);
        ptr += 4;
    }

  return ptr;
}

export type WSState = {
    isFinished: boolean;
    rsv1: number;
    rsv2: number;
    rsv3: number;
    opcode: number;
    isMasked: boolean;
    mask: Uint8Array;
    payloadLength: number;
    payload: Uint8Array;
    isControlFrame: boolean;
    payloadPtr: number;
    payloads: Uint8Array[];
    state: State;
};

function createDefaultState(isControlFrame = false) {
    return {
        isFinished: false,
        opcode: 0,
        isControlFrame,
        isMasked: false,
        mask: new Uint8Array(4),
        payloadLength: 0,
        payloadPtr: 0,
        payloads: [],
        state: State.Waiting,
    } as WSState;
}

export default class WSFramer {
    private callbacks: WSCallback[];
    private maxFrameSize: number;
    private maxPacketSize: number;
    private msgState: WSState;
    private controlState: WSState;
    private closed: boolean;

    constructor(maxFrameSize = 8096, maxPacketSize = 1024 * 1024 * 4) {
        this.callbacks = [];
        this.maxFrameSize = maxFrameSize;
        this.maxPacketSize = maxPacketSize;
        this.msgState = createDefaultState();
        this.controlState = createDefaultState(true);
        this.closed = false;
    }

    getActiveState() {
        return this.controlState.state > this.msgState.state ?
            this.controlState : this.msgState;
    }

    onFrame(cb: WSCallback) {
        this.callbacks.push(cb);
    }

    // TODO: Contiuation frames, spelt wrong
    send(sockfd: Socket, buf: Uint8Array, offset: number,
        length: number, frameType: Opcodes = Opcodes.BinaryFrame) {

        if (length > 2 ** 32) {
            throw new Error("You are dumb");
        }

        const endIdx = offset + length;
        let ptr = offset;
        let ptrLength = 0;
        let ft = frameType;
        let count = 0;

        const header = headerPool.malloc();
        header[0] = 0;

        do {
            const ptrStart = ptr;

            if (ptr > offset) {
                ft = Opcodes.ContinuationFrame;
            }

            const frameSize = Math.min(endIdx - ptr, this.maxFrameSize);
            const mask = generateMask();
            const headerEnd = constructFrameHeader(
                header, true, ft, frameSize, mask);

            const fullBuf = new Uint8Array(headerEnd + frameSize);

            fullBuf.set(header);

            const sub = new Uint8Array(buf.buffer, ptr, endIdx - ptr);
            fullBuf.set(sub, headerEnd);
            ptr += sub.byteLength;

            maskFn(fullBuf, headerEnd, frameSize, mask);

            // TODO if fullBuf is just to slow to send upgrade the socket
            // library to handle the same reference to the buf with different
            // offsets.
            SocketUtils.send(sockfd, fullBuf);

            ptrLength += ptr - ptrStart;

        } while (ptrLength < length);

        headerPool.free(header);
    }

    isControlFrame(packet: Uint8Array): boolean {
        const opCode = (packet[0] & 0x0F);

        return opCode === Opcodes.Ping ||
            opCode === Opcodes.Pong ||
            opCode === Opcodes.CloseConnection;
    }

    // TODO: Handle Continuation.
    processStreamData(packet: Uint8Array, offset: number, endIdx: number) {

        if (this.closed) {
            throw new Error("Hey, closed for business bud.");
        }

        let ptr = offset;
        let state = this.getActiveState();

        do {
            if (state.state === State.Waiting ||
                state.state === State.WaitingForCompleteHeader) {

                // ITS GONNA DO IT.
                if (state.state === State.Waiting &&
                    this.isControlFrame(packet)) {
                    state = this.controlState;
                }

                let nextPtrOffset: number | boolean = 0;
                if (state.state === State.Waiting) {
                    nextPtrOffset = this.parseHeader(state, packet, ptr, endIdx);
                }

                else {
                    // TODO: Stitching control frames???
                    // CONFUSING, stitch the two headers together, and call it
                    // a day.
                    const headerBuf = headerPool.malloc();
                    const payloadByteLength = state.payload.byteLength;

                    headerBuf.set(state.payload);
                    headerBuf.set(packet, state.payload.byteLength);

                    nextPtrOffset =
                        this.parseHeader(state, headerBuf, 0, MAX_HEADER_SIZE);

                    if (typeof nextPtrOffset === 'boolean') {
                        throw new Error("WHAT JUST HAPPENED HERE, DEBUG ME PLEASE");
                    }

                    nextPtrOffset -= payloadByteLength;
                    headerPool.free(headerBuf);
                }

                if (nextPtrOffset === false) {

                    state.state = State.WaitingForCompleteHeader;
                    state.payload = uint8ArraySlice(packet, ptr, endIdx);
                    break;
                }

                else {
                    // @ts-ignore
                    ptr = nextPtrOffset;
                }
            }

            state.state = State.ParsingBody;
            const remainingPacket = state.payloadLength - state.payloadPtr;
            const subEndIdx = Math.min(ptr + remainingPacket, endIdx);

            ptr += this.parseBody(state, packet, ptr, subEndIdx);

            const endOfPayload = state.payloadLength === state.payloadPtr;
            if (state.isFinished && endOfPayload) {
                state.isFinished = false;
                state.state = State.Waiting;
                this.pushFrame(state);

                if (state.opcode === Opcodes.CloseConnection) {
                    this.closed = true;
                }
            }

            // TODO: we about to go into contiuation mode, so get it baby!
            else if (!state.isFinished && endOfPayload) {
                state.payloads.push(state.payload);
                state.state = State.Waiting;
            }

        } while (ptr < endIdx);
    }

    /*
     * straight out of rfc:
     * https://tools.ietf.org/html/rfc6455
     *
      0                   1                   2                   3
      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
     +-+-+-+-+-------+-+-------------+-------------------------------+
     |F|R|R|R| opcode|M| Payload len |    Extended payload length    |
     |I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
     |N|V|V|V|       |S|             |   (if payload len==126/127)   |
     | |1|2|3|       |K|             |                               |
     +-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
     |     Extended payload length continued, if payload len == 127  |
     + - - - - - - - - - - - - - - - +-------------------------------+
     |                               |Masking-key, if MASK set to 1  |
     +-------------------------------+-------------------------------+
     | Masking-key (continued)       |          Payload Data         |
     +-------------------------------- - - - - - - - - - - - - - - - +
     :                     Payload Data continued ...                :
     + - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
     |                     Payload Data continued ...                |
     +---------------------------------------------------------------+
     */

    // TODO: Endianness????
    //
    // Send 126 bytes to find out how they order their bytes.
    private parseHeader(state: WSState, packet: Uint8Array, offset: number, endIdx: number): number | boolean {

        if (endIdx - offset < MAX_HEADER_SIZE) {
            return false;
        }

        let ptr = offset;
        const byte1 = packet[ptr++];
        state.isFinished = (byte1 & (0x80)) >>> 7 === 1;

        state.rsv1 = (byte1 & 0x40) >> 6;
        state.rsv2 = (byte1 & 0x20) >> 5;
        state.rsv3 = (byte1 & 0x10) >> 4;

        const opcode = byte1 & 0xF;

        if (opcode != Opcodes.ContinuationFrame &&
            opcode != Opcodes.BinaryFrame) {
            debugger;
        }

        if (opcode != Opcodes.ContinuationFrame) {
            state.opcode = opcode;
        }

        const byte2 = packet[ptr++];

        state.isMasked = (byte2 & 0x80) >>> 7 === 1;

        state.payloadLength =  (byte2 & 0x7F);

        if (state.payloadLength === 126) {
            state.payloadLength = ntohs(packet, ptr);
            ptr += 2;
        }

        else if (state.payloadLength === 127) {
            const payloadB = parse64BigInt(packet, ptr);
            if (payloadB > BigInt(this.maxPacketSize)) {
                throw new Error(`Cannot possibly parse a payload of ${payloadB}.  Too big`);
            }

            state.payloadLength = Number(payloadB);
            ptr += 8;
        }

        if (state.isMasked) {
            state.mask = packet.slice(ptr, ptr + 4);
            ptr += 4;
        }

        state.payloadPtr = 0;
        state.payload = new Uint8Array(state.payloadLength);

        console.log("PayloadLength", ++payloadHeadersReceived, state.payloadLength);

        return ptr;
    }

    private parseBody(
        state: WSState, packet: Uint8Array,
        offset: number, endIdx: number): number {

        // TODO: When the packet has multiple frames in it, i need to be able
        // to read what I need to read, not the whole thing, segfault incoming

        // TODO: is this ever needed?
        const remaining = state.payloadLength - state.payloadPtr;
        const sub = new Uint8Array(packet.buffer, offset, endIdx - offset);
            debugger;
        state.payload.set(sub, state.payloadPtr);
        const copyAmount = sub.byteLength;

        if (state.isMasked) {
            maskFn(state.payload, state.payloadPtr, copyAmount, state.mask);
        }

        state.payloadPtr += copyAmount;

        return copyAmount;
    }

    // TODO: We make the assumption that anyone who wants to use that data
    // has to copy it, and not us.
    //
    // TODO: Obviously there is no copying here.
    private pushFrame(state: WSState) {
        let buf = state.payload;

        // const fState = Object.
        //     keys(state).
        //     // @ts-ignore
        //     reduce((acc, k) => {


        //     // @ts-ignore
        //         if (state[k] instanceof Buffer) {
        //     // @ts-ignore
        //             acc[k] = `Buffer(${state[k].byteLength})`;
        //     // @ts-ignore
        //         }
        //     // @ts-ignore
        //         else {
        //     // @ts-ignore
        //             acc[k] = state[k];
        //         }
        //         return acc;
        //     }, {});

        //console.log("PushFrame", buf.byteLength, fState);

        if (state.payloads.length) {
            state.payloads.push(state.payload);

            // buf = Buffer.concat(state.payloads);
            buf = uint8ArrayConcat.apply(undefined, state.payloads);
            state.payloads = null;
        }

        // TODO: Continuation Frame
        // TODONE: *** YEAH
        this.callbacks.forEach(cb => cb(buf, state));
    }
};

