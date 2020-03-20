import { exec } from 'shelljs';
import { getDockers } from './docker-ps';
import Platform from "../../../Platform";


export async function killDocker() {
    const dockers = await getDockers();
    dockers.forEach(d => {
        Platform.log("d", d);
        if (~d[1].indexOf('crossbario/autobahn-testsuite')) {
            exec(`docker kill ${d[0]}`);
        }
    });

    // we also have to kill any other server
    exec(`docker rm fuzzingserver`);
}

