export const enum Opcodes {
    ContinuationFrame = 0x0, // denotes a continuation frame
    TextFrame = 0x1, // denotes a text frame
    BinaryFrame = 0x2, // denotes a binary frame
    CloseConnection = 0x8, // denotes a connection close
    Ping = 0x9, // denotes a ping
    Pong = 0xA, // denotes a pong
};

export function stringifyOpcode(code: Opcodes): string {
    switch (code) {
        case Opcodes.ContinuationFrame:
            return "ContinuationFrame";
        case Opcodes.TextFrame:
            return "TextFrame";
        case Opcodes.BinaryFrame:
            return "BinaryFrame";
        case Opcodes.CloseConnection:
            return "CloseConnection";
        case Opcodes.Ping:
            return "Ping";
        case Opcodes.Pong:
            return "Pong";
        default:
            return "Unknown";
    }
}

export function isValidOpcode(code: Opcodes): boolean {
    let valid = false;
    switch (code) {
        case Opcodes.ContinuationFrame:
        case Opcodes.TextFrame:
        case Opcodes.BinaryFrame:
        case Opcodes.CloseConnection:
        case Opcodes.Ping:
        case Opcodes.Pong:
            valid = true;
    }

    return valid;
}

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


