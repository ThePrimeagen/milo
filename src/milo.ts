import { Request, RequestData, RequestResponse } from "./Request";
import Platform from "./#{target}/Platform";
import { IDataBuffer, IUnorderedMap } from "./types";
import WS, { WSState } from './ws';

export {
    WS,
    WSState,
};

export function _load(data: RequestData, callback: Function): number {
    const req = new Request(data);
    req.send().then(response => {
        // if (response.data) {
        //     Platform.writeFile("/tmp/dl", response.data);
        // }
        // delete response.data;
        // Platform.log("Got resolved", response);
        callback(response);
    }).catch(error => {
        Platform.trace("Got error", error);
    });
    return req.id;
}

let idx = 0;
export function ws(url: string, milo: boolean): Promise<WS> {
    if (milo) {
        return new Promise((res, rej) => {
            // @ts-ignore
            const ws = new WS(url);
            const id = ++idx;
            const ret = {
                send: ws.send.bind(ws),
                onmessage: (event: any) => { }
            };

            ws.onmessage = (buffer: IDataBuffer) => {
                if (ret.onmessage) {
                    ret.onmessage({
                        type: "message",
                        websocket: id,
                        opcode: 2,
                        statusCode: 1000,
                        buffer: buffer,
                        binary: true
                    });
                };
            };

            ws.onopen = () => {
                // who did this?
                // @ts-ignore
                res(ret);
            };
        });
    } else {
        return new Promise((resolve, reject) => {
            // @ts-ignore
            let ws = new nrdp.WebSocket(url);
            ws.onopen = () => {
                resolve(ws);
            };
            ws.onerror = (err: any) => {
                reject(err);
            };
        });
    }
}

let f_ck = 0;
export function wsTest(url: string, milo: boolean, dataFetchCount: number = 1024, big: boolean = false, nth: number = 1000) {
    ws(url, milo).then(ws => {
        let dataCount = 0;
        let then = Date.now();
        let bytesReceived = 0;

        ws.onmessage = (event: any) => {
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
                if (dataCount % nth == 0) {
                    Platform.log(`${dataCount}/${dataFetchCount}`);
                }
                ws.send(big ? "sendBig" : "send");
            }
        };

        // ws.onclose = () => {
        //     Platform.log("close");
        // }

        ws.send(big ? "sendBig" : "send");
    });
}

export function loadTest(url: string, milo: boolean, dataFetchCount: number = 1024, nth: number = 0) {
    let then = Date.now();
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

            if (result.statusCode != 200) {
                throw new Error("Couldn't load " + JSON.stringify(result));
            }

            ++idx;
            bytes += result.size || 0;
            if (idx % nth == 0) {
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
            _load({ url: url }, onData);
        } else {
            // @ts-ignore
            nrdp.gibbon.load({ url: url, cache: "no-cache", freshConnect: true }, onData);
        }
    }
    load();
}
