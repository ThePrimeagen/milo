import IDataBuffer from "./IDataBuffer";
import NetworkError from "./NetworkError";
import IRequestData from "./IRequestData";
import Platform from "./Platform";
import Request from "./Request";
import RequestResponse from "./RequestResponse";
import WS, { WSState } from "./ws";
import assert from "./utils/assert.macro";
import { NetworkErrorCode } from "./types";

export {
    WS,
    WSState,
    Platform,
};

export function _load(data: IRequestData | string, callback?: (response: RequestResponse) => void): number {
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
export function ws(url: string, milo: boolean): Promise<WS> {
    if (milo) {
        return new Promise((res, rej) => {
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

export function wsTest(url: string, milo: boolean, dataFetchCount: number = 1024,
                       big: boolean = false, nth: number = 1000) {
    ws(url, milo).then(websocket => {
        let dataCount = 0;
        const then = Date.now();
        let bytesReceived = 0;

        websocket.onmessage = (event: any) => {
            const bytesRead = event.buffer.byteLength;

            bytesReceived += bytesRead;

            // Platform.log(`${dataCount}/${dataFetchCount} ${bytesReceived}`);
            if (++dataCount === dataFetchCount) {
                const now = Date.now();
                Platform.log("Total Bytes Received:", bytesReceived);
                Platform.log("Time Spent:", now - then);
                Platform.log("Mbps:", (bytesReceived / (now - then)) * 1000);
                return;
            } else if (dataCount < dataFetchCount) {
                if (dataCount % nth === 0) {
                    Platform.log(`${dataCount}/${dataFetchCount}`);
                }
                websocket.send(big ? "sendBig" : "send");
            }
        };

        // websocket.onclose = () => {
        //     Platform.log("close");
        // }

        websocket.send(big ? "sendBig" : "send");
    });
}

export function loadTest(url: string, milo: boolean, dataFetchCount: number = 1024, nth: number = 0) {
    const then = Date.now();
    let idx = 0;
    let bytes = 0;
    if (!nth)
        nth = Math.ceil(dataFetchCount / 100);
    function load() {
        function onData(result: RequestResponse) {
            // if (!idx)
            //     Platform.log(result);
            if (!result)
                throw new Error("BAD!");

            if (result.statusCode !== 200) {
                throw new Error("Couldn't load " + JSON.stringify(result));
            }

            ++idx;
            bytes += result.size || 0;
            if (idx % nth === 0) {
                Platform.log(`${idx}/${dataFetchCount}`);
            }
            if (idx === dataFetchCount) {
                const now = Date.now();
                Platform.log("Total Bytes Received:", bytes);
                Platform.log("Time Spent:", now - then);
                Platform.log("Mbps:", (bytes / (now - then)) * 1000);
            } else {
                load();
            }
        }

        if (milo) {
            _load({ url }, onData);
        } else {
            // @ts-ignore
            nrdp.gibbon.load({ url, cache: "no-cache", freshConnect: true }, onData);
        }
    }
    load();
}

const poly: any = Platform.options("polyfill-milo");
switch (typeof poly) {
case "boolean":
    if (poly) {
        Platform.polyfillGibbonLoad("optin", _load);
    }
    break;
case "string":
    if (poly === "optin" || poly === "all") {
        Platform.polyfillGibbonLoad(poly, _load);
    } else {
        Platform.error("Invalid polyfill string", poly);
    }
    break;
case "undefined":
    break;
default:
    Platform.error("Invalid polyfill type", poly);
    break;
}
