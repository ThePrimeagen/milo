import Platform from "../../Platform";
import DataBuffer from "../../DataBuffer";
import {
    INetworkPipe,
    IDataBuffer,
} from '../../types';
import FrameConstructor from "../frame/frame-constructor";
import * as FrameUtils from "../frame/utils";
import SettingsFrame from "../frame/settings-frame";

// 1.  Everytime a new connection request is made to  the same server, we need
// to start a http2 stream with server and hand back a common
// NetworkPipe to the caller
//
// 2.  We need a good startup sequence manager.
//
// TODO: Happy case only implementation, please fixme.
const BUFFER_SIZE = 1024 * 16;

export enum SMState {
    WAITING_ON_SETTINGS = 0x1,
    WAITING_ON_SETTINGS_ACK = 0x2,
    OPEN = 0x4,
    CLOSED = 0x8,
};

type StateChangeCallback = (state: SMState) => void;

function zeroBit(value: number, bit: number) {
    return value & (0xFFFF ^ bit);
}

export default class StreamManager {
    private pipe: INetworkPipe;
    // TODO: REMOVE THIS AND USE THE H E DOUBLE HOCKEY STICKS READ BUFF FROM
    // THE PLATFORM
    private readBuffer: IDataBuffer;
    private nextId: number;
    private currentFrame: FrameConstructor;
    private state: number;
    private stateChanges: StateChangeCallback[];

    // TODO: Settings?
    constructor(pipe: INetworkPipe, settings = {}) {
        this.readBuffer = new DataBuffer(BUFFER_SIZE);
        this.pipe = pipe;
        this.nextId = 1;
        this.currentFrame = new FrameConstructor();
        this.state =
            SMState.WAITING_ON_SETTINGS_ACK | SMState.WAITING_ON_SETTINGS;

        this.stateChanges = [];

        pipe.on("data", () => {
            this.read();
        });

        pipe.once("close", () => {
            this._close();
        });

        // A preamble must be sent as the first thing. (which is the string
        // below).
        //
        // A settings frame must be sent after the preamble.  The stream
        // manager should only be created after the upgrade, or upon connection
        // to a http2 server.
        //
        // Source: https://tools.ietf.org/html/rfc7540#section-3.5
        const preamble = Platform.atoutf8("PRI * HTTP/2.0\r\n\r\nSM\r\n\r\n");
        const buf = new SettingsFrame().toFrameWriter(0).buffer;

        pipe.write(preamble, 0, preamble.byteLength);
        pipe.write(buf, 0, buf.byteLength);
    }

    onStateChange(cb: StateChangeCallback) {
        this.stateChanges.push(cb);
    }

    isInitialized(): boolean {
        return this.state === SMState.OPEN;
    }

    close() {
        this.pipe.close();
        this._close();
    }

    private _close() {
        this.state = SMState.CLOSED;
        this.notifyStateChange();
    }

    private notifyStateChange() {
        this.stateChanges.forEach(cb => cb(this.state));
    }

    private processFrame() {
        // Then we should expect a settings frame and an ACK frame for our
        // settings.
        //
        if (this.state !== SMState.OPEN) {
            if (!this.currentFrame.isSettingsFrame()) {
                // Throw new connection error....
                throw new Error("OHHH NO");
            }

            // 1. A settings frame
            // 2. A settings ACK frame.
            //
            // we got ourselves the settings frame
            if (FrameUtils.isAckFrame(this.currentFrame.header)) {
                this.state =
                    zeroBit(this.state, SMState.WAITING_ON_SETTINGS_ACK);
            }
            else {
                this.state = zeroBit(this.state, SMState.WAITING_ON_SETTINGS);
                const frame = SettingsFrame.ackFrame(0);
                this.pipe.write(frame.buffer, 0, frame.buffer.byteLength);
            }

            if (this.state === 0) {
                this.state = SMState.OPEN;
            }

            this.notifyStateChange();
        }
    }

    private read() {
        /*
          const bytesRead = this.pipe.read(this.readBuffer, 0, BUFFER_SIZE);
          let ptr = 0;

          do {
          const bytesProcessed =
          this.currentFrame.parse(this.readBuffer, 0, bytesRead);

          ptr += bytesProcessed;
          if (this.currentFrame.isFinished()) {
          this.processFrame();
          this.currentFrame.reset();
          }
          } while (ptr < bytesRead);
        */
    }
};

