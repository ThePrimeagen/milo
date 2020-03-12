// rollup.config.js
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import target from "./rollup-target-plugin";

export default {
    input: 'build/nrdp/milo.js',
    output: {
        dir: 'dist/',
        format: 'iife',
        name: "milo",
        exports: "named"
    }, plugins: [
        target({
            target: 'nrdp'
        }),
        resolve(),
        commonjs()
    ]
};
