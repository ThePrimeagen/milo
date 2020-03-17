import Platform from "../../../Platform";
import DataBuffer from "../../../DataBuffer";

import {
    constructFrameHeader,
    isHeaderParsable,
    generateMask,
    parseHeader
} from "../header";

const mask = 0xAABBAABB;
const maskBuf = new DataBuffer(4);
maskBuf.setUInt32BE(0, mask);
jest.doMock("../header", () => {
    return {
        constructFrameHeader,
        isHeaderParsable,
        parseHeader,
        generateMask: () => maskBuf
    }
});

import { INetworkPipe, IDataBuffer } from "../../../types";
import WSFramer from "../index";
import { Opcodes } from "../../types";
import maskFn from "../../mask";

// @ts-ignore
const pipe = {
    write: jest.fn()
} as INetworkPipe;

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

const countObj = { "count": 0 };
const countObj2 = { "count": 2 };

const countBuf = new DataBuffer(JSON.stringify(countObj));
const countBuf2 = new DataBuffer(JSON.stringify(countObj2));
const countLen = countBuf.byteLength;
const countLen2 = countBuf2.byteLength;

const maskedCountBuf = new DataBuffer(JSON.stringify(countObj));
const maskedCountBuf2 = new DataBuffer(JSON.stringify(countObj2));

maskFn(maskedCountBuf, 0, countLen, maskBuf);
maskFn(maskedCountBuf2, 0, countLen2, maskBuf);

function getBufferFromSend(sendMock: any, i: number): Uint8Array {
    return sendMock.mock.calls[i][0];
}

describe("WS", () => {
    beforeEach(() => {
        // @ts-ignore
        pipe.write.mockClear();
    });

    it("small payload masked", (done) => {
        const buf = new DataBuffer(7);
        const ptr = constructFrameHeader(
            buf, true, Opcodes.BinaryFrame, 1, maskBuf);

        buf.setUInt8(6, 255);
        maskFn(buf, 6, 1, maskBuf);

        const ws = new WSFramer(pipe);

        ws.onFrame((contents: IDataBuffer) => {
            expect(contents.getUInt8(0)).toEqual(255);
            done();
        });

        ws.processStreamData(buf, 0, 7);
    });

    it("small payload", (done) => {
        const buf = new DataBuffer(3);
        const ptr = constructFrameHeader(
            buf, true, Opcodes.BinaryFrame, 1);

        buf.setUInt8(2, 69);

        const ws = new WSFramer(pipe);

        ws.onFrame((contents: IDataBuffer) => {
            expect(contents.getUInt8(0)).toEqual(69);
            done();
        });

        ws.processStreamData(buf, 0, 3);
    });

    it("can parse a single frame", () => {
        const buf = new DataBuffer(1000);

        const ptr = constructFrameHeader(
            buf, true, Opcodes.TextFrame, countLen, maskBuf);

        buf.set(ptr, countBuf);
        maskFn(buf, 6, countLen, maskBuf);

        const ws = new WSFramer(pipe);

        ws.onFrame((contents: IDataBuffer) => {
            expect(JSON.parse(contents.toString())).toEqual(countObj);
        });

        ws.processStreamData(buf, 0, ptr + countLen);
    });

    it("should send a packet through the packet send utils.", () => {
        // TODO: I think buf gets mutated with the mask... I think that is ok... maybe?
        const buf = new DataBuffer(1000);

        buf.set(0, countBuf);

        const ws = new WSFramer(pipe);

        ws.send(buf, 0, countLen);

        expect(pipe.write).toBeCalledTimes(1);
    });

    it("should send a large packet through send.", () => {
        const bufLength = 8;
        const buf = new DataBuffer(bufLength);
        for (let i = 0; i < buf.byteLength; ++i) {
            buf.setUInt8(i, i % 255);
        }

        const ws = new WSFramer(pipe, 3);

        ws.send(buf, 0, bufLength);

        expect(pipe.write).toBeCalledTimes(3);

        const b0 = new DataBuffer(3);
        const b1 = new DataBuffer(3);
        const b2 = new DataBuffer(2);

        b0.setUInt8(0, 0);
        b0.setUInt8(1, 1);
        b0.setUInt8(2, 2);

        b1.setUInt8(0, 3);
        b1.setUInt8(1, 4);
        b1.setUInt8(2, 5);

        b2.setUInt8(0, 6);
        b2.setUInt8(1, 7);

        maskFn(b0, 0, 3, maskBuf);
        maskFn(b1, 0, 3, maskBuf);
        maskFn(b2, 0, 2, maskBuf);

        const sendBuf0: Uint8Array = getBufferFromSend(pipe.write, 0);
        expect(sendBuf0.slice(6)).toEqual(b0);

        const sendBuf1: Uint8Array = getBufferFromSend(pipe.write, 1);
        expect(sendBuf1.slice(6)).toEqual(b1);

        const sendBuf2: Uint8Array = getBufferFromSend(pipe.write, 2);
        expect(sendBuf2.slice(6)).toEqual(b2);
    });

    it("should parse the two frames from a single payload", () => {
        // TODO: I think buf gets mutated with the mask... I think that is ok... maybe?
        const buf = new DataBuffer(1000);

        // Create the first frame, binary, and mask it.
        let bufPtr = constructFrameHeader(
            buf, true, Opcodes.BinaryFrame, countLen, maskBuf);
        buf.set(bufPtr, countBuf);
        maskFn(buf, bufPtr, countLen, maskBuf);
        bufPtr += countLen;

        // Create the second frame, binary.
        bufPtr += constructFrameHeader(
            // TODO: subarray should not be needed.
            buf.subarray(bufPtr), true, Opcodes.BinaryFrame, countLen2, maskBuf);

        buf.set(bufPtr, countBuf2);
        maskFn(buf, bufPtr, countLen2, maskBuf);
        bufPtr += countLen2;

        // Create the framer and process the two frames.
        const ws = new WSFramer(pipe);

        let i = 0;
        ws.onFrame((contents) => {
            let obj = countObj;
            if (i === 1) {
                obj = countObj2;
            }

            expect(JSON.parse(Platform.utf8toa(contents))).toEqual(obj);

            i++;
        });

        ws.processStreamData(buf, 0, bufPtr);
        expect(i).toEqual(2);
    });

    it("should parse one frames from two ws frames, one contiuation.", (done) => {
        // TODO: I think buf gets mutated with the mask... I think that is ok... maybe?
        const bufHello = new DataBuffer(20);
        const bufWorld = new DataBuffer(20);
        const helloWorldLen = 11;

        const part1Len = 5;
        const part2Len = 6;

        let ptrH = constructFrameHeader(
            bufHello, false, Opcodes.BinaryFrame, part1Len, maskBuf);
        bufHello.set(ptrH, "Hello");
        maskFn(bufHello, ptrH, part1Len, maskBuf);
        ptrH += part1Len;

        let ptrW = constructFrameHeader(
            bufWorld, true, Opcodes.ContinuationFrame, part2Len, maskBuf);
        bufWorld.set(ptrW, " World");
        maskFn(bufWorld, ptrW, part2Len, maskBuf);
        ptrW += part2Len;

        const ws = new WSFramer(pipe);

        ws.onFrame((contents) => {
            expect(Platform.utf8toa(contents)).toEqual("Hello World");
            done();
        });

        ws.processStreamData(bufHello, 0, ptrH);
        ws.processStreamData(bufWorld, 0, ptrW);
    });


    it("should parse the one frame from 2 payload", (done) => {
        // TODO: I think buf gets mutated with the mask... I think that is ok... maybe?
        const buf = new DataBuffer(1000);
        let bufPtr = constructFrameHeader(
            buf, true, Opcodes.BinaryFrame, countLen, maskBuf);

        buf.set(bufPtr, countBuf);
        maskFn(buf, bufPtr, countLen, maskBuf);
        bufPtr += countLen;

        const ws = new WSFramer(pipe);

        ws.onFrame((contents) => {
            expect(JSON.parse(Platform.utf8toa(contents))).toEqual(countObj);
            done();
        });

        const breakPoint = 10;
        ws.processStreamData(buf, 0, breakPoint);
        ws.processStreamData(buf, breakPoint, bufPtr);
    });

    it("should parse the one frame from 2 payload, header broken", (done) => {
        // TODO: I think buf gets mutated with the mask... I think that is ok... maybe?
        const buf = new DataBuffer(1000);
        let bufPtr = constructFrameHeader(
            buf, true, Opcodes.BinaryFrame, countLen, maskBuf);

        buf.set(bufPtr, countBuf);
        maskFn(buf, bufPtr, countLen, maskBuf);
        bufPtr += countLen;

        const ws = new WSFramer(pipe);

        ws.onFrame((contents) => {
            expect(JSON.parse(Platform.utf8toa(contents))).toEqual(countObj);
            done();
        });

        const breakPoint = 2;
        ws.processStreamData(buf, 0, breakPoint);
        ws.processStreamData(buf, breakPoint, bufPtr);
    });

    it("should allow for interleaved control frames, close", () => {
        // TODO: I think buf gets mutated with the mask... I think that is ok... maybe?
        const bufHello = new DataBuffer(20);
        const helloWorldLen = 11;

        const part1Len = 5;

        let ptrH = constructFrameHeader(
            bufHello, false, Opcodes.BinaryFrame, part1Len, maskBuf);

        bufHello.set(ptrH, "Hello");
        maskFn(bufHello, ptrH, part1Len, maskBuf);
        ptrH += part1Len;

        const bufClose = new DataBuffer(20);

        let ptrC = constructFrameHeader(
            bufClose, true, Opcodes.CloseConnection, 2, maskBuf);

        bufClose.setUInt16BE(ptrC, 42);
        maskFn(bufClose, ptrC, 2, maskBuf);
        ptrC += 2;

        const ws = new WSFramer(pipe);

        ws.onFrame(buffer => {
            expect(buffer.getUInt16BE(0)).toEqual(42);
        });

        ws.processStreamData(bufHello, 0, ptrH);
        ws.processStreamData(bufClose, 0, ptrC);
    });
});

