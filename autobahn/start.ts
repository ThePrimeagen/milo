import death from 'death';

import dotenv from 'dotenv';
dotenv.config();

// Does not seem to be able to get platform from the dist.
// @ts-ignore
import { Platform } from '../dist/milo.node.js';

import mergeCustomConfig from './merge-custom-config';
mergeCustomConfig(Platform);

import { systemReq } from './runner/sys-requirements';
import { killDocker } from './runner/docker/kill';
import { readyConfig } from './runner/docker/config';
import { launch } from './runner/docker/launch';
import { killContext, GlobalContext } from './context';

death(async () => {
    await killDocker();
    killContext(GlobalContext);
    process.exit();
});

export default async function run() {
    await systemReq();
    await killDocker();
    await readyConfig()
    await launch(Platform);
};

async function runner() {
    await run();
    killContext(GlobalContext);
}

if (require.main === module) {
    runner();
}

