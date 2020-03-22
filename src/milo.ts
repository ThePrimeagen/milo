import { Request, RequestData, RequestResponse } from "./Request";
import Platform from "./Platform";
import WS, { WSState } from "./ws";
import IDataBuffer from "./IDataBuffer";

export {
    WS,
    WSState,
    Platform,
};

export function _load(data: RequestData, callback: (response: RequestResponse) => void): number {
    const req = new Request(data);
    req.send().then(response => {
        // if (response.data) {
        //     Platform.writeFile("/tmp/dl", response.data);
        // }
        // delete response.data;
        // Platform.log("Got resolved", response);
        callback(response);
    }).catch(error => {
        Platform.error("Got error", error);
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
