import Platform from '../../Platform';

import {
    FrameType,
    Flag
} from './types';

import * as FrameUtils from './utils';

const maxStreamIdentifier = 1 << 32 - 1;
const tmpBuffer = new Uint8Array(4);
const tmpView = new DataView(tmpBuffer.buffer);
const FRAME_HEADER_SIZE = 9;

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

class FrameWriter {
    private buffer: Uint8Array;
    private ptr: number;

    constructor(length: number, streamIdentifier: number, type: FrameType) {
        this.buffer = new Uint8Array(length + FRAME_HEADER_SIZE);
        this.ptr = FRAME_HEADER_SIZE;

        FrameUtils.setLength(this.buffer, length);
        FrameUtils.setType(this.buffer, type);
        FrameUtils.zeroFlags(this.buffer);
        FrameUtils.setStreamIdentifier(this.buffer, streamIdentifier);
    }

    write8(item: number) {
        this.buffer[this.ptr++] = item;
    }

    write32(item: number) {
        new DataView(this.buffer).setUint32(this.ptr++, item);
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

/*
+---------------+
 |Pad Length? (8)|
 +-+-------------+-----------------------------------------------+
 |E|                 Stream Dependency? (31)                     |
 +-+-------------+-----------------------------------------------+
 |  Weight? (8)  |
 +-+-------------+-----------------------------------------------+
 |                   Header Block Fragment (*)                 ...
 +---------------------------------------------------------------+
 |                           Padding (*)                       ...
 +---------------------------------------------------------------+
 */
export function writeHeaderData(
    frame: FrameWriter, data: Uint8Array,
    streamDependency?: number, isExclusive?: boolean, weight?: number) {

    if (streamDependency !== undefined) {
        frame.addFlag(Flag.PRIORITY);

        let sD = streamDependency | (isExclusive ? 1 << 32 : 0);
        frame.write32(sD);
        frame.write8(weight || 0);
    }

    frame.write(data);
}

// TODO: will we know a head of time the buffer size?
export function createHeaderFrame(
    bytesToSend: number, flags: number,
    streamIdentifier: number, padding: number = 0): FrameWriter {

    const frameWriter = new FrameWriter(bytesToSend, streamIdentifier, flags);
    frameWriter.addPadding(padding);

    return frameWriter;
}


