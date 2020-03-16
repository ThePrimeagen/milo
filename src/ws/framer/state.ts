import { DataBuffer } from '../../DataBuffer'

import {
    FramerState,
    WSState,
    WSCallback,
    MASK_SIZE,
    MAX_HEADER_SIZE,
} from './types';

export function createDefaultState(isControlFrame = false): WSState {
    // @ts-ignore
    return {
        isFinished: false,
        rsv1: 0,
        rsv2: 0,
        rsv3: 0,
        opcode: 0,

        isMasked: false,
        currentMask: new DataBuffer(MASK_SIZE),

        isControlFrame,
        state: FramerState.ParsingHeader,

        //
        payloadLength: 0,
        payloadPtr: 0,
        payloads: [],
    };
}

