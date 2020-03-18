import NetworkPipe from "../NetworkPipe";
import {
    UrlObject,
} from './types';

import { Request, RequestData, RequestResponse } from "../Request";
import Platform from "../Platform";
import DataBuffer from "../DataBuffer";
import { headerValue } from "../utils";

export function upgrade(u: string | UrlObject): Promise<NetworkPipe> {
    let url = u;
    if (typeof url === "object") {
        // TODO: Should I do this?
        url = `ws://${url.host}:${url.port}`;
    }

    const data: RequestData = { forbidReuse: true, url, format: "databuffer" };

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
            if (!upgradeKeyResponse)
                throw new Error("no Sec-WebSocket-Accept key");

            const WS_KEY = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
            const shadkey = Platform.btoa(Platform.sha1(key + WS_KEY));
            if (shadkey !== upgradeKeyResponse)
                throw new Error(`Key mismatch expected: ${shadkey} got: ${upgradeKeyResponse}`);

            Platform.trace("successfully upgraded");

            // houstone we have a problem
            // TODO: Come back to this...
            // @ts-ignore
            resolve(req.networkPipe);
        }).catch(error => {
            Platform.trace("Got error", error);
            reject(error);
        });
    });
}

