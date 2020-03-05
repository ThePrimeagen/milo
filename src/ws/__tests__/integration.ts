import _WebSocket from 'ws';
import WebSocket from '../index';
import {NetworkPipe, IDataBuffer} from '../../types';

function wait(ms: number): Promise<undefined> {
    return new Promise(res => {
        setTimeout(res, ms);
    });
}

function newServer(port: number, host = 'localhost'): Promise<_WebSocket.Server> {
    return new Promise(res => {
        const wss: _WebSocket.Server = new _WebSocket.Server({
            host,
            port,
        }, () => res(wss));
    });
}

async function onOpen(ws: WebSocket) {
    // TODO: THE OPTIMISZIZETNHNOIONS
    return new Promise(res => {
        ws.onopen = res;
    });
}

jest.setTimeout(5000);
describe("integration", function() {
    let wss: _WebSocket.Server;
    let port = 13370;
    let pipe: NetworkPipe;
    let connectedWSs: _WebSocket[] = [];

    beforeEach(async () => {
        wss = await newServer(port);
        wss.on('connection', function(ws) {
            connectedWSs.push(ws);
        });
    });

    afterEach(() => {
        port++;
        connectedWSs.length = 0;
        wss.close();
    });

    it("should connect to a websocket server and close.", async function(done) {
        const socket = new WebSocket(`ws://localhost:${port}`);
        await onOpen(socket);

        socket.on('close', (close: number, buf: IDataBuffer) => {
            expect(close).toEqual(1000);
            expect(buf.toString()).toEqual("goodbye, world");
            done();
        });

        connectedWSs[0].close(1000, "goodbye, world");
    });
});



