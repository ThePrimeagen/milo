
jest.doMock('../../socket.utils');

import WSFrame, {Opcodes, constructFrameHeader} from '../index';
import maskFn from '../mask';
import * as NBO from 'network-byte-order';
import {
    send
} from '../../socket.utils';

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

const countObj = {"count": 0};
const countObj2 = {"count": 2};
const countBuf = Buffer.from(JSON.stringify(countObj));
const countBuf2 = Buffer.from(JSON.stringify(countObj2));
const countLen = countBuf.byteLength;
const countLen2 = countBuf2.byteLength;

const maskedCountBuf = Buffer.from(JSON.stringify(countObj));
const maskedCountBuf2 = Buffer.from(JSON.stringify(countObj2));
maskFn(maskedCountBuf, 0, countLen, mask);
maskFn(maskedCountBuf2, 0, countLen2, mask);

describe("WS", function() {

    beforeEach(function() {
        // @ts-ignore
        send.mockClear();
    });

    it("can parse a single frame", function() {
        const buf = Buffer.alloc(1000);

        const ptr = constructFrameHeader(
            buf, true, Opcodes.TextFrame, countLen, mask);

        countBuf.copy(buf, ptr);
        maskFn(buf, 6, countLen, mask);

        const ws = new WSFrame(3);

        ws.onFrame((contents) => {
            expect(JSON.parse(contents.toString())).toEqual(countObj);
        });

        ws.processStreamData(buf, 0, ptr + countLen);
    });

    it("should send a packet through the packet send utils.", function() {
        // TODO: I think buf gets mutated with the mask... I think that is ok... maybe?
        const buf = Buffer.alloc(1000);
        countBuf.copy(buf, 0);

        const ws = new WSFrame(5);

        ws.send(3, buf, 0, countLen);

        expect(send).toBeCalledTimes(1);

        const hBuf = Buffer.alloc(6);
        const headerBuf = constructFrameHeader(
            hBuf, true, Opcodes.BinaryFrame, countLen, mask);

        expect(send).toHaveBeenNthCalledWith(1, 3, Buffer.concat([hBuf, buf.slice(0, countLen)]));
    });

    function getBufferFromSend(sendMock: any, i: number): Buffer {
        return sendMock.mock.calls[i][1];
    }

    it("should send a large packet through send.", function() {
        // TODO: I think buf gets mutated with the mask... I think that is ok... maybe?
        const bufLength = 8;
        const buf = Buffer.alloc(bufLength);
        for (let i = 0; i < buf.byteLength; ++i) {
            buf[i] = i % 255;
        }

        const ws = new WSFrame(3, 3);

        debugger
        ws.send(3, buf, 0, bufLength);

        expect(send).toBeCalledTimes(3);

        const b0 = Buffer.alloc(3);
        const b1 = Buffer.alloc(3);
        const b2 = Buffer.alloc(2);

        b0[0] = 0;
        b0[1] = 1;
        b0[2] = 2;

        b1[0] = 3;
        b1[1] = 4;
        b1[2] = 5;

        b2[0] = 6;
        b2[1] = 7;

        const sendBuf0: Buffer = getBufferFromSend(send, 0);
        expect(sendBuf0.slice(6)).toEqual(b0);

        const sendBuf1: Buffer = getBufferFromSend(send, 1);
        expect(sendBuf1.slice(6)).toEqual(b1);

        const sendBuf2: Buffer = getBufferFromSend(send, 2);
        expect(sendBuf2.slice(6)).toEqual(b2);
    });

    it("should parse the two frames from a single payload", function() {
        // TODO: I think buf gets mutated with the mask... I think that is ok... maybe?
        const buf = Buffer.alloc(1000);

        let bufPtr = constructFrameHeader(
            buf, true, Opcodes.BinaryFrame, countLen, mask);

        bufPtr += countBuf.copy(buf, bufPtr);
        maskFn(buf, bufPtr - countLen, countLen, mask);
        bufPtr += constructFrameHeader(
            buf.slice(bufPtr), true, Opcodes.BinaryFrame, countLen, mask);
        bufPtr += countBuf2.copy(buf, bufPtr);
        maskFn(buf, bufPtr - countLen2, countLen2, mask);

        const ws = new WSFrame(3);

        let i = 0;
        ws.onFrame((contents) => {
            let obj = countObj;
            if (i === 1) {
                obj = countObj2;
            }
            expect(JSON.parse(contents.toString())).toEqual(obj);

            i++;
        });

        ws.processStreamData(buf, 0, bufPtr);
        expect(i).toEqual(2);
    });

    it("should parse one frames from two ws frames, one contiuation.", function(done) {
        // TODO: I think buf gets mutated with the mask... I think that is ok... maybe?
        const bufHello = Buffer.alloc(20);
        const bufWorld = Buffer.alloc(20);
        const helloWorldLen = 11;

        const part1Len = 5;
        const part2Len = 6;

        let ptrH = constructFrameHeader(
            bufHello, false, Opcodes.BinaryFrame, part1Len, mask);

        bufHello.slice(ptrH).write("Hello");
        maskFn(bufHello, ptrH, part1Len, mask);
        ptrH += part1Len;

        let ptrW = constructFrameHeader(
            bufWorld, true, Opcodes.ContinuationFrame, part2Len, mask);

        bufWorld.slice(ptrW).write(" World");
        maskFn(bufWorld, ptrW, part2Len, mask);
        ptrW += part2Len;

        const ws = new WSFrame(3);

        let i = 0;
        ws.onFrame((contents) => {
            expect(contents.toString()).toEqual("Hello World");
            done();
        });

        ws.processStreamData(bufHello, 0, ptrH);
        ws.processStreamData(bufWorld, 0, ptrW);
    });

    it("should parse the one frame from 2 payload", function(done) {
        // TODO: I think buf gets mutated with the mask... I think that is ok... maybe?
        const buf = Buffer.alloc(1000);
        let bufPtr = constructFrameHeader(
            buf, true, Opcodes.BinaryFrame, countLen, mask);

        bufPtr += countBuf.copy(buf, bufPtr);
        maskFn(buf, bufPtr - countLen, countLen, mask);
        const ws = new WSFrame(3);

        ws.onFrame((contents) => {
            expect(JSON.parse(contents.toString())).toEqual(countObj);
            done();
        });

        const breakPoint = 10;
        ws.processStreamData(buf.slice(0, breakPoint), 0, breakPoint);
        ws.processStreamData(
            buf.slice(breakPoint, bufPtr), 0, bufPtr - breakPoint);
    });

    it("should parse the one frame from 2 payload, header broken", function(done) {
        // TODO: I think buf gets mutated with the mask... I think that is ok... maybe?
        const buf = Buffer.alloc(1000);
        let bufPtr = constructFrameHeader(
            buf, true, Opcodes.BinaryFrame, countLen, mask);

        bufPtr += countBuf.copy(buf, bufPtr);
        maskFn(buf, bufPtr - countLen, countLen, mask);

        const ws = new WSFrame(3);

        ws.onFrame((contents) => {
            expect(JSON.parse(contents.toString())).toEqual(countObj);
            done();
        });

        const breakPoint = 2;
        ws.processStreamData(buf.slice(0, breakPoint), 0, breakPoint);
        ws.processStreamData(
            buf.slice(breakPoint, bufPtr), 0, bufPtr - breakPoint);
    });

    it("should allow for interleaved control frames, close", function() {
        // TODO: I think buf gets mutated with the mask... I think that is ok... maybe?
        const bufHello = Buffer.alloc(20);
        const helloWorldLen = 11;

        const part1Len = 5;

        let ptrH = constructFrameHeader(
            bufHello, false, Opcodes.BinaryFrame, part1Len, mask);

        bufHello.slice(ptrH).write("Hello");
        maskFn(bufHello, ptrH, part1Len, mask);
        ptrH += part1Len;

        const bufClose = Buffer.alloc(20);

        let ptrC = constructFrameHeader(
            bufClose, true, Opcodes.CloseConnection, 2, mask);

        NBO.htons(bufClose, ptrC, 42);
        maskFn(bufClose, ptrC, 2, mask);
        ptrC += 2;

        const ws = new WSFrame(3);

        let i = 0;
        ws.onFrame((contents) => {
            expect(NBO.ntohs(contents, 0)).toEqual(42);
        });

        ws.processStreamData(bufHello, 0, ptrH);
        ws.processStreamData(bufClose, 0, ptrC);
    });


});






