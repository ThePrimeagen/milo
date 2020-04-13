import DataBuffer from "../../DataBuffer";
import IDataBuffer from "../../IDataBuffer";
import { Opcodes } from "../types";
import { WSState, FramerState, MAX_HEADER_SIZE, MASK_SIZE, } from "./types";

/*
 *
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

const maskBuf = new DataBuffer(MASK_SIZE);

export function generateMask(): IDataBuffer {
    maskBuf.setUInt8(0, Math.floor(Math.random() * 256));
    maskBuf.setUInt8(1, Math.floor(Math.random() * 256));
    maskBuf.setUInt8(2, Math.floor(Math.random() * 256));
    maskBuf.setUInt8(3, Math.floor(Math.random() * 256));
    return maskBuf;
}

export function constructFrameHeader(
    buf: IDataBuffer,
    isFinished: boolean,
    opCode: number,
    payloadLength: number,
    mask?: IDataBuffer,
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
    if (mask) {
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
        // TODO: I could put something here to make the window larger.
        // TODO: put an exception in WS Constructor if you attempt to make
        // frames larger than 64KB
        //
        // TODO: Or should we allow it?  Maybe?
        //
        // NOTE: This should just never be an option.  It really is
        // insanity wolf to make a packet this big that would throttle the
        // whole ws pipeline.
        throw new Error("Bad implementation, Prime");
    }

    buf.setUInt8(1, secondByte);

    if (mask) {
        buf.set(ptr, mask);
        ptr += 4;
    }

    return ptr;
}

export function isHeaderParsable(packet: IDataBuffer, len: number): boolean {
    if (len < 2) {
        return false;
    }

    const byte1 = packet.getUInt8(0);
    const byte2 = packet.getUInt8(1);

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

export function parseHeader(header: IDataBuffer, state: WSState): number {
    let ptr = 0;
    const byte1 = header.getUInt8(ptr++);
    state.isFinished = (byte1 & (0x80)) >>> 7 === 1;

    state.rsv1 = (byte1 & 0x40) >> 6;
    state.rsv2 = (byte1 & 0x20) >> 5;
    state.rsv3 = (byte1 & 0x10) >> 4;

    const opcode = byte1 & 0xF;

    if (opcode !== Opcodes.ContinuationFrame) {
        state.opcode = opcode;
    }

    const byte2 = header.getUInt8(ptr++);

    state.isMasked = (byte2 & 0x80) >>> 7 === 1;

    state.payloadLength = (byte2 & 0x7F);

    if (state.payloadLength === 126) {
        state.payloadLength = header.getUInt16BE(ptr);
        ptr += 2;
    }

    else if (state.payloadLength === 127) {
        state.payloadLength = header.getUInt32BE(ptr + 4);
        ptr += 8;
    }

    if (state.isMasked) {
        state.currentMask.set(0, header, ptr, MASK_SIZE);
        ptr += 4;
    }

    state.payloadPtr = 0;
    state.payload = new DataBuffer(state.payloadLength);

    return ptr;
}

