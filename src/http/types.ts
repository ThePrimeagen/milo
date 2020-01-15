export type NBuffer = Uint8Array | ArrayBuffer;
export type NConstBuffer = Uint8Array | ArrayBuffer | string;
export type OnData = () => void;
export type OnClosed = () => void;
export type OnError = (code: number, message: string) => void;
export type ConstBuffer = NConstBuffer; // Uint8Array|ArrayBuffer|string
export type Buffer = NBuffer; // Uint8Array|ArrayBuffer
export interface NetworkPipe {
    write(buf: ConstBuffer, offset: number, length: number): void;
    read(buf: Buffer, offset: number, length: number): number;
    close(): void;

    ondata: OnData;
    onclosed: OnClosed;
    onerror: OnError;
};

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

