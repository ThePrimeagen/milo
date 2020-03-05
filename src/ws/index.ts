import WSFramer, {WSState} from './framer';
import Platform from "../#{target}/Platform";
import DataBuffer from "../#{target}/DataBuffer";

import {
    NetworkPipe,
    IDataBuffer,
} from '../types';

import {
    Opcodes,
    WSOptions
} from './types';

const defaultOptions = {
    maxFrameSize: 8192,
    poolInternals: false,
    noCopySentBuffers: false,
} as WSOptions;

const readView = new DataBuffer(16 * 1024);

export {
    WSState
};

export type CallbackNames = "message" | "close" | "open" | "error";
export type CallbackMap = {
    message: ((buf: IDataBuffer) => void)[];
    close: ((code: number, buf: IDataBuffer) => void)[];
    open: (() => void)[];
    error: ((error: Error) => void)[];
};

export default class WS {
    private frame: WSFramer;
    private pipe: NetworkPipe;
    private callbacks: CallbackMap;

    public onmessage?: (buf: IDataBuffer) => void;

    constructor(pipe: NetworkPipe, opts: WSOptions = defaultOptions) {
        this.callbacks = {
            message: [],
            close: [],
            open: [],
            error: [],
        };

        this.frame = new WSFramer(pipe, opts.maxFrameSize);
        this.pipe = pipe;

        // The pipe is ready to read.
        pipe.ondata = () => {
            let bytesRead;
            while (1) {

                bytesRead = pipe.read(readView, 0, readView.byteLength);
                if (bytesRead <=  0) {
                    break;
                }

                this.frame.processStreamData(readView, 0, bytesRead);
            }
        };

        this.frame.onFrame((buffer: IDataBuffer, state: WSState) => {
            switch (state.opcode) {
                case Opcodes.CloseConnection:
                    const code = buffer.getUInt16BE(0);
                    const restOfData = buffer.subarray(2);

                    this.callbacks.close.forEach(cb => {
                        cb(code, restOfData);
                    });

                    // attempt to close the sockfd.
                    this.pipe.close();

                    break;

                case Opcodes.Ping:
                    this.frame.send(buffer, 0, buffer.byteLength, Opcodes.Pong);
                    break;

                case Opcodes.BinaryFrame:
                case Opcodes.TextFrame:
                    if (this.onmessage) {
                        this.onmessage(buffer);
                    }
                    break;

                default:
                    throw new Error("Can you handle this?");
            }
        });
    }

    // Don't know how to do this well...
    on(callbackName: CallbackNames, callback: (...args: any[]) => void) {
        this.callbacks[callbackName].push(callback);
    }

    sendJSON(obj: object) {
        this.send(JSON.stringify(obj));
    }

    send(obj: IDataBuffer | Uint8Array | string) {

        let bufOut: IDataBuffer;
        let len;
        let opcode = Opcodes.BinaryFrame;

        if (obj instanceof Uint8Array) {
            bufOut = new DataBuffer(obj);
            opcode = Opcodes.BinaryFrame;
        }

        else if (obj instanceof DataBuffer) {
            bufOut = obj;
            opcode = Opcodes.BinaryFrame;
        }

        else {
            bufOut = new DataBuffer(obj);
            opcode = Opcodes.TextFrame;
        }

        this.frame.send(bufOut, 0, bufOut.byteLength, opcode);
    }

    private handleControlFrame(buffer: Uint8Array, state: WSState) {
        console.log("CONTROL FRAME", state);
    }
}
