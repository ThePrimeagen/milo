import child_process from 'child_process';
import { GlobalContext } from './context';

export type AsyncRunOpts = {
    cmd: string;
    sync?: boolean;
    doneString: string;
    errorString?: string[];
    ignoreOnErr?: boolean;
    onData?: (line: string[]) => void;
};

export default async function runAsync(opts: AsyncRunOpts) {
    try {
        throw new Error("catch");
    } catch (e) {
        console.log("LOOK AT THIS, BETTER BE HERE 1x", opts.cmd, e);
    }
    return new Promise((res, rej) => {
        if (opts.sync) {
            try {
                child_process.execSync(opts.cmd);
            } catch (e) {
                rej(e);
                return;
            }
            res();
        }
        const e = child_process.exec(opts.cmd);
        e.on("exit", function() {
            console.log("LOOK AT THAT");
            console.log("LOOK AT THAT");
            console.log("LOOK AT THAT");
            console.log("LOOK AT THAT");
            console.log("LOOK AT THAT");
            console.log("LOOK AT THAT");
            console.log("LOOK AT THAT");
            console.log("LOOK AT THAT");
        });

        GlobalContext.runners.push(e);

        if (!e.stderr || !e.stdout) {
            rej("Unable to execute the async command");
            return;
        }

        function onOut(data: string) {
            console.log("onOut", data);
            const lines = data.split('\n');
            if (opts.onData) {
                opts.onData(lines);
            }

            lines.forEach((l: string) => {
                if (~l.indexOf(opts.doneString)) {
                    console.log("runAsync is done");
                    detach();
                    res();
                }

                if (opts.errorString) {
                    if (opts.errorString.some(x => ~l.indexOf(x))) {
                        finishOnError(data);
                    }
                }
            });


        }

        function onErr(data: string) {
            console.log("onErr", data);
            if (opts.ignoreOnErr) {
                return;
            }
            finishOnError(data);
        }

        function finishOnError(str: string) {
            detach();
            rej(str);
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

