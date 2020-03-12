import path from 'path';

export default function target({ target }) {
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
