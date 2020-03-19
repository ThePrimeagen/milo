import fs from 'fs';
import path from 'path';

import { autobahnDocker } from '../paths';

const fuzzyConfigPath = path.join(autobahnDocker, 'config', 'fuzzingserver.json');
const defaultCases = ["*"];

export function readyConfig() {
    const fuzzyConfig = JSON.parse(fs.readFileSync(fuzzyConfigPath).toString());
    if (process.env.CASES) {
        fuzzyConfig.cases = process.env.CASES.split(",").filter(x => x !== '');
    } else {
        fuzzyConfig.cases = defaultCases;
    }
    fs.writeFileSync(fuzzyConfigPath, JSON.stringify(fuzzyConfig, null, 4));
}

