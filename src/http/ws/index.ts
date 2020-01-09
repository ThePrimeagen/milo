import bindings from '../../bindings';
import WSFramer, {WSState} from './framer';
import nrdp from "../../nrdp";

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
    private sockfd: number;
    private closeCBs: CloseCB[];
    private dataCBs: DataCB[];

    constructor(socketId: Socket, opts: WSOptions = defaultOptions) {
        this.frame = new WSFramer(opts.maxFrameSize);
        this.sockfd = socketId;
        this.closeCBs = [];
        this.dataCBs = [];

        this.frame.onFrame((buffer: Uint8Array, state: WSState) => {
            switch (state.opcode) {
                case Opcodes.CloseConnection:
                    this.closeCBs.forEach(cb => cb(buffer));

                    // attempt to close the sockfd.
                    bindings.close(this.sockfd);

                    break;

                case Opcodes.Ping:
                    this.frame.send(
                        this.sockfd, buffer, 0, buffer.length, Opcodes.Pong);
                    break;

                case Opcodes.BinaryFrame:
                case Opcodes.TextFrame:
                    this.dataCBs.forEach(cb => cb(state, buffer));
                    break;

                default:
                    debugger;
                    throw new Error("Can you handle this?");
            }
        });
    }

    pushData(buf: Uint8Array, offset: number, length: number) {
        this.frame.processStreamData(buf, offset, offset + length);
    }

    send(obj: Uint8Array | object | string, offset?: number, length?: number) {

        let bufOut = null;
        let o, l;
        let opcode = Opcodes.BinaryFrame;

        if (obj instanceof Uint8Array) {
            o = offset;
            l = length;
            opcode = Opcodes.BinaryFrame;
            bufOut = obj;
        }

        else if (typeof obj === 'object' || obj === null) {
            const str = JSON.stringify(obj);
            o = 0;
            l = str.length;
            bufOut = nrdp.atoutf8(str);

        }

        else {
            o = 0;
            l = obj.length;
            bufOut = nrdp.atoutf8(obj);
        }

        this.frame.send(this.sockfd, bufOut, o, l, opcode);
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
