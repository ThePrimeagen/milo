import { Request, RequestData } from "./Request";
import Platform from "./Platform";
import { NetworkPipe } from "./types";
import { headerValue } from "./Utils";
// @ts-ignore

const requests = new Map();

export function _load(data: RequestData, callback: Function): number
{
    Platform.log("got here", data);
    const req = new Request(data);
    req.send().then(response => {
        Platform.log("Got resolved", response);
    }).catch(error => {
        Platform.log("Got error", error);
    });
    return req.id;
}

export function _wsUpgrade(data: RequestData): Promise<NetworkPipe>
{
    return new Promise((resolve, reject) => {
        Platform.log("GOT SHIT", data);
        if (!data.headers)
            data.headers = {};
        const arrayBufferKey = Platform.randomBytes(16);
        const key = Platform.btoa(arrayBufferKey);
        Platform.log("key is", key, arrayBufferKey);
        data.headers["Upgrade"] = "websocket";
        data.headers["Connection"] = "Upgrade";
        data.headers["Sec-WebSocket-Key"] = key;
        data.headers["Sec-WebSocket-Version"] = "13";
        const req = new Request(data);
        req.send().then(response => {
            if (response.statusCode !== 101)
                throw new Error("status code");

            const upgradeKeyResponse = headerValue(response.headers, "sec-websocket-accept");
            if (!upgradeKeyResponse)
                throw new Error("no Sec-WebSocket-Accept key");

            const WS_KEY = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
            const shadkey = Platform.btoa(Platform.sha1(key + WS_KEY));
            if (shadkey !== upgradeKeyResponse)
                throw new Error(`Key mismatch expected: ${shadkey} got: ${upgradeKeyResponse}`);

            // Platform.log("successfully upgraded");
            resolve(req.networkPipe);
        }).catch(error => {
            Platform.log("Got error", error);
            reject(error);
        });
    });
}

/*
export let ws: WS;
export function createWS(url: string): Promise<WS>
{
    return _wsUpgrade({url: url}).then((networkPipe: NetworkPipe) => {
        // @ts-ignore
        Platform.log("foo", WS);
        Platform.log(Object.keys(WS));
        Platform.log(typeof WS);
        Platform.log("ws", WS.ws);
        ws = new WS(networkPipe);
        Platform.log("got thing here", ws);
        return ws;
    });
}
*/
