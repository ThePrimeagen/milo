import IDataBuffer from "./IDataBuffer";
import IMilo from "./IMilo";
import IRequestData from "./IRequestData";
import NetworkError from "./NetworkError";
import Platform from "./Platform";
import Request from "./Request";
import RequestResponse from "./RequestResponse";
import WS from "./ws";
import assert from "./utils/assert.macro";
import { NetworkErrorCode } from "./types";
import { headerValue } from "./utils";

(function miloMain() {
    function load(data: IRequestData | string, callback?: (response: RequestResponse) => void): number {
        if (typeof data === "string")
            data = { url: data };
        const url = data.url;
        const req = new Request(data);
        req.send().then(response => {
            if (!callback)
                return;
            try {
                callback(response);
            } catch (err) {
                Platform.error("Got error from callback", err);
            }
        }).catch((error: Error) => {
            Platform.error("Got error", error);
            if (callback) {
                assert(typeof data === "object", "This must be an object");
                const resp = new RequestResponse(req.id, url);
                resp.errorString = error.message;
                if (error instanceof NetworkError) {
                    resp.nativeErrorCode = error.code;
                } else {
                    resp.nativeErrorCode = NetworkErrorCode.UnknownError;
                    assert(error instanceof Error, "This should be an error");
                }
                resp.errorString = error.message;
                callback(resp);
            }
        });
        return req.id;
    }

    let wsIdx = 0;
    function ws(url: string, useMilo: boolean): Promise<WS> {
        if (useMilo) {
            return new Promise((res) => {
                // @ts-ignore
                const websocket = new WS(url);
                const id = ++wsIdx;
                const ret = {
                    send: websocket.send.bind(ws),
                    onmessage: (event: any) => { Platform.trace("got event", event); }
                };

                websocket.onmessage = (buffer: IDataBuffer) => {
                    if (ret.onmessage) {
                        ret.onmessage({
                            type: "message",
                            websocket: id,
                            opcode: 2,
                            statusCode: 1000,
                            buffer,
                            binary: true
                        });
                    };
                };

                websocket.onopen = () => {
                    // who did this?
                    // @ts-ignore
                    res(ret);
                };
            });
        } else {
            return new Promise((resolve, reject) => {
                // @ts-ignore
                const websocket = new nrdp.WebSocket(url);
                websocket.onopen = () => {
                    resolve(websocket);
                };
                websocket.onerror = (err: any) => {
                    reject(err);
                };
            });
        }
    }

    const milo: IMilo = {
        load,
        ws,
        platform: Platform,
        // @ts-ignore
        headerValue
    };

    if (!Platform.loadMilo(milo))
        return;
})();
