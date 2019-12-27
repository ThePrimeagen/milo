// TODO: Continuation Frame
export enum Opcodes {
    ContinuationFrame = 0x0, // denotes a continuation frame
    TextFrame = 0x1, // denotes a text frame
    BinaryFrame = 0x2, // denotes a binary frame
    CloseConnection = 0x8, // denotes a connection close
    Ping = 0x9, // denotes a ping
    Pong = 0xA, // denotes a pong
};

export type WSOptions = {
    maxFrameSize: number;
};


