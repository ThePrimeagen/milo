import config from './rollup.nrdp.js';
config.input = "build/nrdp/autobahn/runner/nrdp/entry.js"
config.output.name = 'entry';
config.output.file = 'dist/nrdp.autobahn.js';

export default config;

