import child_process from "child_process";
import { GlobalContext } from "./context";
import { IPlatform } from "./types";

export type AsyncRunOpts = {
    cmd: string;
    sync?: boolean;
    doneString: string;
    errorString?: string[];
    ignoreOnErr?: boolean;
    Platform: IPlatform;
    onData?: (line: string[]) => void;
};

export default async function runAsync(opts: AsyncRunOpts) {
    return new Promise((res, rej) => {
        const e = child_process.exec(opts.cmd);

        GlobalContext.runners.push(e);

        if (!e.stderr || !e.stdout) {
            rej("Unable to execute the async command");
            return;
        }

        function onOut(data: string) {

            const lines = data.split('\n');
            if (opts.onData) {
                opts.onData(lines);
            }

            lines.forEach((l: string) => {
                opts.Platform.log(l);
                if (~l.indexOf(opts.doneString)) {
                    res();
                }

                if (opts.errorString) {
                    if (opts.errorString.some(x => ~l.indexOf(x))) {
                        rej(data);
                    }
                }
            });
        }

        function onErr(data: string) {
            if (opts.ignoreOnErr) {
                return;
            }
            rej(data);
        }


        e.stdout.on("data", onOut);
        e.stderr.on("data", onErr);
    });
}

