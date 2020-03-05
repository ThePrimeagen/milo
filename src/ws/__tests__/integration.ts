import ws from 'ws';
import WebSocket from '../index';
import {_wsUpgrade} from '../../milo';
import {NetworkPipe, IDataBuffer} from '../../types';

function wait(ms: number): Promise<undefined> {
    return new Promise(res => {
        setTimeout(res, ms);
    });
}

function newServer(port: number, host = 'localhost'): Promise<ws.Server> {
    return new Promise(res => {
        const wss: ws.Server = new ws.Server({
            host,
            port,
        }, () => res(wss));
    });
}

jest.setTimeout(5000);
describe("integration", function() {
    let wss: ws.Server;
    let port = 13370;
    let pipe: NetworkPipe;
    let connectedWSs: ws[] = [];

    beforeEach(async () => {
        wss = await newServer(port);
        wss.on('connection', function(ws) {
            connectedWSs.push(ws);
        });
        pipe = await _wsUpgrade({url: `ws://localhost:${port}`});
    });

    afterEach(() => {
        port++;
        connectedWSs.length = 0;
        wss.close();
    });

    // TODO: This needs to change, but I'll do that tonight.
    it("should connect to a websocket server and close.", async function(done) {
        const socket = new WebSocket(pipe);

        socket.on('close', (close: number, buf: IDataBuffer) => {
            expect(close).toEqual(1000);
            expect(buf.toString()).toEqual("goodbye, world");
            done();
        });

        connectedWSs[0].close(1000, "goodbye, world");
    });
});



