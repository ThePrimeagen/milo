import { Platform, DataBuffer } from "../Platform";

import {
    BufferPool,
    parse64BigInt,
} from './buffer';

import {
    NetworkPipe,
    IDataBuffer,
} from '../types';

import {
    assert
} from '../utils';

import maskFn from "./mask";

import {
    Opcodes
} from './types';


// @ts-ignore
import {
    htons,
    ntohs,
    // @ts-ignore
} from 'network-byte-order';

type WSCallback = (buffer: IDataBuffer, state: WSState) => void;

enum State {
    Waiting = 1,
    ParsingHeader,
    WaitingForCompleteHeader,
    ParsingBody,
};

// TODO: Probably should do some sort of object pool.
const MAX_HEADER_SIZE = 8;
const headerPool = new BufferPool(MAX_HEADER_SIZE);

// TODO: Rotate pools.
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
    buf: IDataBuffer,
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
    buf.setUInt8(ptr++, firstByte);

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
        buf.setUInt16BE(ptr, payloadLength);
        ptr += 2;
    }
    else {
        // TODO: put an exception in WS Constructor if you attempt to make
        // frames larger than 64KB
        //
        // TODO: Or should we allow it?  Maybe?
        //
        // NOTE: This should just never be an option.  It really is
        // insanity wolf to make a packet this big that would throttle the
        // whole ws pipeline.
        throw new Error('Bad implementation, Prime');
    }

    buf.setUInt8(1, secondByte);

    if (mask !== undefined) {
        buf.set(ptr, mask);
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
    payload: IDataBuffer;
    isControlFrame: boolean;
    payloadPtr: number;
    payloads?: IDataBuffer[];
    state: State;
};

function createDefaultState(isControlFrame = false) {
    // @ts-ignore
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
    private pipe: NetworkPipe;

    constructor(pipe: NetworkPipe, maxFrameSize = 8096, maxPacketSize = 1024 * 1024 * 4) {
        this.callbacks = [];
        this.pipe = pipe;
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
    send(buf: IDataBuffer, offset: number,
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
        assert(header, "Gotta have header");

        header.setUInt8(0, 0);

        do {
            const ptrStart = ptr;

            if (ptr > offset) {
                ft = Opcodes.ContinuationFrame;
            }

            const frameSize = Math.min(endIdx - ptr, this.maxFrameSize);
            const mask = generateMask();
            const headerEnd = constructFrameHeader(
                header, true, ft, frameSize, mask);

            const fullBuf = new DataBuffer(headerEnd + frameSize);

            fullBuf.set(0, header);

            fullBuf.set(headerEnd, buf, ptr, frameSize);
            ptr += frameSize;

            maskFn(fullBuf, headerEnd, frameSize, mask);

            // TODO if fullBuf is just to slow to send upgrade the socket
            // library to handle the same reference to the buf with different
            // offsets.
            this.pipe.write(fullBuf, 0, fullBuf.byteLength);

            ptrLength += ptr - ptrStart;

        } while (ptrLength < length);

        headerPool.free(header);
    }

    /**
     * Does some basic logic to check if the header is completed.
     */
    isHeaderComplete(packet: IDataBuffer, offset: number, length: number): boolean {
        let ptr = offset;
        throw new Error("Not Implemented");
    }

    isControlFrame(packet: IDataBuffer, offset: number): boolean {
        const opCode = (packet.getUInt8(offset) & 0x0F);

        return opCode === Opcodes.Ping ||
            opCode === Opcodes.Pong ||
            opCode === Opcodes.CloseConnection;
    }

    // TODO: Handle Continuation.
    processStreamData(packet: IDataBuffer, offset: number, endIdx: number) {

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
                    this.isControlFrame(packet, ptr)) {
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

                    assert(headerBuf, "Gotta have headerBuf");

                    headerBuf.set(0, state.payload, 0, payloadByteLength);
                    packet.subarray(ptr, headerBuf.byteLength - payloadByteLength),
                    headerBuf.set(payloadByteLength, packet, ptr,
                                  headerBuf.byteLength - payloadByteLength);

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
                    state.payload = packet.slice(ptr, endIdx - ptr);

                    break;
                }

                else {
                    // @ts-ignore
                    ptr = offset + nextPtrOffset;
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
                if (!state.payloads)
                    state.payloads = [];
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

    private isHeaderParsable(packet: IDataBuffer, offset: number, endIdx: number): boolean {
        const len = endIdx - offset;
        if (len < 2) {
            return false;
        }

        const byte1 = packet.getUInt8(offset);
        const byte2 = packet.getUInt8(offset + 1);
        const isMasked = (byte2 & 0x80) >>> 7 === 1;
        const payloadLength = (byte2 & 0x7F);

        let size = 2;
        if (payloadLength === 126) {
            size += 2;
        }
        else if (payloadLength === 127) {
            size += 8;
        }

        if (isMasked) {
            size += 4;
        }

        return len >= size;
    }

    private parseHeader(state: WSState, packet: IDataBuffer, offset: number, endIdx: number): number | boolean {

        if (!this.isHeaderParsable(packet, offset, endIdx)) {
            return false;
        }

        let ptr = offset;
        const byte1 = packet.getUInt8(ptr++);
        state.isFinished = (byte1 & (0x80)) >>> 7 === 1;

        state.rsv1 = (byte1 & 0x40) >> 6;
        state.rsv2 = (byte1 & 0x20) >> 5;
        state.rsv3 = (byte1 & 0x10) >> 4;

        const opcode = byte1 & 0xF;

        if (opcode != Opcodes.ContinuationFrame &&
            opcode != Opcodes.BinaryFrame) {
        }

        if (opcode != Opcodes.ContinuationFrame) {
            state.opcode = opcode;
        }

        const byte2 = packet.getUInt8(ptr++);

        state.isMasked = (byte2 & 0x80) >>> 7 === 1;

        state.payloadLength = (byte2 & 0x7F);

        if (state.payloadLength === 126) {
            state.payloadLength = packet.getUInt16BE(ptr);
            ptr += 2;
        }

        else if (state.payloadLength === 127) {
            assert(packet.getUInt32BE(ptr) === 0, "Nope. As of now, we don't allow larger than this ever.  Why would you ever send this much data through a WS anyways?  What's wrong with you...");
            state.payloadLength = packet.getUInt32BE(ptr + 4);

            ptr += 8;
        }

        if (state.isMasked) {
            state.mask = new Uint8Array(4);
            const maskBuf = packet.subarray(ptr, 4);
            state.mask[0] = maskBuf.getUInt8(0);
            state.mask[1] = maskBuf.getUInt8(1);
            state.mask[2] = maskBuf.getUInt8(2);
            state.mask[3] = maskBuf.getUInt8(3);

            ptr += 4;
        }

        state.payloadPtr = 0;
        state.payload = new DataBuffer(state.payloadLength);

        return ptr;
    }

    private parseBody(
        state: WSState, packet: IDataBuffer,
        offset: number, endIdx: number): number {

        // TODO: When the packet has multiple frames in it, i need to be able
        // to read what I need to read, not the whole thing, segfault incoming

        // TODO: is this ever needed?
        const remaining = state.payloadLength - state.payloadPtr;
        const sub = packet.subarray(offset, endIdx - offset);

        state.payload.set(state.payloadPtr, sub);
        const copyAmount = sub.byteLength;

        debugger;
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

        if (state.payloads && state.payloads.length) {
            state.payloads.push(state.payload);

            // buf = Buffer.concat(state.payloads);
            buf = DataBuffer.concat(...state.payloads);
            state.payloads = undefined;
        }

        this.callbacks.forEach(cb => cb(buf, state));
    }
};

