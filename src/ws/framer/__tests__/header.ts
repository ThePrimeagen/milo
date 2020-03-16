import { DataBuffer } from "../../../DataBuffer";
import { Platform } from "../../../Platform";

import {
    constructFrameHeader,
    isHeaderParsable,
    parseHeader,
} from '../header';

import {
    Opcodes
} from '../../types';

import {
    WSState
} from '../types';

const mask = new DataBuffer(4);
mask.setUInt8(0, 0xA);
mask.setUInt8(1, 0xA);
mask.setUInt8(2, 0xB);
mask.setUInt8(3, 0xB);

/*
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

describe("header", function() {
    describe("constructFrameHeader", function() {
        it("125 byte, no mask, finished frame", function() {
            const len = 125;
            const buf = new DataBuffer(2);
            const isFinished = true;
            const opCode = Opcodes.BinaryFrame;

            const headerLen = constructFrameHeader(buf, isFinished, opCode, len);

            expect(headerLen).toEqual(2);
            expect(buf.getUInt8(0)).toEqual(0b1000_0010);
            expect(buf.getUInt8(1)).toEqual(len);
        });

        it("65355 byte, no mask, finished frame", function() {
            const len = 65355;
            const buf = new DataBuffer(4);
            const isFinished = true;
            const opCode = Opcodes.TextFrame;

            const headerLen = constructFrameHeader(buf, isFinished, opCode, len);
            expect(headerLen).toEqual(4);
            expect(buf.getUInt8(0)).toEqual(0b1000_0001);
            expect(buf.getUInt8(1)).toEqual(126);
            expect(buf.getUInt16BE(2)).toEqual(65355);
        });

        it("127 byte, no mask, finished frame, should throw.", function() {
            const len = 100000;
            const buf = new DataBuffer(4);
            const isFinished = true;
            const opCode = Opcodes.TextFrame;

            expect(() => constructFrameHeader(buf, isFinished, opCode, len)).toThrow();
        });

        it("125 byte, mask, finished frame", function() {
            const len = 125;
            const buf = new DataBuffer(6);
            const isFinished = true;
            const opCode = Opcodes.BinaryFrame;

            const headerLen = constructFrameHeader(buf, isFinished, opCode, len, mask);
            expect(headerLen).toEqual(6);
            expect(buf.getUInt8(0)).toEqual(0b1000_0010);
            expect(buf.getUInt8(1)).toEqual((0x1 << 7) | len);
        });

        it("65535 byte, mask, finished frame", function() {
            const len = 65355;
            const buf = new DataBuffer(8); // 2 + 2 + 4
            const isFinished = true;
            const opCode = Opcodes.BinaryFrame;

            const headerLen = constructFrameHeader(buf, isFinished, opCode, len, mask);
            expect(headerLen).toEqual(8);
            expect(buf.getUInt8(0)).toEqual(0b1000_0010);
            expect(buf.getUInt8(1)).toEqual((0x1 << 7) | 126);
            expect(buf.getUInt16BE(2)).toEqual(65355);
        });
    });

    describe("isHeaderParsable", function() {
        it("no mask, 125 len", function() {
            const len = 125;
            const buf = new DataBuffer(2);
            const isFinished = true;
            const opCode = Opcodes.BinaryFrame;

            constructFrameHeader(buf, isFinished, opCode, len);

            expect(isHeaderParsable(buf, 1)).toEqual(false);
            expect(isHeaderParsable(buf, 2)).toEqual(true);
        });

        it("mask, 125 len", function() {
            const len = 125;
            const buf = new DataBuffer(6);
            const isFinished = true;
            const opCode = Opcodes.BinaryFrame;

            constructFrameHeader(buf, isFinished, opCode, len, mask);

            for (let i = 0; i < 5; ++i) {
                expect(isHeaderParsable(buf, i)).toEqual(false);
            }

            expect(isHeaderParsable(buf, 6)).toEqual(true);
        });

        it("mask, 65355 len", function() {
            const len = 126;
            const buf = new DataBuffer(8);
            const isFinished = true;
            const opCode = Opcodes.BinaryFrame;

            constructFrameHeader(buf, isFinished, opCode, len, mask);

            for (let i = 0; i < 7; ++i) {
                expect(isHeaderParsable(buf, i)).toEqual(false);
            }

            expect(isHeaderParsable(buf, 8)).toEqual(true);
        });
    });

    describe("Parse header", function() {
        it("no mask, 125 length", function() {
            const len = 125;
            const buf = new DataBuffer(2);
            const isFinished = true;
            const opCode = Opcodes.BinaryFrame;
            const state = {} as WSState;
            constructFrameHeader(buf, isFinished, opCode, len);

            state.currentMask = new DataBuffer(4);

            const lenParsed = parseHeader(buf, state);
            expect(lenParsed).toEqual(2);
            expect(state.payload.byteLength).toEqual(len);
            expect(state.payloadLength).toEqual(len);
        });

        it("no mask, 65355 length", function() {
            const len = 65355;
            const buf = new DataBuffer(16);
            const isFinished = true;
            const opCode = Opcodes.BinaryFrame;
            const state = {} as WSState;
            constructFrameHeader(buf, isFinished, opCode, len);

            state.currentMask = new DataBuffer(4);

            const lenParsed = parseHeader(buf, state);

            expect(lenParsed).toEqual(4);
            expect(state.payload.byteLength).toEqual(len);
            expect(state.payloadLength).toEqual(len);
        });

        it("mask, 125 length", function() {
            const len = 125;
            const buf = new DataBuffer(6);
            const isFinished = true;
            const opCode = Opcodes.BinaryFrame;
            const state = {} as WSState;
            constructFrameHeader(buf, isFinished, opCode, len, mask);

            state.currentMask = new DataBuffer(4);

            const lenParsed = parseHeader(buf, state);
            expect(lenParsed).toEqual(6);
            expect(state.payload.byteLength).toEqual(len);
            expect(state.payloadLength).toEqual(len);
        });

        it("mask, 65355 length", function() {
            const len = 65355;
            const buf = new DataBuffer(8);
            const isFinished = true;
            const opCode = Opcodes.BinaryFrame;
            const state = {} as WSState;
            constructFrameHeader(buf, isFinished, opCode, len, mask);

            state.currentMask = new DataBuffer(4);

            const lenParsed = parseHeader(buf, state);

            expect(lenParsed).toEqual(8);
            expect(state.payload.byteLength).toEqual(len);
            expect(state.payloadLength).toEqual(len);
        });
    });
});


