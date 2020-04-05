import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import target from "./rollup-target-plugin";
import babel from "rollup-plugin-babel";

const SOURCE_DIR = 'build/node';
const OUTPUT_DIR = 'dist';

export default {
    input: `${SOURCE_DIR}/milo.js`,
    output: {
        file: `${OUTPUT_DIR}/milo.node.js`,
        format: 'cjs',
        exports: "named"
    }, plugins: [
        target({
            target: 'node'
        }),
        babel({
            exclude: "node_modules/**",
            babelrc: false,
            presets: [
                [
                    '@babel/preset-env',
                    {
                        targets: {
                            node: 'current'
                        }
                    }
                ]
            ],
            plugins: [
                'babel-plugin-macros',
            ]
        }),
        resolve({
            preferBuiltins: true
        }),
        commonjs()
    ],
    external: [ 'fs', 'net', 'dns' ]
};
