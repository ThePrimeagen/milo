import WSFramer, {WSState} from './framer';
import nrdp from "../../nrdp";
import {
    NetworkPipe
} from '../types';

import {
    Opcodes,
    WSOptions
} from './types';

import {
    Socket
} from '../../types';

type CloseCB = (buf: Uint8Array) => void;

// TODO: Do we need frame type?
type DataCB = (state: WSState, buf: Uint8Array) => void;

const defaultOptions = {
    maxFrameSize: 8192
} as WSOptions;

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

    pushData(buf: Uint8Array | ArrayBuffer, offset: number = 0, length?: number) {

        let uBuf: Uint8Array = buf instanceof ArrayBuffer ?
            new Uint8Array(buf) : buf;

        if (length === undefined) {
            length = uBuf.byteLength;
        }

        this.frame.processStreamData(uBuf, offset, length);
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
            bufOut = nrdp.atoutf8(str);
            opcode = Opcodes.TextFrame;
        }

        else {
            bufOut = nrdp.atoutf8(obj);
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
