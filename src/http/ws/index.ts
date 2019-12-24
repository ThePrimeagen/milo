import {
    BufferPool,
} from '../buffer';

import maskFn from './mask';

import {
    Socket,
} from '../../types';

import {
    SlowParsedHttp,
    HeaderKey,
} from '../types';

import * as SocketUtils from '../socket.utils';

// @ts-ignore
import {
    htonl,
    ntohl,
    htons,
    ntohs,
// @ts-ignore
} from 'network-byte-order';

type WSCallback = (buf: Buffer) => void;

// TODO: Continuation Frame
export enum Opcodes {
    ContinuationFrame = 0x0, // denotes a continuation frame
    TextFrame = 0x1, // denotes a text frame
    BinaryFrame = 0x2, // denotes a binary frame
    CloseConnection = 0x8, // denotes a connection close
    Ping = 0x9, // denotes a ping
    Pong = 0xA, // denotes a pong
};

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

// TODO: Fulfill the RFCs requirement for masks.
// TODO: ws module may not allow us to use as simple one like this.
function generateMask() {
    return 0xAABBAABB;
}

export function constructFrameHeader(
    buf: Buffer,
    isFinished: boolean,
    opCode: number,
    payloadLength: number,
    mask?: number,
): number {
    let ptr = 0;

    let firstByte = 0x0;
    if (isFinished) {
        firstByte |= 0x1;
    }

    firstByte |= (opCode & 0xF) << 4;
    buf.writeUInt8(firstByte, ptr++);

    // payload encoding

    let secondByte = 0;
    if (mask !== undefined) {
        secondByte = 0x1;
    }

    ptr++;
    if (payloadLength <= 125) {
        secondByte |= (payloadLength & 0x7F) << 1;
    }
    else if (payloadLength < 0xFFFF) {
        secondByte |= (126 & 0x7F) << 1;
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

    buf.writeUInt8(secondByte, 1);

    if (mask !== undefined) {
        htonl(buf, ptr, mask & 0xFFFF_FFFF);
        ptr += 4;
    }

    return ptr;
}

type WSState = {
    isFinished: boolean;
    rsv1: number;
    rsv2: number;
    rsv3: number;
    opcode: number;
    isMasked: boolean;
    mask: number;
    payloadLength: number;
    payload: Buffer;
    payloadPtr: number;
    payloads: Buffer[];
    state: State;

};

function createDefaultState() {
    return {
        isFinished: false,
        opcode: 0,
        isMasked: false,
        mask: 0,
        payloadLength: 0,
        payloadPtr: 0,
        payloads: [],
        state: State.Waiting,
    } as WSState;
}

export default class WSFrame {
    private callbacks: WSCallback[];
    private maxFrameSize: number;
    private msgState: WSState;
    private controlState: WSState;
    private closed: boolean;
    private sockfd: number;

    constructor(socketfd: number, maxFrameSize = 8096) {
        this.callbacks = [];
        this.maxFrameSize = maxFrameSize;
        this.msgState = createDefaultState();
        this.controlState = createDefaultState();
        this.closed = false;
        this.sockfd = socketfd;
    }

    getActiveState() {
        return this.controlState.state > this.msgState.state ?
            this.controlState : this.msgState;
    }

    onFrame(cb: WSCallback) {
        this.callbacks.push(cb);
    }

    // TODO: Contiuation frames, spelt wrong
    send(sockfd: Socket, buf: Buffer, offset: number,
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

        do {
            const ptrStart = ptr;

            if (ptr > offset) {
                ft = Opcodes.ContinuationFrame;
            }

            const frameSize = Math.min(endIdx - ptr, this.maxFrameSize);
            const headerEnd = constructFrameHeader(
                header, true, ft, frameSize, generateMask());

            const fullBuf = Buffer.allocUnsafe(headerEnd + frameSize);

            header.copy(fullBuf, 0);
            ptr += buf.copy(fullBuf, headerEnd, ptr, endIdx);

            SocketUtils.send(sockfd, fullBuf);

            ptrLength += ptr - ptrStart;

        } while (ptrLength < length);

        headerPool.free(header);
    }

    isControlFrame(packet: Buffer): boolean {
        const opCode = (packet[0] & 0xF0) >>> 4;
        return opCode === Opcodes.Ping ||
            opCode === Opcodes.Pong ||
            opCode === Opcodes.CloseConnection;
    }

    // TODO: Handle Continuation.
    processStreamData(packet: Buffer, offset: number, endIdx: number) {

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

                    state.payload.copy(headerBuf, 0);
                    packet.copy(headerBuf, state.payload.byteLength);

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
                    state.payload = packet.slice(ptr, endIdx);
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
    private parseHeader(
        state: WSState, packet: Buffer,
        offset: number, endIdx: number): number | boolean {

        if (endIdx - offset < MAX_HEADER_SIZE) {
            return false;
        }

        let ptr = offset;
        const byte1 = packet.readUInt8(ptr++);
        state.isFinished = (byte1 & 0x1) === 1;

        state.rsv1 = (byte1 & 0x2)
        state.rsv2 = (byte1 & 0x4)
        state.rsv3 = (byte1 & 0x8)
        state.opcode = (byte1 & 0xF0) >>> 4;

        const byte2 = packet.readUInt8(ptr++);

        state.isMasked = (byte2 & 0x1) === 1;

        state.payloadLength =  (byte2 & 0xFE) >>> 1;

        if (state.payloadLength === 126) {
            state.payloadLength = ntohs(packet, ptr);
            ptr += 2;
        }

        else if (state.payloadLength === 127) {
            throw new Error("We don't read your kind, packet");
        }

        if (state.isMasked) {
            state.mask = ntohl(packet, ptr);
            ptr += 4;
        }

        state.payloadPtr = 0;
        state.payload = Buffer.allocUnsafe(state.payloadLength);

        return ptr;
    }

    private parseBody(
        state: WSState, packet: Buffer,
        offset: number, endIdx: number): number {

        // TODO: When the packet has multiple frames in it, i need to be able
        // to read what I need to read, not the whole thing, segfault incoming

        // TODO: is this ever needed?
        const remaining = state.payloadLength - state.payloadPtr;
        const copyAmount = packet.copy(state.payload,
            state.payloadPtr, offset, endIdx);

        if (state.isMasked) {
            maskFn(state.payload, state.payloadPtr, copyAmount, state.mask);
        }

        state.payloadPtr += copyAmount;

        return copyAmount;
    }

    // TODO: We make the assumption that anyone who wants to use that data
    // has to copy it, and not us.
    private pushFrame(state: WSState) {
        let buf = state.payload;

        if (state.payloads.length) {
            state.payloads.push(state.payload);

            buf = Buffer.concat(state.payloads);
            state.payloads = null;
        }

        // TODO: Continuation Frame
        // TODONE: *** YEAH
        this.callbacks.forEach(cb => cb(buf));
    }
};

