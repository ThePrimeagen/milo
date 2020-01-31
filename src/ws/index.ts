import WSFramer, {WSState} from './framer';
import Platform from "../#{target}/Platform";
import {
    NetworkPipe
} from '../types';

import {
    Opcodes,
    WSOptions
} from './types';

type CloseCB = (buf: Uint8Array) => void;

// TODO: Do we need frame type?
type DataCB = (state: WSState, buf: Uint8Array) => void;

const defaultOptions = {
    maxFrameSize: 8192
} as WSOptions;

const readBuffer = new ArrayBuffer(4096);
const readView = new Uint8Array(readBuffer);

export {
    WSState
};

export default class WS {
    private frame: WSFramer;
    private pipe: NetworkPipe;
    private closeCBs: CloseCB[];
    private dataCBs: DataCB[];

    constructor(pipe: NetworkPipe, opts: WSOptions = defaultOptions) {
        this.frame = new WSFramer(pipe, opts.maxFrameSize);
        this.pipe = pipe;
        this.closeCBs = [];
        this.dataCBs = [];

        // The pipe is ready to read.
        pipe.ondata = () => {
            let bytesRead;
            while (1) {

                bytesRead = pipe.read(readBuffer, 0, readBuffer.byteLength);
                if (bytesRead <=  0) {
                    break;
                }

                this.frame.processStreamData(readView, 0, bytesRead);
            }
        };

        this.frame.onFrame((buffer: Uint8Array, state: WSState) => {
            switch (state.opcode) {
                case Opcodes.CloseConnection:
                    this.closeCBs.forEach(cb => cb(buffer));

                    // attempt to close the sockfd.
                    this.pipe.close();

                    break;

                case Opcodes.Ping:
                    this.frame.send(buffer, 0, buffer.length, Opcodes.Pong);
                    break;

                case Opcodes.BinaryFrame:
                case Opcodes.TextFrame:
                    this.dataCBs.forEach(cb => cb(state, buffer));
                    break;

                default:
                    throw new Error("Can you handle this?");
            }
        });
    }

    send(obj: Uint8Array | object | string) {

        let bufOut = null;
        let len;
        let opcode = Opcodes.BinaryFrame;

        if (obj instanceof Uint8Array) {
            opcode = Opcodes.BinaryFrame;
            bufOut = obj;
        }

        else if (typeof obj === 'object' || obj === null) {
            const str = JSON.stringify(obj);
            bufOut = Platform.atoutf8(str);
            opcode = Opcodes.TextFrame;
        }

        else {
            bufOut = Platform.atoutf8(obj);
            opcode = Opcodes.TextFrame;
        }

        this.frame.send(bufOut, 0, bufOut.length, opcode);
    }

    onClose(cb: CloseCB) {
        this.closeCBs.push(cb);
    }

    onData(cb: DataCB) {
        this.dataCBs.push(cb);
    }

    private handleControlFrame(buffer: Uint8Array, state: WSState) {
        console.log("CONTROL FRAME", state);
    }
}
