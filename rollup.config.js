// rollup.config.js

import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
    input: 'build/src/milo.js',
    output: {
        dir: 'dist/',
        format: 'umd',
        name: "milo",
        exports: "named"
    }, plugins: [
        replace({ 'process.env.NRDP': true }),
        resolve(),
        commonjs()
    ]
};
