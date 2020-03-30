import shell, {exec} from 'shelljs';
import { LocalContext, ContextKey } from './context';

export type AsyncRunOpts = {
    cmd: string;
    doneString: string;
    errorString?: string[];
};

export default async function runAsync(opts: AsyncRunOpts) {
    return new Promise((res, rej) => {
        console.error("XXX Starting command", opts.cmd);
        const e = exec(opts.cmd, {async: true});

        if (!e.stderr || !e.stdout) {
            rej("XXX Unable to execute the async command");
            return;
        }

        function onOut(data: string) {
            console.error("XXX onOut", data);
            const lines = data.split('\n');
            lines.forEach((l: string) => {
                console.error("XXX", l, opts.doneString);
                if (~l.indexOf(opts.doneString)) {
                    detach();
                    res();
                }

                if (opts.errorString) {
                    if (opts.errorString.some(x => ~l.indexOf(x))) {
                        onErr(l);
                    }
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
}

