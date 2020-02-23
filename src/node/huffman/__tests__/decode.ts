import DataBuffer from '../../DataBuffer';
import decode from '../decode';

describe("decode", function() {
    it("decode simple 1", function() {
        const one = new DataBuffer(1);
        one.setUInt8(0, 0b0000_1111);

        const expected = new DataBuffer(1);
        expected.setUInt8(0, 49);

        expect(decode(one).getUInt8(0)).toEqual(expected.getUInt8(0));
    });

    it("decode 1337", function() {
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
});


