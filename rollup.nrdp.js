// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import path from 'path';

function target({ target }) {
    return {
        name: 'target',
        resolveId (source, importer) {
            if (source.includes('#{target}')) {
                const targetPath = source.replace('#{target}', target) + '.js';
                return path.resolve(path.dirname(importer), targetPath);
            }        
        },
    }
}

export default {
    input: 'build/nrdp/src/milo.js',
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
