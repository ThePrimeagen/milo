import {
    WS,
    WSState,
    _wsUpgrade,
    // @ts-ignore
} from '../../dist/milo.node.js';

import Platform from "../../Platform";

async function run() {
    let dataCount = 0;
    const then = Date.now();
    let bytesReceived = 0;

    const byteLength = 4096 * 16;
    const dataFetchCount = 10000;

    const buf = new ArrayBuffer(byteLength);
    const networkPipe = await _wsUpgrade({
        url: "ws://localhost:1337/",
    });
    const ws = new WS(networkPipe);

    ws.onmessage = (buffer: Uint8Array) => {
        const bytesRead = buffer.byteLength;

        bytesReceived += bytesRead;

        if (++dataCount === dataFetchCount) {
            const now = Date.now();
            Platform.log("Total Bytes Received:", bytesReceived);
            Platform.log("Time Spent:", now - then);
            Platform.log("Mbps:", (bytesReceived / (now - then)) * 1000);
            return;
        }
        else if (dataCount < dataFetchCount) {
            ws.send("send");
        }
    };

    ws.onClose(() => {
        Platform.log("close");
    });

    ws.send("send");
}

run();
