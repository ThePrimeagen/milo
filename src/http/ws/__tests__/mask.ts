import maskFn from '../mask';

// FOR YOU JELMEGA
// LittleEndian is going to be BBAABBAA
// 171IQ
const littleMask = 0xBB_AA_BB_AA;
const littleMaskBuf = new Uint8Array(4);
const littleView = new DataView(littleMaskBuf.buffer);
littleView.setUint32(littleMask, 0, true);

// 0b1011
// 0b0100
//   == 4
const unmaskedArr = [0xFF, 0x00, 0x00, 0xFF, 0x0F, 0xF0, 0x0F, 0xF0];
//                   0xAA  0xBB  0xAA  0xBB  0xAA  0xBB  0xAA  0xBB
const maskedArr =   [0x55, 0xBB, 0xAA, 0x44, 0xA5, 0x4B, 0xA5, 0x4B];

const arr = Uint8Array.from(unmaskedArr);
const buf = Buffer.from(arr);

function isLittleEndian() {
    const arrayBuffer = new ArrayBuffer(2);
    const uint8Array = new Uint8Array(arrayBuffer);
    const uint16array = new Uint16Array(arrayBuffer);

    uint8Array[0] = 0xAA; // set first byte
    uint8Array[1] = 0xBB; // set second byte

    return uint16array[0] === 0xBBAA;
}

function checkBuf(buf: Uint8Array, arr: number[], offset: number = 0) {
    for (let i = 0; i < arr.length; ++i) {
        expect(buf[offset + i]).toEqual(arr[i]);
    }
}

describe("WS", function() {
    it("should mask properly", function() {
        const b = new Uint8Array(1000);
        buf.copy(b, 0);

        const mask = littleMaskBuf;

        maskFn(b, 0, buf.length, mask);
        checkBuf(b, maskedArr);

        maskFn(b, 0, buf.length, mask);
        checkBuf(b, unmaskedArr);
    });
});
