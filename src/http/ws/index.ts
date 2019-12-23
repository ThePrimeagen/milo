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

const headerPool = new BufferPool(6);

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
        debugger;
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

export default class WSFrame {
    private callbacks: WSCallback[];
    private key: string;
    private isFinished: boolean;
    private rsv1: number;
    private rsv2: number;
    private rsv3: number;
    private opcode: number;
    private isMasked: boolean;
    private mask: number;
    private payloadLength: number;
    private payload: Buffer;
    private payloadPtr: number;
    private payloads: Buffer[];
    private maxFrameSize: number;
    private state: State;

    constructor(maxFrameSize = 8096) {
        this.state = State.Waiting;
        this.callbacks = [];
        this.payloads = [];
        this.maxFrameSize = 8096;
    }

    onFrame(cb: WSCallback) {
        this.callbacks.push(cb);
    }

    // TODO: Contiuation frames, spelt wrong
    send(sockfd: Socket, buf: Buffer, offset: number, length: number) {
        if (length > 2 ** 32) {
            throw new Error("You are dumb");
        }

        // TODO: Max frame size
        // while (ptr < length) {

            const header = headerPool.malloc();

            // TODO: isFinished should be based on continuation frame.
            // TODO: Frame type?
            const endIdx = constructFrameHeader(
                header, true, Opcodes.BinaryFrame, length, generateMask());

            // TODO: break this into multiple sends
            SocketUtils.send(sockfd, header, 0, endIdx);
            SocketUtils.send(sockfd, buf, offset, length, 0,
                () => headerPool.free(header));
        // } // end while
    }

    // TODO: Handle Continuation.
    processStreamData(packet: Buffer, offset: number, endIdx: number) {

        let ptrOffset = 0;
        if (this.state === State.Waiting) {

            // TODO: What if the packet is split even on the header.....
            this.state = State.ParsingHeader;
            ptrOffset = this.parseHeader(packet, offset, endIdx);
        }

        this.state = State.ParsingBody;
        ptrOffset = this.parseBody(packet, ptrOffset, endIdx);

        if (this.isFinished) {
            this.isFinished = false;
            this.state = State.Waiting;
            this.pushFrame();
        }
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
    private parseHeader(packet: Buffer, offset: number, endIdx: number): number {
        debugger;
        let ptr = offset;
        const byte1 = packet.readUInt8(ptr++);
        this.isFinished = (byte1 & 0x1) === 1;

        this.rsv1 = (byte1 & 0x2)
        this.rsv2 = (byte1 & 0x4)
        this.rsv3 = (byte1 & 0x8)
        this.opcode = (byte1 & 0xF0) >>> 4;

        const byte2 = packet.readUInt8(ptr++);

        this.isMasked = (byte2 & 0x1) === 1;
        this.payloadLength =  (byte2 & 0xFE) >>> 1;

        if (this.payloadLength === 126) {
            this.payloadLength = ntohs(packet, ptr);
            ptr += 2;
        }

        else if (this.payloadLength === 127) {
            throw new Error("We don't read your kind, packet");
        }

        if (this.isMasked) {
            this.mask = ntohl(packet, ptr);
            ptr += 4;
        }

        // TODO: How exactly should we do this?
        if (this.opcode === Opcodes.ContinuationFrame) {
            if (this.state === State.Waiting) {
                throw new Error("FIX ME, DO SOMETHING DIFFERENT");
            }
            this.payloads.push(this.payload);
        }

        this.payloadPtr = 0;
        this.payload = Buffer.allocUnsafe(this.payloadLength);

        return ptr;
    }

    private parseBody(packet: Buffer, offset: number, endIdx: number): number {

        // TODO: When the packet has multiple frames in it, i need to be able
        // to read what I need to read, not the whole thing, segfault incoming

        // TODO: is this ever needed?
        const remaining = this.payloadLength - this.payloadPtr;
        if (remaining < endIdx - offset) {
            throw new Error(`How is this possible?  The remaining data in the ws packet is more than I was expected - remaining ${remaining} - offset ${offset} - endIdx ${endIdx}`);
        }

        const readAmount =
            packet.copy(this.payload, this.payloadPtr, offset, endIdx);

        if (this.isMasked) {
            maskFn(this.payload, this.payloadPtr, readAmount, this.mask);
        }

        this.payloadPtr += readAmount;

        return readAmount;
    }

    // TODO: We make the assumption that anyone who wants to use that data
    // has to copy it, and not us.
    private pushFrame() {
        debugger;

        // TODO: Continuation Frame
        this.callbacks.forEach(cb => cb(this.payload));
    }
};

