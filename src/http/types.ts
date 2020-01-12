export type SlowPath = {
    requestType: RequestTypes;
    uri: string;
    protocol: Protocol;
};

export type SlowParsedHttp = {
    headers: { [key: string]: string };
    path?: SlowPath;
    body: Uint8Array;
};

export enum HeaderKey {
    Upgrade = 'Upgrade',
    Connection = 'Connection',
    SecWebSocketKey = 'Sec-WebSocket-Key',
    SecWebSocketAccept = 'Sec-WebSocket-Accept',
};

export enum Protocol {
    HTTP1_1 = 'HTTP/1.1',
};

export enum RequestTypes {
    GET = 'GET',
    POST = 'POST'
};

