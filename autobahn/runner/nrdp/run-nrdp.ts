import shell from 'shelljs';

// @ts-ignore
import { IPlatform } from '../types';
import { root } from '../paths';
import runAsync from '../../run-async';

export default async function runNRDP(Platform: IPlatform): Promise<number> {
    const cmd = [
        process.env.NRDP,
        `-U "file://${root}/dist/nrdp.autobahn.js"`,
    ].join(' ');

    shell.pushd(root);
    shell.exec(cmd, {async: true});
    let casesRan = -1;
    await runAsync({
        onData: (lines: string[]) => {
            lines.forEach(l => {
                if (~l.indexOf("Will run")) {
                    const cases = +l.split(' ')[2];

                    if (!isNaN(cases)) {
                        casesRan = cases;
                    }
                }
            });
        },
        cmd,
        sync: true,
        ignoreOnErr: true,
        doneString: "NRDP Test Finished",
    });
    shell.popd(root);

    return casesRan;
};

