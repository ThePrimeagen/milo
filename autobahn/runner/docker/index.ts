import shell, { exec } from 'shelljs';

import { GlobalContext, killContext } from '../../context';
import { IPlatform } from '../../types';
import { autobahnDocker } from '../paths';
import { readyConfig } from './config';
import { killDocker } from './kill';
import { launch } from './launch';
import { stop } from './stop';

export {
    stop
};

export async function start(Platform: IPlatform) {

    return new Promise(async (res, rej) => {

        // Kills any currently running dockers
        await killDocker();

        // going full async....
        shell.pushd(autobahnDocker);

        readyConfig();
        await launch(Platform);

        shell.popd();

        // ...
        res();
    });
}

