import {
    SlowParsedHttp,
    HeaderKey,
} from './http';

import {
    Socket
} from './types';

export function isWSUpgradeRequest(httpRequest: SlowParsedHttp): boolean {
    return httpRequest.headers[HeaderKey.Upgrade] === 'websocket' &&
        httpRequest.headers[HeaderKey.Connection] === 'Upgrade';
};

enum State {
    WaitingForHeader = 1,
    ParsingFrame = 2,
};

type WSCallback = (buf: Buffer) => void;

// 1.  How to open up, insert, command, and quit.
// 2.  How to hjkl
// 3.  How to wb
// 4.  How to yp
// 5.  How to d
// 6.  How to ft
// 7.  How to xs
// 8.  How to ci({|(|[)
// 9.  How to $%

class WSBuilder {
    private state: State;
    private socketId: Socket;
    private callbacks: WSCallback[];

    constructor(socketId: Socket) {
        this.state = State.WaitingForHeader;
        this.socketId = socketId;
        this.callbacks = [];
    }

    getUpgradeHTTPResponse(httpRequest: SlowParsedHttp) {

    }

    onFrame(cb: WSCallback) {
        this.callbacks.push(cb);
    }

    addPacket(packet: Buffer) {

        if (this.state === State.WaitingForHeader) {
            this.parseHeader(packet);
        }

        else {
        }
    }

    private parseHeader(packet: Buffer) {


        this.state = State.ParsingFrame;
    }
};

