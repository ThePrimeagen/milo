// rollup.config.js
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import target from "./rollup-target-plugin";
import babel from "rollup-plugin-babel";

export default {
    input: "build/nrdp/milo.js",
    output: {
        dir: "dist/",
        format: "iife",
        name: "milo",
        exports: "named"
    }, plugins: [
        target({
            target: "nrdp"
        }),
        resolve(),
        commonjs(),
        babel({
            babelrc: false,
		    presets: [
                [
                    '@babel/preset-env', 
                    { 
                        targets: {
                            safari: '6'
                        },
                        modules: false,
                        useBuiltIns: 'entry',
                        corejs: 3
                    }
                ]
            ],
        }),
    ]
};
