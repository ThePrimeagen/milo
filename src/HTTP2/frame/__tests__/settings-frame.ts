import {
    FrameType,
    Settings,
} from '../types';

import SettingsWriter from '../settings-frame';
import { FRAME_HEADER_SIZE } from '../utils';

function toArray(...args: number[]) {
    return args;
}

/*
 +-------------------------------+
 |       Identifier (16)         |
 +-------------------------------+-------------------------------+
 |                        Value (32)                             |
 +---------------------------------------------------------------+
 */
describe('Settings', function() {
    it('should set all the settings.', function() {
        const settings = new SettingsWriter();

        settings.addSetting(Settings.MAX_CONCURRENT_STREAMS, 4);
        settings.addSetting(Settings.MAX_FRAME_SIZE, 2 ** 10 * 16);

        const frame = settings.toFrameWriter(5);
        const contents = frame.buffer.slice(FRAME_HEADER_SIZE);
        const view = new DataView(contents.buffer, contents.byteOffset, contents.byteLength);

        expect(view.getUint16(0)).toEqual(Settings.MAX_CONCURRENT_STREAMS);
        expect(view.getUint32(2)).toEqual(4);
        expect(view.getUint16(6)).toEqual(Settings.MAX_FRAME_SIZE);
        expect(view.getUint32(8)).toEqual(2 ** 10 * 16);
    });
});



