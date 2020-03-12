import SettingsFrame from "./settings-frame";

/**
 * create connection frame.  This will have a predetermined string then the
 * settings frame.
 */
export default function createConnectionFrame(settings: SettingsFrame) {

    const settingsFrame = settings.toFrameWriter(1);
};

