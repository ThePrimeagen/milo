import Platform from "../../Platform";
import DataBuffer from "../../DataBuffer";
import IDataBuffer from "../../IDataBuffer";
import NetworkPipe from "../../NetworkPipe";
import maskFn from "../mask";
import {
    FramerState,
    WSState,
    WSErrorCallback,
    WSCallback,
    MAX_HEADER_SIZE,
} from "./types";
import { Opcodes, stringifyOpcode } from "../types";
import { createDefaultState } from "./state";
import { isHeaderParsable, parseHeader, constructFrameHeader, generateMask, } from "./header";

export const FrameErrorString =
    "Control frames must completed within a single packet, received a control packet without a finish flag.";
export const ContinuationErrorString =
    "Received first frame as a continuation frame.  This is illegal.";
export const ShouldBeContinuationFrame =
    "Received a non continuation opcode on what should be a continuation frame.";

let _id = -1;
export default class WSFramer {
    private id: number;
    private onFrames: WSCallback[];
    private onFrameErrors: WSErrorCallback[];
    private maxFrameSize: number;
    private msgState: WSState;
    private controlState: WSState;
    private pipe: NetworkPipe;
    private sendHeader: IDataBuffer;
    private header: IDataBuffer;
    private headerLen: number;

    private closed: boolean;

    constructor(pipe: NetworkPipe, maxFrameSize = 8096) {
        this.id = ++_id;
        this.closed = false;

        this.sendHeader = new DataBuffer(MAX_HEADER_SIZE);
        this.header = new DataBuffer(MAX_HEADER_SIZE);
        this.headerLen = 0;

        this.onFrames = [];
        this.onFrameErrors = [];
        this.pipe = pipe;
        this.maxFrameSize = maxFrameSize;
        this.msgState = createDefaultState();
        this.controlState = createDefaultState(true);
    }

    getActiveState(): WSState | null {
        if (this.headerLen === 0) {
            return null;
        }

        return this.isControlFrame() ? this.controlState : this.msgState;
    }

    onFrame(cb: WSCallback) {
        this.onFrames.push(cb);
    }

    onFrameError(cb: WSErrorCallback) {
        this.onFrameErrors.push(cb);
    }

    // TODO: Contiuation frames, spelt wrong
    send(buf: IDataBuffer, offset: number,
         length: number, frameType: Opcodes = Opcodes.BinaryFrame) {


        if (length > 2 ** 32) {
            throw new Error("Unable to send packets that large.  It really is insane as a client.");
        }

        if (this.closed) {
            throw new Error("The frame has been closed and now you are attempting to send some data.  This is no longer possible.");
        }

        const endIdx = offset + length;
        let ptr = offset;
        let ptrLength = 0;
        let ft = frameType;

        const header = this.sendHeader;

        header.setUInt8(0, 0);

        // Closed is due to a frame error or an error being sent it.  To prevent
        // any follow up errors, we close
        do {
            const ptrStart = ptr;

            if (ptr > offset) {
                ft = Opcodes.ContinuationFrame;
            }

            const remainingSize = endIdx - ptr;
            const frameSize = Math.min(remainingSize, this.maxFrameSize);
            const mask = generateMask();
            const headerEnd = constructFrameHeader(
                header, remainingSize === frameSize, ft, frameSize, mask);

            const fullBuf = new DataBuffer(headerEnd + frameSize);

            fullBuf.set(0, header, 0, headerEnd);
            fullBuf.set(headerEnd, buf, ptr, frameSize);

            ptr += frameSize;

            maskFn(fullBuf, headerEnd, frameSize, mask);

            // TODO if fullBuf is just to slow to send upgrade the socket
            // library to handle the same reference to the buf with different
            // offsets.
            this.pipe.write(fullBuf, 0, fullBuf.byteLength);

            ptrLength += ptr - ptrStart;

        } while (ptrLength < length && !this.closed);
    }

    isControlFrame(): boolean {
        const opCode = (this.header.getUInt8(0) & 0x0F);

        return opCode === Opcodes.Ping ||
            opCode === Opcodes.Pong ||
            opCode === Opcodes.CloseConnection;
    }

    fillInHeaderBuffer(packet: IDataBuffer, offset: number, endIdx: number) {
        const ptr = this.headerLen;
        const writeLen =
            Math.min(endIdx - offset, this.header.byteLength - ptr);

        this.header.set(ptr, packet, offset, writeLen);
        this.headerLen += writeLen;
    }

    // TODO: Handle Continuation.
    processStreamData(packet: IDataBuffer, offset: number, endIdx: number) {
        let ptr = offset;
        let state = this.getActiveState();

        Platform.log("processStreamData", packet.slice(offset, endIdx - offset));

        while (ptr < endIdx && !this.closed) {
            if (state === null || state.state === FramerState.ParsingHeader) {
                const startingLen = this.headerLen;

                // Ensures that the packet has been filled in.
                this.fillInHeaderBuffer(packet, ptr, endIdx);

                // First check to see if there is enough to parse
                if (!isHeaderParsable(this.header, this.headerLen)) {
                    return false;
                }

                state = this.getActiveState();
                if (!state) {
                    throw new Error("State should always be defined at this point.");
                }

                const parsedAmount = parseHeader(this.header, state);
                ptr += parsedAmount - startingLen;
                state.state = FramerState.ParsingBody;

                // Re-evaluate the payload information.
                // Try to finish frame if there is an empty header frame
                // (close, ping, pong, no data);
                this.tryFinishFrame(state);
                continue;
            }

            const remainingPacket = state.payloadLength - state.payloadPtr;
            const subEndIdx = Math.min(ptr + remainingPacket, endIdx);

            ptr += this.parseBody(state, packet, ptr, subEndIdx);
            this.tryFinishFrame(state);

            // TODO: we about to go into contiuation mode, so get it baby!
        }
    }

    // Simple flag to tell the parser that no matter where they are at in the
    // parsing of spare data, it should be ignore at this point.  There are no
    // more frames to parse.
    //
    // This can happen when a rsv bit is set, bad opt code, etc etc.
    public close() {
        this.closed = true;
    }

    private debug(state: WSState): void {
        Platform.log("Debug Frame ----");
        if (this.isControlFrame() && !state.isFinished) {
            Platform.log("This frame will throw an error about non finished control frames.");
        }

        Platform.log(`State(${stringifyOpcode(state.currentOpcode)} / ${stringifyOpcode(state.opcode)}): ${state.payloadPtr} / ${state.payloadLength}`);
        Platform.log(`payloads(${state.payloads.length}): ${state.payloads.reduce((acc, p) => acc + p.byteLength, 0)} bytes`);
        Platform.log(`header: ${this.header.slice(0, this.headerLen)}`);
    }

    private tryFinishFrame(state: WSState | null) {
        if (state === null) {
            return;
        }

        const endOfPayload = state.payloadLength === state.payloadPtr;

        // The control frame that does not have a finish flag does break the
        // entire connection.
        if (this.isControlFrame() && !state.isFinished) {
            this.pushFramingError(new Error(FrameErrorString));
            return;
        }

        if (state.currentOpcode !== Opcodes.ContinuationFrame &&
            state.payloads.length > 0) {
            this.pushFramingError(new Error(ShouldBeContinuationFrame));
            return;
        }

        // First frame of the socket is a continuation frame, this is a failure.
        if (state.opcode === Opcodes.ContinuationFrame &&
           state.payloads.length === 0) {

            this.pushFramingError(new Error(ContinuationErrorString));
            return;
        }

        if (endOfPayload) {
            if (state.isFinished) {
                this.pushFrame(state);
                this.reset(state);
            } else {
                state.payloads.push(state.payload);
                this.softReset(state);
            }

        }
    }

    private softReset(state: WSState): void {
        this.headerLen = 0;

        state.state = FramerState.ParsingHeader;
        state.isMasked = false;

        state.payloadLength = 0;
        state.payloadPtr = 0;
    }

    private reset(state: WSState): void {
        this.softReset(state);
        state.opcode = Opcodes.ContinuationFrame;
        state.currentOpcode = Opcodes.ContinuationFrame;
        state.payloads.length = 0;
    }

    private parseBody(
        state: WSState, packet: IDataBuffer,
        offset: number, endIdx: number): number {

        // TODO: When the packet has multiple frames in it, i need to be able
        // to read what I need to read, not the whole thing, segfault incoming

        // TODO: is this ever needed?
        const sub = packet.subarray(offset, endIdx - offset);

        state.payload.set(state.payloadPtr, sub);
        const copyAmount = sub.byteLength;

        if (state.isMasked) {
            maskFn(state.payload, state.payloadPtr, copyAmount, state.currentMask);
        }

        state.payloadPtr += copyAmount;

        return copyAmount;
    }

    // TODO: We make the assumption that anyone who wants to use that data
    // has to copy it, and not us.
    //
    // TODO: Obviously there is no copying here.
    private pushFrame(state: WSState) {
        let buf = state.payload;

        if (state.payloads && state.payloads.length) {
            state.payloads.push(state.payload);

            // buf = Buffer.concat(state.payloads);
            buf = DataBuffer.concat(state.payloads);
        }

        this.onFrames.forEach(cb => cb(buf, state));
    }

    private pushFramingError(e: Error) {
        this.onFrameErrors.forEach(cb => cb(e));
    }
};

