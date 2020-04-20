import DataBuffer from "../../DataBuffer";
import IDataBuffer from "../../IDataBuffer";
import NetworkPipe from "../../NetworkPipe";
import maskFn from "../mask";
import { FramerState, WSState, WSCallback, MAX_HEADER_SIZE, } from "./types";
import { Opcodes } from "../types";
import { createDefaultState } from "./state";
import { isHeaderParsable, parseHeader, constructFrameHeader, generateMask, } from "./header";
import assert from "../../utils/assert.macro";

let _id = -1;
export default class WSFramer {
    private id: number;
    private callbacks: WSCallback[];
    private maxFrameSize: number;
    private maxPacketSize: number;
    private msgState: WSState;
    private controlState: WSState;
    private pipe: NetworkPipe;
    private sendHeader: IDataBuffer;
    private header: IDataBuffer;
    private headerLen: number;

    private closed: boolean;

    constructor(pipe: NetworkPipe, maxFrameSize = 8096, maxPacketSize = 1024 * 1024 * 4) {
        this.id = ++_id;
        this.closed = false;

        this.sendHeader = new DataBuffer(MAX_HEADER_SIZE);
        this.header = new DataBuffer(MAX_HEADER_SIZE);
        this.headerLen = 0;

        this.callbacks = [];
        this.pipe = pipe;
        this.maxFrameSize = maxFrameSize;
        this.maxPacketSize = maxPacketSize;
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
        this.callbacks.push(cb);
    }

    // TODO: Contiuation frames, spelt wrong
    send(buf: IDataBuffer, offset: number,
         length: number, frameType: Opcodes = Opcodes.BinaryFrame) {


        if (length > 2 ** 32) {
            throw new Error("You are dumb");
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
            try {
                this.pipe.write(fullBuf, 0, fullBuf.byteLength);
            } catch (e) {
                /* tslint:disable-next-line */
                debugger;
            }

            ptrLength += ptr - ptrStart;

        } while (ptrLength < length);
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

    private tryFinishFrame(state: WSState | null) {
        if (state === null) {
            return;
        }

        const endOfPayload = state.payloadLength === state.payloadPtr;

        if (endOfPayload) {
            if (state.isFinished) {
                this.pushFrame(state);
            } else {
                state.payloads.push(state.payload);
            }

            this.reset(state);
        }
    }

    private reset(state: WSState): void {
        this.headerLen = 0;

        state.state = FramerState.ParsingHeader;
        state.isMasked = false;

        state.payloadLength = 0;
        state.payloadPtr = 0;

        if (state.isFinished) {
            state.payloads.length = 0;
        }
    }

    private getByteBetween(state: WSState, packet: IDataBuffer, offset: number, endIdx: number): number {
        return 0;
    }

    private parseBody(
        state: WSState, packet: IDataBuffer,
        offset: number, endIdx: number): number {

        // TODO: When the packet has multiple frames in it, i need to be able
        // to read what I need to read, not the whole thing, segfault incoming

        // TODO: is this ever needed?
        const remaining = state.payloadLength - state.payloadPtr;
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

        this.callbacks.forEach(cb => cb(buf, state));
    }
};

