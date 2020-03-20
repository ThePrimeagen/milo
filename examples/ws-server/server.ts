import ws from "ws";
import Platform from "../../Platform";


Platform.log("We are about to server.", 1337);
const wss = new ws.Server({
    port: 1337
});

const reallyLargeBuffer = Buffer.alloc(1024 * 1024);
for (let i = 0; i < reallyLargeBuffer.byteLength; ++i) {
    reallyLargeBuffer.writeUInt8(i % 256, i);
}

const smallBuf = Buffer.alloc(1024);
for (let i = 0; i < smallBuf.byteLength; ++i) {
    smallBuf.writeUInt8(i % 256, i);
}

function getBigAssBufferSlice() {
    const mid = Math.floor(reallyLargeBuffer.byteLength / 2);
    const low = Math.floor(Math.random() * mid);
    const high = mid + Math.floor(Math.random() * mid);

    return reallyLargeBuffer.slice(low, high);
}

Platform.log("We are about to connection.");
wss.on('connection', (websocket: WebSocket) => {
    Platform.log("OHHHH MY WE ARE CONNECTED.");

    // let timerId: number = 0;
    function sendData() {
        // @ts-ignore
        const buffer = getBigAssBufferSlice();
        websocket.send(buffer); // smallBuf);
    }

    function stopData() {
        // @ts-ignore
        // clearTimeout(timerId);
    }


    // 50 Mbps
    websocket.on('message', (data) => {
        const str = data.toString();
        switch (str) {
        case "send":
            sendData();
            break;
        case "stop":
            stopData();
            break;
        }
    });
});

Platform.log(Object.keys(wss));


