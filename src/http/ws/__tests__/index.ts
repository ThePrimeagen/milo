
jest.doMock('../../socket.utils');

import WSFrame, {Opcodes, constructFrameHeader} from '../index';
import maskFn from '../mask';
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
const countBuf = Buffer.from(JSON.stringify(countObj));
const maskedCountBuf = Buffer.from(JSON.stringify(countObj));
maskFn(maskedCountBuf, 0, 12, mask);

describe("WS", function() {

    beforeEach(function() {
        // @ts-ignore
        send.mockClear();
    });

    it("can parse a single frame", function() {
        const buf = Buffer.alloc(1000);

        const ptr = constructFrameHeader(
            buf, true, Opcodes.TextFrame, countBuf.byteLength, mask);

        countBuf.copy(buf, ptr);
        maskFn(buf, 6, countBuf.length, mask);

        const ws = new WSFrame();

        ws.onFrame((contents) => {
            expect(JSON.parse(contents.toString())).toEqual(countObj);
        });

        ws.processStreamData(buf, 0, ptr + countBuf.byteLength);
    });

    it("should send a packet through the packet send utils.", function() {
        // TODO: I think buf gets mutated with the mask... I think that is ok... maybe?
        const buf = Buffer.alloc(1000);
        countBuf.copy(buf, 0);

        const ws = new WSFrame();

        ws.send(3, buf, 0, 12);

        expect(send).toBeCalledTimes(2);

        const hBuf = Buffer.alloc(6);
        const headerBuf = constructFrameHeader(
            hBuf, true, Opcodes.BinaryFrame, 12, mask);

        expect(send).toHaveBeenNthCalledWith(1, 3, hBuf, 0, 6)// 6 byte header

        // @ts-ignore
        // Need to ignore the anonymous function at the end of the call.
        const call2 = send.mock.calls[1].slice(0, 5);
        expect(call2).toEqual([3, buf, 0, 12, 0])// 6 byte header
    });
});





