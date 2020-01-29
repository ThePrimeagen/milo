// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import path from 'path';

function target({ platform }) {
    return {
        name: 'target',
        resolveId (source, importer) {
            if (source.includes('#{platform}')) {
                const platformPath = source.replace('#{platform}', platform) + '.js';
                return path.resolve(path.dirname(importer), platformPath);
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
            platform: 'nrdp'
        }),
        resolve(),
        commonjs()
    ]
};
