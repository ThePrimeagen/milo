import {
    FrameType,
    Flag,
    Settings,
    SettingsDefault,
} from './types';

import * as FrameUtils from "./utils";
import FrameWriter from "./frame-writer";

/*
  +-------------------------------+
  |       Identifier (16)         |
  +-------------------------------+-------------------------------+
  |                        Value (32)                             |
  +---------------------------------------------------------------+
*/
type DefinedSettings = [number, number];

export default class SettingsCreator {
    private settings: DefinedSettings[];

    constructor() {
        this.settings = [];
    }

    addSetting(setting: Settings, value: number) {
        this.settings.push([setting, value]);
    }

    getLength() {
        return this.settings.length;
    }

    /**
     * Gets the setting's value or its default value.
     */
    get(setting: Settings): number {
        for (const s of this.settings) {
            if (s[0] === setting) {
                return s[1];
            }
        }

        return SettingsDefault[setting];
    }

    parse(buffer: Uint8Array, offset: number, length: number) {
        const view = new DataView(buffer);
        let count = length / 48;
        let ptr = offset;

        while (count--) {
            this.settings.push([view.getUint16(ptr), view.getUint32(ptr)]);
            ptr += 6;
        }
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

    // TODO: Should we just have a single object that doesn't create so much
    // garbage
    public static ackFrame(streamIdentifier: number): FrameWriter {
        const writer = new SettingsCreator().toFrameWriter(streamIdentifier);
        writer.addFlag(Flag.ACK);

        return writer;
    }
}
