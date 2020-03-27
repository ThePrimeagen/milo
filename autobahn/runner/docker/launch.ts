import shell, {exec} from 'shelljs';

import { autobahnDocker } from '../paths';
import runAsync from '../../run-async';

// docker run -it --rm \
// -v "${PWD}/config:/config" \
// -v "${PWD}/reports:/reports" \
// -p 9001:9001 -p 8080:8080 \
// --name fuzzingserver \
// crossbario/autobahn-testsuite
//
const cmds = [
    "-t",
    "--rm",
    `-v "${autobahnDocker}/config:/config"`,
    `-v "${autobahnDocker}/reports:/reports"`,
    "-p 9001:9001 -p 8080:8080",
    "--name fuzzingserver",
    "crossbario/autobahn-testsuite",
];
const dockerCmd = `docker run ${cmds.join(' ')}`;

export async function launch() {
    await runAsync({
        cmd: dockerCmd,
        doneString: "Ok, will run"
    });
};
