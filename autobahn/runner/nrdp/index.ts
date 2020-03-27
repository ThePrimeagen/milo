import shell from 'shelljs';

// @ts-ignore
import { IPlatform } from '../types';
import { root } from '../paths';

import sysRequirements from './sys-requirements';
import createArtifact from './create-artifact';
import runNRDP from './run-nrdp';

export default async function testNrdp(Platform: IPlatform) {
    // Setup the system.
    await sysRequirements(Platform);
    await createArtifact(Platform);

    // run NRDP
    await runNRDP(Platform);
};
