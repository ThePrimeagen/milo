// Don't know what this is?
export enum FrameType {
    HEADERS = 0x1,
    PRIORITY = 0x2,
    RST_STREAM = 0x3,
    SETTINGS = 0x4,
    PUSH_PROMISE = 0x5,
    PING = 0x6,
    GOAWAY = 0x7,
    WINDOW_UPDATE = 0x8,
    CONTINUATION = 0x9,
};

export enum Settings {
    HEADER_TABLE_SIZE = 0x1,
    ENABLE_PUSH = 0x2,
    MAX_CONCURRENT_STREAMS = 0x3,
    INITIAL_WINDOW_SIZE = 0x4,
    MAX_FRAME_SIZE = 0x5,
    MAX_HEADER_LIST_SIZE = 0x6,
}

export enum Flag {
    ACK = 0x1,
    END_STREAM = 0x1,
    PRIORITY = 0x2,
    PADDED = 0x8,
};

export const SettingsDefault = [
    0,
    4096, // HEADER_TABLE_SIZE
    1, // PUSH
    Number.MAX_SAFE_INTEGER, // MAX_CONCURRENT
    65535, // WINDOW_SIZE
    16384, // FRAME_SIZE
    Number.MAX_SAFE_INTEGER // MAX_HEADER_LIST
];

