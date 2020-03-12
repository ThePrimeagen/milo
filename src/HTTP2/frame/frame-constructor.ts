import {
    FrameType,
    Settings,
} from './types';

import * as FrameUtils from "./utils";

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

export const WaitingOnHeaders = State.WaitingOnHeadersLength | State.WaitingOnHeadersType |
    State.WaitingOnHeadersFlags | State.WaitingOnHeadersStreamIden;

const EMPTY_BUFFER = new Uint8Array(1);

/* #region framecontr */
export default class FrameConstructor {

    public len: number;
    public header: Uint8Array;

    private buffer: Uint8Array;
    private state: number;
    private headerPtr: number;
    private ptr: number;

    constructor() {
        this.len = this.headerPtr = this.state = this.ptr = 0;
        this.header = new Uint8Array(FrameUtils.FRAME_HEADER_SIZE);
        this.buffer = EMPTY_BUFFER;
        this.reset();
    }

    isFinished(): boolean {
        return this.state === State.Finished;
    }

    /**
     * parses the data and returns the amount of bytes that it parsed.
     */
    parse(buffer: Uint8Array, offset: number = 0, length?: number): number {
        if (length === undefined) {
            length = buffer.byteLength;
        }

        let ptr = offset;
        if (this.state < State.ParsingData) {
            ptr += this.parseHeader(buffer, offset, length);
        }

        if (this.state === State.ParsingData) {
            if (this.buffer === EMPTY_BUFFER) {
                this.buffer = new Uint8Array(this.len);
            }

            const byteCount =
                Math.min(length - (ptr - offset), this.len - this.ptr);

            this.buffer.set(buffer.subarray(ptr, ptr + byteCount));
            this.ptr += byteCount;
            ptr += byteCount;

            if (this.ptr === this.len) {
                this.state = State.Finished;
            }
        }

        return ptr - offset;
    }

    /**
     * Gets the length of the frame.  If the frame hasn't finished parsing the
     * header, it will return a length of -1.
     */
    public getLength(): number {
        if (this.state < State.ParsingData) {
            return -1;
        }

        return this.len;
    }

    public isSettingsFrame(): boolean {
        if (this.state < State.ParsingData) {
            return false;
        }

        return FrameUtils.getType(this.header) === FrameType.SETTINGS;
    }

    public copyBuffer(): Uint8Array {
        if (this.state !== State.Finished) {
            throw new Error("cannot copy data without the state being in Finished.");
        }

        return this.buffer.slice();
    }

    public reset() {
        this.state = WaitingOnHeaders;
        this.buffer = EMPTY_BUFFER;
        this.header.fill(0);
        this.headerPtr = 0;
        this.ptr = 0;
        this.len = 0;
    }

    private parseHeader(buffer: Uint8Array, offset: number, length: number): number {
        const remainingBytes = FrameUtils.FRAME_HEADER_SIZE - this.headerPtr;
        const bytesToRead = Math.min(remainingBytes, length);

        this.header.
            set(buffer.subarray(offset, offset + bytesToRead), this.headerPtr);
        this.headerPtr += bytesToRead;

        if (this.headerPtr === FrameUtils.FRAME_HEADER_SIZE) {
            this.len = FrameUtils.getLength(this.header, 0);
            this.state = State.ParsingData;
        }

        return bytesToRead;
    }

    private parseBody(buffer: Uint8Array, offset: number, length: number): number {
        return 0;
    }
};
/* #region framecontr */




