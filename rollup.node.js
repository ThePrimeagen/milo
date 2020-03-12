// rollup.config.js
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import target from "./rollup-target-plugin";

export default {
    input: 'build/node/milo.js',
    output: {
        file: 'dist/milo.node.js',
        format: 'cjs',
        exports: "named"
    }, plugins: [
        target({
            target: 'node'
        }),
        resolve({
            preferBuiltins: true
        }),
        commonjs()
    ],
    external: [ 'fs', 'net', 'dns' ]
};
