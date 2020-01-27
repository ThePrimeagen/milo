import {
    FrameType,
} from '../types';

import FrameWriter, { FRAME_HEADER_SIZE } from '../frame-writer';

function toArray(...args: number[]) {
    return args;
}

    /* FRAME HEADER
 +-----------------------------------------------+
 |                 Length (24)                   |
 +---------------+---------------+---------------+
 |   Type (8)    |   Flags (8)   |
 +-+-------------+---------------+-------------------------------+
 |R|                 Stream Identifier (31)                      |
 +=+=============================================================+
 |                   Frame Payload (0...)                      ...
 +---------------------------------------------------------------+
     */
/* DATA FRAME PAYLOAD PADDING PADDED
 +---------------+
 |Pad Length? (8)|
 +---------------+-----------------------------------------------+
 |                            Data (*)                         ...
 +---------------------------------------------------------------+
 |                           Padding (*)                       ...
 +---------------------------------------------------------------+
 */
describe('FrameWriter', function() {
    it('should initialize and correctly setup the frame.', function() {
        debugger;
        const frame = new FrameWriter(70000, 3, FrameType.HEADERS);
        const header = frame.buffer.slice(0, FRAME_HEADER_SIZE);

        const length = header.slice(0, 3);
        const lengthExpBuf = Buffer.alloc(4);
        new DataView(lengthExpBuf.buffer).setUint32(0, 70000);

        expect(frame.buffer.byteLength).toEqual(70000 + FRAME_HEADER_SIZE);

        expect(toArray(...length)).toEqual(toArray(...lengthExpBuf.slice(1)));
    });
});


