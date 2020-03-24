import fs from 'fs';
import path from 'path';

import { root } from './paths';

export function getVersion(): string {
    const packageJson = JSON.parse(fs.
        readFileSync(path.join(root, "package.json")).toString());

    const version = packageJson.version as string;
    return version.replace('.', '_').replace('.', '_');
}

function defaultAgent(): string {
    return `Milo_${getVersion()}`;
}

let agent = defaultAgent();
export default function getAgent() {
    return agent;
}

export function setAgent(str: string) {
    agent = str;
}
