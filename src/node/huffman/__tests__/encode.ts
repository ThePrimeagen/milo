import encode from '../encode';

describe("encode", function() {
    it("encode simple 1", function() {
        const one = "1";
        const expected = Buffer.from([
            0b0000_1111,
        ]);

        expect(encode(one)).toEqual(expected);
    });

    it("encode 1337", function() {
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
});

