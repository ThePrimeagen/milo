import {
    NetworkPipe,
} from '../../src/types';

import {
    WS,
    WSState,
    _wsUpgrade,
    // @ts-ignore
} from '../../dist/milo.node.js';

async function run() {
    let dataCount = 0;
    let then = Date.now();
    let bytesReceived = 0;
    let packetBytesReceived = 0;

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
            console.log("Total Bytes Received:", bytesReceived);
            console.log("Time Spent:", now - then);
            console.log("Mbps:", (bytesReceived / (now - then)) * 1000);
            return;
        }
        else if (dataCount < dataFetchCount) {
            ws.send("send");
        }
    };

    ws.onClose(() => {
        console.log("close");
    });

    ws.send("send");
}

run();
