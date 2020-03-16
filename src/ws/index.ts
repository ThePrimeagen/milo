import WSFramer, { WSState } from "./framer";
import { Platform, DataBuffer } from "../Platform";
import { Request, RequestData } from "../Request";
import { headerValue } from "../utils";

import {
    INetworkPipe,
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

export type UrlObject = {
    host: string,
    port: string | number
}

function _wsUpgrade(u: string | UrlObject): Promise<INetworkPipe> {
    let url = u;
    if (typeof url === "object") {
        // TODO: Should I do this?
        url = `ws://${url.host}:${url.port}`;
    }

    const data: RequestData = { url };

    return new Promise((resolve, reject) => {
        if (!data.headers) {
            data.headers = {};
        }

        // TODO: Ask Jordan, WHY TYPESCRIPT WHY...
        const arrayBufferKey = new DataBuffer(16);

        arrayBufferKey.randomize();
        const key = arrayBufferKey.toString("base64");


        Platform.trace("key is", key, arrayBufferKey);
        data.headers.Upgrade = "websocket";
        data.headers.Connection = "Upgrade";
        data.headers["Sec-WebSocket-Key"] = key;
        data.headers["Sec-WebSocket-Version"] = "13";
        data.forbidReuse = true;
        data.freshConnect = true;
        const req = new Request(data);
        req.send().then(response => {
            Platform.trace("Got response", response);
            if (response.statusCode !== 101)
                throw new Error("status code");

            const upgradeKeyResponse = headerValue(response.headers, "sec-websocket-accept");
            console.log("balls", JSON.stringify(response, null, 4));
            if (!upgradeKeyResponse)
                throw new Error("no Sec-WebSocket-Accept key");

            const WS_KEY = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
            const shadkey = Platform.btoa(Platform.sha1(key + WS_KEY));
            if (shadkey !== upgradeKeyResponse)
                throw new Error(`Key mismatch expected: ${shadkey} got: ${upgradeKeyResponse}`);

            Platform.trace("successfully upgraded");
            resolve(req.networkPipe);
        }).catch(error => {
            Platform.trace("Got error", error);
            reject(error);
        });
    });
}


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

    private async connect(url: string | UrlObject) {
        const pipe = await _wsUpgrade(url)
        const {
            message,
            close,
            open,
            error,
        } = this.callbacks;

        this.frame = new WSFramer(pipe, this.opts.maxFrameSize);
        this.pipe = pipe;

        pipe.onerror = (err: Error): void => {
            if (this.onerror) {
                this.onerror(err);
            }

            this.callCallback(error, this.onerror, err);
        };

        pipe.onclose = () => {
            if (this.state === ConnectionState.Closed) {
                return;
            }
            this.state = ConnectionState.Closed;
            this.callCallback(close, this.onclose, 1000, null);
        }


        // The pipe is ready to read.
        pipe.ondata = () => {
            let bytesRead;
            while (1) {

                bytesRead = pipe.read(readView, 0, readView.byteLength);
                if (bytesRead <= 0) {
                    break;
                }

                this.frame.processStreamData(readView, 0, bytesRead);
            }
        };

        this.frame.onFrame((buffer: IDataBuffer, state: WSState) => {
            switch (state.opcode) {
            case Opcodes.CloseConnection:
                this.state = ConnectionState.Closed;
                const code = buffer.getUInt16BE(0);
                const restOfData = buffer.subarray(2);

                this.callCallback(close, this.onclose, code, restOfData);

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
                this.callCallback(message, this.onmessage, buffer);
                break;

            default:
                throw new Error("Can you handle this?");
            }
        });

        this.callCallback(open, this.onopen);
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
