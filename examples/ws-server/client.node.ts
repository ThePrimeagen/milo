import {
    NetworkPipe,
} from '../../src/types';

import Platform from '../../src/Platform';
import WS, {WSState} from '../../src/ws/index';
import {_wsUpgrade} from '../../src/milo';

async function run() {
    let dataCount = 0;
    let then = Date.now();
    let bytesReceived = 0;
    let packetBytesReceived = 0;

    const byteLength = 4096;
    const buf = new ArrayBuffer(byteLength);
    debugger
    const networkPipe = await _wsUpgrade({
        url: "ws://localhost:1337/",
    });
    const ws = new WS(networkPipe);

    ws.onData((state: WSState, buffer: Uint8Array) => {
        const bytesRead = buffer.byteLength;

        bytesReceived += bytesRead;

        if (++dataCount === 10000) {
            const now = Date.now();
            console.log("Total Bytes Received:", bytesReceived);
            console.log("Time Spent:", now - then);
            console.log("Mbps:", (bytesReceived / (now - then)) * 1000);
            return;
        }
        else if (dataCount < 10000) {
            ws.send("send");
        }
    });

    ws.onClose(() => {
        console.log("close");
    });

    debugger
    ws.send("send");
}

run();
