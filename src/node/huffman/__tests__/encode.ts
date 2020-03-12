import DataBuffer from "../../DataBuffer";
import encode from "../encode";

describe.only("encode", () => {
    it("encode simple 1", () => {
        const one = "1";
        const expected = Buffer.from([
            0b0000_1111,
        ]);

        expect(encode(one)).toEqual(expected);
    });

    it("encode 1337", () => {
        /*
          '1' ( 49)  |00001                                         1  [ 5]
          '3' ( 51)  |011001                                       19  [ 6]
          '7' ( 55)  |011101                                       1d  [ 6]
        */
        const one337 = "1337";
        const expected = Buffer.from([
            0b0000_1011,
            0b0010_1100,
            0b1011_1011,
        ]);

        expect(encode(one337)).toEqual(expected);
    });

    it("encode https://www.example.com, rfc ", () => {
        // https://www.example.com
        // 9d29 ad17 1863 c78f 0b97 c8e9 ae82 ae43 d3
        const d = Buffer.from([
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
        ]);

        expect(encode("https://www.example.com")).toEqual(d);
    });
});

