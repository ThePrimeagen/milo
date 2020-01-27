import {
    FrameType,
    Settings
} from './types';

import * as FrameUtils from './utils';
import FrameWriter from './frame-writer';

/*
 +-------------------------------+
 |       Identifier (16)         |
 +-------------------------------+-------------------------------+
 |                        Value (32)                             |
 +---------------------------------------------------------------+
 */
type DefinedSettings = [number, number];

export class SettingsCreator {
    private settings: DefinedSettings[];
    constructor() {
        this.settings = [];
    }

    addSetting(setting: Settings, value: number) {
        this.settings.push([setting, value]);
    }

    toFrameWriter(streamIdentifier: number): FrameWriter {
        const frame = new FrameWriter(
            this.settings.length * 6, streamIdentifier, FrameType.SETTINGS);

        this.settings.forEach(settings => {
            frame.write16(settings[0]);
            frame.write32(settings[1]);
        });

        return frame;
    }
}
