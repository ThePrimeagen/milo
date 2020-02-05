import {
    FrameType,
} from './types';

import {
    FRAME_HEADER_SIZE
} from './utils';

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

enum State {
    WaitingOnHeadersLength = 0x1,
    WaitingOnHeadersType = 0x2,
    WaitingOnHeadersFlags = 0x4,
    WaitingOnHeadersStreamIden = 0x8,
    ParsingData = 0x10,
    Finished = 0x20,
};

export default class FrameConstructor {

    private buffer?: Uint8Array;
    private state: number;
    private ptr: number;

    constructor() {
        this.state = this.ptr = 0;
        this.reset();
    }

    addData(buffer: Uint8Array, offset: number, length?: number) {
        if (length === undefined) {
            length = buffer.byteLength;
        }

        if (this.state < State.ParsingData) {
            this.parseHeader(buffer, offset, length);
        }
    }

    public reset() {
        this.state = State.WaitingOnHeadersLength | State.WaitingOnHeadersType |
            State.WaitingOnHeadersFlags | State.WaitingOnHeadersStreamIden;
        this.buffer = undefined;
        this.ptr = 0;
    }

    private parseHeader(buffer: Uint8Array, offset: number, length: number): number {

        if (this.state & State.WaitingOnHeadersLength) {
            if (this.ptr + length < 3) {
                this.buffer = new Uint8Array(FRAME_HEADER_SIZE);
                this.buffer.set(buffer.subarray(offset, length), 0);
                this.ptr = length;
                return length;
            }
        }

        return 0;
    }

    private parseBody(buffer: Uint8Array, offset: number, length: number): number {
        return 0;
    }
};


