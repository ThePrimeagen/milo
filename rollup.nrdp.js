// rollup.config.js
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "rollup-plugin-babel";
import target from "./rollup-target-plugin";

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
                        loose: true,
                        targets: {
                            safari: '6'
                        },
                        modules: false,
                        useBuiltIns: 'entry',
                        corejs: 3,
                        exclude: ['@babel/plugin-transform-async-to-generator', '@babel/plugin-transform-regenerator']
                    }
                ]
            ],
            plugins: [
                ['babel-plugin-transform-async-to-promises', {
                    hoist: true
                }]
            ]
        }),
    ]
};
