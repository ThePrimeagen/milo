export interface Killable {
    kill: () => void;
}

// This will help kill programs that are started by shelljs
export interface LocalContext {
    nrdp?: Killable;
    autobahn?: Killable;
};

export function killContext(context: LocalContext) {
    try {
        if (context.autobahn) {
            context.autobahn.kill();
        }

        if (context.nrdp) {
            context.nrdp.kill();
        }
    } catch (e) {
        console.error("ShellJS Error", e);
    }
}

export type ContextKey = "nrdp" | "autobahn";

