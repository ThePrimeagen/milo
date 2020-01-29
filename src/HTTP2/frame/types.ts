// Don't know what this is?
export enum FrameType {
    HEADERS = 0x1,
    PRIORITY = 0x2,
    SETTINGS = 0x4,
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
    END_STREAM = 0x1,
    PRIORITY = 0x2,
    PADDED = 0x8,
};

