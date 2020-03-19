import death from 'death';

import dotenv from 'dotenv';
dotenv.config();

import { systemReq } from './runner/sys-requirements';
import { killDocker } from './runner/docker/kill';
import { readyConfig } from './runner/docker/config';
import { launch } from './runner/docker/launch';

death(async () => {
    await killDocker();
    process.exit();
});

async function run() {
    await systemReq();
    await killDocker();
    await readyConfig()
    await launch();
}

run();


