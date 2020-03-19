import { killDocker } from './kill';

export async function stop() {
    // TODO: Anything else?
    await killDocker();
}



