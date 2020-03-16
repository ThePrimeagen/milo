import maskFn from "../mask";
import { IDataBuffer } from "../../types";
import { DataBuffer } from "../../DataBuffer";

// FOR YOU JELMEGA
// LittleEndian is going to be BBAABBAA
// therefore, we write it in BigE.
// 171IQ
const mask = 0xAA_BB_AA_BB;
const maskBuf = new DataBuffer(4);

maskBuf.setUInt32BE(0, mask);

// 0b1011
// 0b0100
//   == 4
const unmaskedArr = [0xFF, 0x00, 0x00, 0xFF, 0x0F, 0xF0, 0x0F, 0xF0];
//                   0xAA  0xBB  0xAA  0xBB  0xAA  0xBB  0xAA  0xBB
const maskedArr = [0x55, 0xBB, 0xAA, 0x44, 0xA5, 0x4B, 0xA5, 0x4B];

const arr = Uint8Array.from(unmaskedArr);

function isLittleEndian() {
    const arrayBuffer = new ArrayBuffer(2);
    const uint8Array = new Uint8Array(arrayBuffer);
    const uint16array = new Uint16Array(arrayBuffer);

    uint8Array[0] = 0xAA; // set first byte
    uint8Array[1] = 0xBB; // set second byte

    return uint16array[0] === 0xBBAA;
}

function checkBuf(buf: IDataBuffer, a: number[], offset: number = 0) {
    for (let i = 0; i < a.length; ++i) {
        expect(buf.getUInt8(offset + i)).toEqual(a[i]);
    }
}

describe("WS", () => {
    it("should mask properly", () => {
        const b = new DataBuffer(1000);
        b.set(0, arr);

        maskFn(b, 0, arr.byteLength, maskBuf);
        checkBuf(b, maskedArr);

        maskFn(b, 0, arr.byteLength, maskBuf);
        checkBuf(b, unmaskedArr);
    });
});
