export const enum Opcodes {
    ContinuationFrame = 0x0, // denotes a continuation frame
    TextFrame = 0x1, // denotes a text frame
    BinaryFrame = 0x2, // denotes a binary frame
    CloseConnection = 0x8, // denotes a connection close
    Ping = 0x9, // denotes a ping
    Pong = 0xA, // denotes a pong
};

// TODO: Fill in values
export const enum CloseValues {
    Shutdown = 1000,
    GoAway = 1002,
    NoStatusCode = 1005,
};

export type WSOptions = {
    maxFrameSize: number;
    eventWrapper: boolean;
};

export type UrlObject = {
    host: string,
    port: string | number
}


