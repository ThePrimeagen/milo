export interface Killable {
    kill: () => void;
}

// This will help kill programs that are started by shelljs
export interface LocalContext {
    runners: Killable[]
};

export function killContext(context: LocalContext) {
    context.runners.forEach(k => {
        try {
            k.kill()
        } catch (e) {
            console.error("killContext Error", e);
        }
    });
}

export const GlobalContext = {
    runners: []
} as LocalContext;
