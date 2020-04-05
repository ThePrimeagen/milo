import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "rollup-plugin-babel";
import target from "./rollup-target-plugin";
import sourcemaps from 'rollup-plugin-sourcemaps';
import { terser } from "rollup-plugin-terser";
import replace from '@rollup/plugin-replace';

const SOURCE_DIR = 'build/nrdp';
const OUTPUT_DIR = 'dist';

const getPluginsConfig = (prod) => {
    const plugins = [
        target({
            target: "nrdp"
        }),
        babel({
            exclude: "node_modules/**",
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
                        exclude: [
                            '@babel/plugin-transform-async-to-generator',
                            '@babel/plugin-transform-regenerator'
                        ]
                    }
                ]
            ],
            plugins: [
                'babel-plugin-macros',
                ['babel-plugin-transform-async-to-promises', {
                    hoist: true
                }]
            ]
        }),
        resolve(),
        replace({
            "process.env.NODE_ENV": JSON.stringify(prod ? "production" : "development"),
        }),
        commonjs(),
        sourcemaps()
    ];

    if (prod) {
        plugins.push(
            terser()
        );
    }
    return plugins;
}

export default (CLIArgs) => {
    const prod = !!CLIArgs.prod;
    const bundle = {
        input: `${SOURCE_DIR}/milo.js`,
        output: {
            file: prod ? `${OUTPUT_DIR}/milo.nrdp.prod.js` : `${OUTPUT_DIR}/milo.nrdp.js`,
            format: "iife",
            name: "milo",
            exports: "named",
            sourcemap: true
        },
    };
    
    // Apply plugins
    bundle.plugins = getPluginsConfig(prod);

    return bundle;
}