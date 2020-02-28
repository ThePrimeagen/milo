import DataBuffer from '../DataBuffer';
import { DataBuffer as IDataBuffer } from '../../types';
import { StaticTreeNode, staticTree, pluckBit } from './static';

const scratchBuffer = Buffer.alloc(50000);

export default function decode(buf: DataBuffer, offset: number = 0, length?: number): IDataBuffer {
    const buffer: Buffer = DataBuffer.toBuffer(buf.subarray(offset, length) as DataBuffer);

    let ptr = 0;
    let curr: StaticTreeNode = staticTree;
    let onlyOnes = 0x1;

    for (let i = 0; i < buffer.byteLength; ++i) {
        const value = buffer[i];
        let bitPtr = 8;

        do {
            const idx = pluckBit(value, --bitPtr);
            const nextCurr = curr[idx];

            if (typeof nextCurr === 'number') {
                scratchBuffer[ptr++] = nextCurr;
                curr = staticTree;
                onlyOnes = 0x1;
            }
            else if (nextCurr === undefined) {
                throw new Error("When decoding, you hit undefined, you hit connection error.");
            }
            else {
                onlyOnes = 0x1 & idx;
                curr = nextCurr;
            }

        } while (bitPtr);
    }

    if (onlyOnes === 0) {
        throw new Error("Decoding Problem.  The line ended with a 0 in it instead of a 1");
    }

    const outBuf = Buffer.alloc(ptr);
    scratchBuffer.copy(outBuf, 0, 0, ptr);

    return DataBuffer.fromBuffer(outBuf);
};

