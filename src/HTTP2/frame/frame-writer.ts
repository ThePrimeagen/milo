import {
    FrameType,
    Flag
} from './types';

import * as FrameUtils from './utils';

const tmpBuffer = new Uint8Array(4);
const tmpView = new DataView(tmpBuffer.buffer);

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
export const FRAME_HEADER_SIZE = 9;

export default class FrameWriter {
    public buffer: Uint8Array;
    private ptr: number;

    constructor(length: number, streamIdentifier: number, type: FrameType) {
        this.buffer = new Uint8Array(length + FRAME_HEADER_SIZE);
        this.ptr = FRAME_HEADER_SIZE;

        FrameUtils.setLength(this.buffer, length);
        FrameUtils.setType(this.buffer, type);
        FrameUtils.zeroFlags(this.buffer);
        debugger;
        FrameUtils.setStreamIdentifier(this.buffer, streamIdentifier);
    }

    write8(item: number) {
        this.buffer[this.ptr++] = item;
    }

    write16(item: number) {
        new DataView(this.buffer).setUint16(this.ptr, item);
        this.ptr += 2;
    }

    write32(item: number) {
        new DataView(this.buffer).setUint32(this.ptr, item);
        this.ptr += 4;
    }

    writeStr(item: string) {
        // TODO: later?
    }

    write(item: Uint8Array) {
        this.buffer.set(item, this.ptr);
        this.ptr += item.byteLength;
    }

    addFlag(flag: Flag) {
        FrameUtils.setFlags(this.buffer, flag);
    }

    hasPriorityFlag(): boolean {
        return !!(
            this.buffer[FrameUtils.FRAME_HEADER_FLAGS_OFFSET] & Flag.PRIORITY);
    }

    addPadding(padding: number) {
        if (padding === 0) {
            return;
        }

        if (this.ptr !== FRAME_HEADER_SIZE) {
            throw new Error("You must set the padding flag before setting any data on the payload.");
        }

        this.buffer[this.ptr++] = padding;

        FrameUtils.setFlags(this.buffer, Flag.PADDED);
        this.buffer.fill(0, this.buffer.byteLength - padding);
    }
}


