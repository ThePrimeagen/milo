// rollup.config.js

import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
    input: 'build/http/ws/index.js',
    output: {
        dir: 'dist/',
        format: 'umd',
        name: "milo-sockets",
        exports: "named"
    },
    plugins: [resolve(), commonjs()]
};
