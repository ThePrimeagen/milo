import fs from 'fs';
import path from 'path';

import { root } from './runner/paths';
import { IPlatform } from './types';

export default function mergeCustomConfig(Platform: IPlatform) {
    try {
        const contents = fs.
            readFileSync(path.join(root, ".milo-test-env")).
            toString().
            split('\n').
            forEach(line => {
                const parts = line.split('=');
                process.env[parts[0]] = parts[1];
            });
    } catch (e) {
        Platform.log("Unable to read a custom config, if you wish to have your own config for test runs, please create /path/to/milo/.milo-test-env");
    }
};
