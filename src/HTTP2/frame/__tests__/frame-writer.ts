import {
    FrameType,
    Flag,
} from '../types';

import FrameWriter from "../frame-writer";
import { FRAME_HEADER_FLAGS_OFFSET, FRAME_HEADER_SIZE } from "../utils";

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
        const frame = new FrameWriter(70000, 3, FrameType.HEADERS);
        const header = frame.buffer.slice(0, FRAME_HEADER_SIZE);
        const headerView = new DataView(header.buffer);

        const length = header.slice(0, 3);
        const lengthExpBuf = Buffer.alloc(4);
        new DataView(lengthExpBuf.buffer).setUint32(0, 70000);
        expect(frame.buffer.byteLength).toEqual(70000 + FRAME_HEADER_SIZE);

        // TODO: How to fix this error?
        // @ts-ignore
        expect(toArray(...length)).toEqual(toArray(...lengthExpBuf.slice(1)));
        expect(header[3]).toEqual(FrameType.HEADERS);
        expect(header[FRAME_HEADER_FLAGS_OFFSET]).toEqual(0);
        expect(header[5] & (1 << 32)).toEqual(0);
        expect(headerView.getUint32(5)).toEqual(3);
    });

    it('should be able to set flags', function() {
        const frame = new FrameWriter(70000, 3, FrameType.HEADERS);
        const header = frame.buffer.subarray(0, FRAME_HEADER_SIZE);
        const headerView = new DataView(header.buffer);

        expect(header[FRAME_HEADER_FLAGS_OFFSET]).toEqual(0);

        frame.addFlag(Flag.END_STREAM);
        expect(header[FRAME_HEADER_FLAGS_OFFSET]).toEqual(Flag.END_STREAM);

        frame.addFlag(Flag.PRIORITY);
        expect(header[FRAME_HEADER_FLAGS_OFFSET]).toEqual(Flag.END_STREAM | Flag.PRIORITY);
    });
});


