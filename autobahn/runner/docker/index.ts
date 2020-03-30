import shell, { exec } from 'shelljs';
import death from 'death';

import { GlobalContext, killContext } from '../../context';
import { autobahnDocker } from '../paths';
import { readyConfig } from './config';
import { killDocker } from './kill';
import { launch } from './launch';
import { stop } from './stop';

export {
    stop
};

const ON_DEATH = death({ uncaughtException: true });

// Attempts to kill all autobahn testsuites
ON_DEATH((...args: any[]) => {
    if (process.env.SELF_MANAGED_AUTOBAHN !== 'true') {
        killDocker();
    }

    killContext(GlobalContext);

    process.exit();
});

export async function start() {

    return new Promise(async (res, rej) => {

        // Kills any currently running dockers
        await killDocker();

        // going full async....
        shell.pushd(autobahnDocker);

        readyConfig();
        await launch();

        shell.popd();

        // ...
        res();
    });
}

