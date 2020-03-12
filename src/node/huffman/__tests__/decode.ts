import DataBuffer from "../../DataBuffer";
import decode from "../decode";

describe("decode", () => {
    it("decode simple 1", () => {
        const one = new DataBuffer(1);
        one.setUInt8(0, 0b0000_1111);

        const expected = new DataBuffer(1);
        expected.setUInt8(0, 49);

        expect(decode(one).getUInt8(0)).toEqual(expected.getUInt8(0));
    });

    it("decode 1337", () => {
        /*
          '1' ( 49)  |00001                                         1  [ 5]
          '3' ( 51)  |011001                                       19  [ 6]
          '7' ( 55)  |011101                                       1d  [ 6]
        */
        const one337 = new DataBuffer(3);
        one337.setUInt8(0, 0b0000_1011);
        one337.setUInt8(1, 0b0010_1100);
        one337.setUInt8(2, 0b1011_1011);

        const expected = new DataBuffer(4);
        expected.setUInt8(0, 49);
        expected.setUInt8(1, 51);
        expected.setUInt8(2, 51);
        expected.setUInt8(3, 55);

        expect(decode(one337)).toEqual(expected);
    });

    it("decode https://www.example.com, rfc ", () => {
        // https://www.example.com
        // 9d29 ad17 1863 c78f 0b97 c8e9 ae82 ae43 d3
        const d = [
            0x9d,
            0x29,
            0xad,
            0x17,
            0x18,
            0x63,
            0xc7,
            0x8f,
            0x0b,
            0x97,
            0xc8,
            0xe9,
            0xae,
            0x82,
            0xae,
            0x43,
            0xd3,
        ];
        const www = new DataBuffer(17);
        d.forEach((x, i) => www.setUInt8(i, x));

        const expected = new DataBuffer(21);
        expect(decode(www).toString()).toEqual("https://www.example.com");
    });

    it("decode 307, from rfc C.6.2", () => {
        // 640e ff
        const three07 = new DataBuffer(3);

        // 64
        three07.setUInt8(0, 0b0110_0100);

        // 0e
        three07.setUInt8(1, 0b0000_1110);

        // FF
        three07.setUInt8(2, 0b1111_1111);

        const expected = new DataBuffer(3);
        expected.setUInt8(0, 51);
        expected.setUInt8(1, 48);
        expected.setUInt8(2, 55);

        expect(decode(three07)).toEqual(expected);
    });
});


