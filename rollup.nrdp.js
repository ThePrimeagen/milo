// rollup.config.js
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import target from "./rollup-target-plugin";
import babel from "rollup-plugin-babel";
import pkg from "./package.json";

export default {
    input: "build/nrdp/milo.js",
    output: {
        dir: "dist/",
        format: "esm",
        file: pkg.module,
        name: "milo",
        exports: "named"
    }, plugins: [
        target({
            target: "nrdp"
        }),
        resolve(),
        commonjs(),
        babel({
            exclude: "node_modules/**",
            include: "node_modules/emittery/**",
            babelrc: false
        })
    ]
};
