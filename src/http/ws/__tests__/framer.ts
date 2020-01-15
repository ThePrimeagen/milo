import { NetworkPipe } from "../../types";
import nrdp, { utils as crossSystemUtils } from "../../../nrdp";
import WSFramer, {constructFrameHeader} from '../framer';
import {Opcodes} from '../types';
import maskFn from '../mask';
import * as NBO from 'network-byte-order';
import { uint8ArraySlice, uint8ArrayWriteString } from "../../../utils";

// @ts-ignore
const pipe = {
    write: jest.fn()
} as NetworkPipe;

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

// FOR YOU JELMEGA
const mask = 0xAABBAABB;
const maskBuf = new Uint8Array(4);
const maskView = new DataView(maskBuf.buffer);
maskView.setUint32(0, mask, true);

const countObj = {"count": 0};
const countObj2 = {"count": 2};

const countBuf = nrdp.atoutf8(JSON.stringify(countObj));
const countBuf2 = nrdp.atoutf8(JSON.stringify(countObj2));
const countLen = countBuf.byteLength;
const countLen2 = countBuf2.byteLength;

const maskedCountBuf = nrdp.atoutf8(JSON.stringify(countObj));
const maskedCountBuf2 = nrdp.atoutf8(JSON.stringify(countObj2));
maskFn(maskedCountBuf, 0, countLen, maskBuf);
maskFn(maskedCountBuf2, 0, countLen2, maskBuf);

describe("WS", function() {

    beforeEach(function() {
        // @ts-ignore
        pipe.write.mockClear();
    });

    it("can parse a single frame", function() {
        const buf = new Uint8Array(1000);

        const ptr = constructFrameHeader(
            buf, true, Opcodes.TextFrame, countLen, maskBuf);

        crossSystemUtils.copyUint8Array(countBuf, buf, ptr);
        maskFn(buf, 6, countLen, maskBuf);

        const ws = new WSFramer(pipe);

        ws.onFrame((contents: Uint8Array) => {
            expect(JSON.parse(nrdp.utf8toa(contents))).toEqual(countObj);
        });

        ws.processStreamData(buf, 0, ptr + countLen);
    });

    it("should send a packet through the packet send utils.", function() {
        // TODO: I think buf gets mutated with the mask... I think that is ok... maybe?
        const buf = new Uint8Array(1000);

        crossSystemUtils.copyUint8Array(countBuf, buf, 0);

        const ws = new WSFramer(pipe);

        ws.send(buf, 0, countLen);

        expect(pipe.write).toBeCalledTimes(1);

        const hBuf = new Uint8Array(6);
        const headerBuf = constructFrameHeader(
            hBuf, true, Opcodes.BinaryFrame, countLen, maskBuf);

        // expect(send).toHaveBeenNthCalledWith(1, 3, new Uint8Array(ArrayBuffer.concat(hBuf, buf.buffer.slice(0, countLen)));
    });

    function getBufferFromSend(sendMock: any, i: number): Uint8Array {
        return sendMock.mock.calls[i][0];
    }

    it("should send a large packet through send.", function() {
        // TODO: I think buf gets mutated with the mask... I think that is ok... maybe?
        const bufLength = 8;
        const buf = new Uint8Array(bufLength);
        for (let i = 0; i < buf.byteLength; ++i) {
            buf[i] = i % 255;
        }

        const ws = new WSFramer(pipe, 3);

        ws.send(buf, 0, bufLength);

        expect(pipe.write).toBeCalledTimes(3);

        const b0 = new Uint8Array(3);
        const b1 = new Uint8Array(3);
        const b2 = new Uint8Array(2);

        b0[0] = 0;
        b0[1] = 1;
        b0[2] = 2;

        b1[0] = 3;
        b1[1] = 4;
        b1[2] = 5;

        b2[0] = 6;
        b2[1] = 7;

        maskFn(b0, 0, 3, maskBuf);
        maskFn(b1, 0, 3, maskBuf);
        maskFn(b2, 0, 2, maskBuf);

        const sendBuf0: Uint8Array = getBufferFromSend(pipe.write, 0);
        expect(uint8ArraySlice(sendBuf0, 6)).toEqual(b0);

        const sendBuf1: Uint8Array = getBufferFromSend(pipe.write, 1);
        expect(uint8ArraySlice(sendBuf1, 6)).toEqual(b1);

        const sendBuf2: Uint8Array = getBufferFromSend(pipe.write, 2);
        expect(uint8ArraySlice(sendBuf2, 6)).toEqual(b2);
    });

    it("should parse the two frames from a single payload", function() {
        // TODO: I think buf gets mutated with the mask... I think that is ok... maybe?
        const buf = new Uint8Array(1000);

        let bufPtr = constructFrameHeader(
            buf, true, Opcodes.BinaryFrame, countLen, maskBuf);

        crossSystemUtils.copyUint8Array(countBuf, buf, bufPtr);
        bufPtr += crossSystemUtils.copyUint8Array(countBuf, buf, bufPtr);
        maskFn(buf, bufPtr - countLen, countLen, maskBuf);

        bufPtr += constructFrameHeader(
            uint8ArraySlice(buf, bufPtr), true, Opcodes.BinaryFrame, countLen, maskBuf);

        bufPtr += crossSystemUtils.copyUint8Array(countBuf2, buf, bufPtr);
        maskFn(buf, bufPtr - countLen2, countLen2, maskBuf);

        const ws = new WSFramer(pipe);

        let i = 0;
        ws.onFrame((contents) => {
            let obj = countObj;
            if (i === 1) {
                obj = countObj2;
            }
            expect(JSON.parse(nrdp.utf8toa(contents))).toEqual(obj);

            i++;
        });

        ws.processStreamData(buf, 0, bufPtr);
        expect(i).toEqual(2);
    });

    it("should parse one frames from two ws frames, one contiuation.", function(done) {
        // TODO: I think buf gets mutated with the mask... I think that is ok... maybe?
        const bufHello = new Uint8Array(20);
        const bufWorld = new Uint8Array(20);
        const helloWorldLen = 11;

        const part1Len = 5;
        const part2Len = 6;

        let ptrH = constructFrameHeader(
            bufHello, false, Opcodes.BinaryFrame, part1Len, maskBuf);

        uint8ArrayWriteString(uint8ArraySlice(bufHello, ptrH), "Hello");
        maskFn(bufHello, ptrH, part1Len, maskBuf);
        ptrH += part1Len;

        let ptrW = constructFrameHeader(
            bufWorld, true, Opcodes.ContinuationFrame, part2Len, maskBuf);

        uint8ArrayWriteString(uint8ArraySlice(bufWorld, ptrW), " World");
        maskFn(bufWorld, ptrW, part2Len, maskBuf);
        ptrW += part2Len;

        const ws = new WSFramer(pipe);

        let i = 0;
        ws.onFrame((contents) => {
            expect(nrdp.utf8toa(contents)).toEqual("Hello World");
            done();
        });

        ws.processStreamData(bufHello, 0, ptrH);
        ws.processStreamData(bufWorld, 0, ptrW);
    });

    it("should parse the one frame from 2 payload", function(done) {
        // TODO: I think buf gets mutated with the mask... I think that is ok... maybe?
        const buf = new Uint8Array(1000);
        let bufPtr = constructFrameHeader(
            buf, true, Opcodes.BinaryFrame, countLen, maskBuf);

        bufPtr += crossSystemUtils.copyUint8Array(countBuf, buf, bufPtr);
        maskFn(buf, bufPtr - countLen, countLen, maskBuf);
        const ws = new WSFramer(pipe);

        ws.onFrame((contents) => {
            expect(JSON.parse(nrdp.utf8toa(contents))).toEqual(countObj);
            done();
        });

        const breakPoint = 10;
        ws.processStreamData(uint8ArraySlice(buf, 0, breakPoint), 0, breakPoint);
        ws.processStreamData(
            uint8ArraySlice(buf, breakPoint, bufPtr), 0, bufPtr - breakPoint);
    });

    it("should parse the one frame from 2 payload, header broken", function(done) {
        // TODO: I think buf gets mutated with the mask... I think that is ok... maybe?
        const buf = new Uint8Array(1000);
        let bufPtr = constructFrameHeader(
            buf, true, Opcodes.BinaryFrame, countLen, maskBuf);

        bufPtr += crossSystemUtils.copyUint8Array(countBuf, buf, bufPtr);
        maskFn(buf, bufPtr - countLen, countLen, maskBuf);

        const ws = new WSFramer(pipe);

        ws.onFrame((contents) => {
            expect(JSON.parse(nrdp.utf8toa(contents))).toEqual(countObj);
            done();
        });

        const breakPoint = 2;
        ws.processStreamData(uint8ArraySlice(buf, 0, breakPoint), 0, breakPoint);
        ws.processStreamData(
            uint8ArraySlice(buf, breakPoint, bufPtr), 0, bufPtr - breakPoint);
    });

    it("should allow for interleaved control frames, close", function() {
        // TODO: I think buf gets mutated with the mask... I think that is ok... maybe?
        const bufHello = new Uint8Array(20);
        const helloWorldLen = 11;

        const part1Len = 5;

        let ptrH = constructFrameHeader(
            bufHello, false, Opcodes.BinaryFrame, part1Len, maskBuf);

        uint8ArrayWriteString(uint8ArraySlice(bufHello, ptrH), "Hello");
        maskFn(bufHello, ptrH, part1Len, maskBuf);
        ptrH += part1Len;

        const bufClose = new Uint8Array(20);

        let ptrC = constructFrameHeader(
            bufClose, true, Opcodes.CloseConnection, 2, maskBuf);

        NBO.htons(bufClose, ptrC, 42);
        maskFn(bufClose, ptrC, 2, maskBuf);
        ptrC += 2;

        const ws = new WSFramer(pipe);

        let i = 0;
        ws.onFrame(buffer => {
            expect(NBO.ntohs(buffer, 0)).toEqual(42);
        });

        ws.processStreamData(bufHello, 0, ptrH);
        ws.processStreamData(bufClose, 0, ptrC);
    });


});






