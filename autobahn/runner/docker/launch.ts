import shell, {exec} from 'shelljs';

import { autobahnDocker } from '../paths';

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

export function launch() {

    return new Promise((res, rej) => {
        const e = exec(dockerCmd, {async: true});

        if (!e.stderr || !e.stdout) {
            rej("Unable to listen to stderr and stdout of the docker command.  Docker has failed.");
            return;
        }

        function onOut(data: string) {
            const lines = data.split('\n');
            lines.forEach((l: string) => {
                if (~l.indexOf("Ok, will run")) {
                    detach();
                    res();
                }
            });
        }

        function onErr(data: string) {
            detach();
            rej(data);
        }

        function detach() {
            if (e.stderr) {
                e.stderr.off("data", onErr);
            }

            if (e.stdout) {
                e.stdout.off("data", onOut);
            }
        }

        e.stdout.on("data", onOut);
        e.stderr.on("data", onErr);
    });
};
