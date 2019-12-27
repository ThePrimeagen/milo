import bindings from '../../bindings';
import WSFramer, {WSState} from './framer';

import {
    Opcodes,
    WSOptions
} from './types';

import {
    Socket
} from '../../types';

type CloseCB = (buf: Buffer) => void;

// TODO: Do we need frame type?
type DataCB = (state: WSState, buf: Buffer) => void;

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

        this.frame.onFrame((buffer: Buffer, state: WSState) => {
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
                    throw new Error("Can you handle this?");
            }
        });
    }

    pushData(buf: Buffer, offset: number, length: number) {
        this.frame.processStreamData(buf, offset, offset + length);
    }

    send(obj: Buffer | object | string, offset?: number, length?: number) {

        let bufOut = null;
        let o, l;
        let opcode = Opcodes.BinaryFrame;

        if (obj instanceof Buffer) {
            o = offset;
            l = length;
            opcode = Opcodes.BinaryFrame;
            bufOut = obj;
        }

        else if (typeof obj === 'object' || obj === null) {
            const str = JSON.stringify(obj);
            o = 0;
            l = str.length;
            bufOut = Buffer.allocUnsafe(l);
            bufOut.write(str);

        }

        else {
            o = 0;
            l = obj.length;
            bufOut = Buffer.allocUnsafe(obj.length);
            bufOut.write(obj);
        }

        this.frame.send(this.sockfd, bufOut, o, l, opcode);
    }

    onClose(cb: CloseCB) {
        this.closeCBs.push(cb);
    }

    onData(cb: DataCB) {
        this.dataCBs.push(cb);
    }

    private handleControlFrame(buffer: Buffer, state: WSState) {
        console.log("CONTROL FRAME", state);
    }
}
