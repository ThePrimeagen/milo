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
import { killContext, LocalContext } from './context';

death(async () => {
    await killDocker();
    process.exit();
});

export default async function run(context: LocalContext) {
    await systemReq();
    await killDocker();
    await readyConfig()
    await launch();
};

async function runner() {
    const context = {} as LocalContext;
    await run(context);
    killContext(context);
}

if (require.main === module) {
    runner();
}

