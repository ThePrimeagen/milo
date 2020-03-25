import { exec } from 'shelljs';
import { getDockers } from './docker-ps';


export async function killDocker() {
    const dockers = await getDockers();
    dockers.forEach(d => {
        if (~d[1].indexOf('crossbario/autobahn-testsuite')) {
            exec(`docker kill ${d[0]}`);
        }
    });

    // we also have to kill any other server
    exec(`docker rm fuzzingserver`);
}

