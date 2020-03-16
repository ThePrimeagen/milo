import { Platform } from "../Platform";
import { DataBuffer } from "../DataBuffer";
import WSFramer from './framer';
import { WSState } from './framer/types';
import { upgrade } from "./upgrade";

import {
    INetworkPipe,
    IDataBuffer,
} from '../types';

import {
    UrlObject,
    Opcodes,
    WSOptions,
    CloseValues,
} from './types';

const defaultOptions = {
    maxFrameSize: 8192,
    poolInternals: false,
    noCopySentBuffers: false,
    eventWrapper: true,
} as WSOptions;

const readView = new DataBuffer(16 * 1024);

export {
    WSState
};

const EMPTY_BUFFER = new DataBuffer(0);

type AnyCallback = ((...args: any[]) => void);
export type CallbackNames = "message" | "close" | "open" | "error";
export type CloseCallback = ((code: number, buf: IDataBuffer) => void);
export type ErrorCallback = ((error: Error) => void);
export type OpenCallback = (() => void);
export type MessageCallback = ((buf: IDataBuffer) => void);

export type CallbackMap = {
    message: MessageCallback[];
    close: CloseCallback[];
    open: OpenCallback[];
    error: ErrorCallback[];
};

export enum ConnectionState {
    Connecting = 1,
    Connected = 2,
    Closed = 3,
};


export default class WS {
    // @ts-ignore
    private frame: WSFramer;
    // @ts-ignore
    private pipe: INetworkPipe;

    private callbacks: CallbackMap;
    private state: ConnectionState;
    private opts: WSOptions;

    public onmessage?: MessageCallback;
    public onclose?: CloseCallback;
    public onopen?: OpenCallback;
    public onerror?: ErrorCallback;

    constructor(url: string | UrlObject, opts: WSOptions = defaultOptions) {
        // pipe: INetworkPipe, opts: WSOptions = defaultOptions) {
        this.state = ConnectionState.Connecting;
        this.opts = opts;

        this.callbacks = {
            message: [],
            close: [],
            open: [],
            error: [],
        };

        this.connect(url);
    }

    private readyEvent(msg: string | IDataBuffer, state?: WSState) {
        if (typeof msg === 'string') {
            return msg;
        }

        let payload: string | IDataBuffer = msg;
        if (state && state.opcode === Opcodes.TextFrame) {
            payload = Platform.utf8toa(msg);
        }

        // TODO: What other dumb things do I need to add to this?
        if (this.opts.eventWrapper) {
            return {
                data: payload
            };
        }

        return payload;
    }

    private async connect(url: string | UrlObject) {
        const pipe = await upgrade(url)
        const {
            message,
            close,
            open,
            error,
        } = this.callbacks;

        this.frame = new WSFramer(pipe, this.opts.maxFrameSize);
        this.pipe = pipe;

        pipe.on("error", (err: Error): void => {
            this.callCallback(error, this.onerror, err);
        });

        pipe.on("close", () => {
            if (this.state === ConnectionState.Closed) {
                return;
            }
            this.state = ConnectionState.Closed;

            // TODO: Pipe closes with no error codes.
            this.callCallback(close, this.onclose, 1000, null);
        });

        // The pipe is ready to read.
        const readData = () => {
            let bytesRead;
            while (1) {

                bytesRead = pipe.read(readView, 0, readView.byteLength);
                if (bytesRead <= 0) {
                    break;
                }

                this.frame.processStreamData(readView, 0, bytesRead);
            }
        }

        pipe.on("data", readData);

        this.frame.onFrame((buffer: IDataBuffer, state: WSState) => {
            switch (state.opcode) {
            case Opcodes.CloseConnection:
                this.state = ConnectionState.Closed;
                let code: number = CloseValues.NoStatusCode;
                let restOfData: IDataBuffer = EMPTY_BUFFER;
                
                if (buffer.byteLength) {
                    code = buffer.getUInt16BE(0);
                }

                if (buffer.byteLength > 2) {
                    restOfData = buffer.subarray(2);
                }

                this.callCallback(close, this.onclose, code, restOfData);

                // attempt to close the sockfd.
                this.frame.send(buffer, 0, buffer.byteLength, Opcodes.CloseConnection);
                this.pipe.close();

                break;

            case Opcodes.Ping:
                this.frame.send(buffer, 0, buffer.byteLength, Opcodes.Pong);
                break;

            case Opcodes.BinaryFrame:
            case Opcodes.TextFrame:
                const out = this.readyEvent(buffer, state);
                this.callCallback(message, this.onmessage, out);
                break;

            default:
                throw new Error("Can you handle this?");
            }
        });

        this.callCallback(open, this.onopen);
        readData();
    }

    ping() {
        /**/
    }

    private callCallback(callbacks: AnyCallback[],
                         secondCallback: AnyCallback | undefined, arg1?: any, arg2?: any) {

        try {
            if (secondCallback) {
                secondCallback(arg1, arg2);
            }

            for (const cb of callbacks) {
                cb(arg1, arg2);
            }
        } catch (e) {
            Platform.trace("Error on callbacks", e);
        }
    }

    // Don't know how to do this well...
    on(callbackName: CallbackNames, callback: (...args: any[]) => void) {
        this.callbacks[callbackName].push(callback);
    }

    off(callbackName: CallbackNames, callback: (...args: any[]) => void) {
        const cbs = this.callbacks[callbackName];
        const idx = cbs.indexOf(callback);
        if (~idx) {
            cbs.splice(idx, 1);
        }
    }

    sendJSON(obj: object) {
        this.send(JSON.stringify(obj));
    }

    send(obj: IDataBuffer | Uint8Array | string) {

        let bufOut: IDataBuffer;
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
}
