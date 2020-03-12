import {
    FrameType,
    Flag
} from './types';

import * as FrameUtils from "./utils";
import FrameWriter from "./frame-writer";

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



