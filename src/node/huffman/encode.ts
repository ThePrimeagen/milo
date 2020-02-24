import staticList from './static';

const scratchBuffer = Buffer.alloc(50000);

export default function encode(buffer: string | Buffer, offset: number = 0, length?: number): Buffer {
    let buf: Buffer;

    if (typeof buffer === 'string') {
        buf = Buffer.from(buffer);
    } else {
        buf = buffer;
    }

    let ptr = 0;
    let bitLen = 0;

    if (typeof length === "undefined")
        length = buf.byteLength;

    //    console.log("for ....", buf.byteLength, buf);
    for (let i = 0; i < buf.byteLength; ++i) {
        const staticData: [number, number] = staticList[buf[i]];

        const bits = staticData[0];
        let bitsRemaining = staticData[1];

        bitLen += bitsRemaining;

        //console.log("do { ", staticData);
        do {
            const idx = Math.floor(ptr / 8);
            const bitIdx = ptr % 8;
            const bitsToEncode = Math.min(8 - bitIdx, bitsRemaining);
            const valueToEncode = ((bits >> (bitsRemaining - bitsToEncode)) &
                                   ((2 ** bitsToEncode) - 1)) << ((8 - bitIdx) - bitsToEncode);

            scratchBuffer[idx] |= valueToEncode;

            bitsRemaining -= bitsToEncode;
            ptr += bitsToEncode;

            //console.log("Bits Remaining", bitsRemaining);
        } while (bitsRemaining > 0);
    }

    const oLength = Math.ceil(bitLen / 8);
    const outBuf = Buffer.alloc(oLength);
    scratchBuffer.copy(outBuf, 0, 0, oLength);

    const remainingOutBits = 8 - bitLen % 8;
    outBuf[oLength - 1] = outBuf[oLength - 1] | ((2 ** remainingOutBits) - 1);

    scratchBuffer.slice(0, oLength).fill(0);

    return outBuf;
};


