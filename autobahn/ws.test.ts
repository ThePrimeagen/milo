import WebSocket from 'ws';

function websock(c = 1) {
    const ws = new WebSocket(`ws://localhost:9001/runCase?case=${c}&agent=ThePrimeagen`);
    ws.on('message', msg => console.log("Msg", msg));
    ws.on('open', (...args) => console.log("opened!!", ...args));
    ws.on('close', () => console.log("Closed"));
    return ws;
}

const o = websock();
