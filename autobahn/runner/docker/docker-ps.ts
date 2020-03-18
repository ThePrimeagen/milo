import shell from 'shelljs';

// Assumes that we are in the proper location when dealing with docker.
export async function getDockers() {
    const ps = shell.exec("docker ps");

    if (ps.stderr) {
        throw new Error(ps.stderr);
    }

    if (!ps.stdout) {
        throw new Error("command: docker ps has no output.  We have to be able to run ps");
    }

    const lines = ps.stdout.split('\n').filter(x => x !== '').map(l => {
        return l.split(' ').filter(x => x !== '');
    });

    return lines.slice(1);
}


