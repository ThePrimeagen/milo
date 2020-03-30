import shell from 'shelljs';

// @ts-ignore
import { IPlatform } from '../types';
import { root } from '../paths';
import { LocalContext } from '../../context';
import runAsync from '../../run-async';

export default async function runNRDP(Platform: IPlatform, context: LocalContext) {
    const cmd = [
        process.env.NRDP,
        `-U "file://${root}/dist/nrdp.autobahn.js"`,
    ].join(' ');

    shell.pushd(root);
    shell.exec(cmd, {async: true});
    await runAsync({
        cmd,
        doneString: "NRDP Test Finished",
    });
    shell.popd(root);
};

