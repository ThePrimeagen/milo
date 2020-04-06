const path = require('path');
const execa = require('execa');
const Listr = require('listr');

const targetPlatforms = [
    'node',
    'nrdp',
];

require('yargs')
    .command({
        command: '$0',
        desc: 'Milo build command',
        builder: (yargs) => {
            yargs
            .option('target', {
              describe: `Specify a target platform to build for: ${targetPlatforms}`,
              type: 'string',
              choices: targetPlatforms,
            })
            .option('prod', {
                describe: 'Create a build stripped out of __DEV__ specific code and minified',
                type: 'boolean',
                default: false
            })
        },
        handler: (argv) => {
            const { target, prod } = argv;

            let tasks;
            if (target) {
                tasks = [
                    target === 'nrdp' && getNRDPSSLGenerationTask(),
                    getLintTask(),
                    getTscTask(target),
                    getRollupTask(target, { prod })
                ].filter(Boolean);
            } else {
                /* BUILD ALL */
                tasks = [
                    getNRDPSSLGenerationTask(),
                    getLintTask(),
                    {
                        title: 'compile typescript',
                        task: () => {
                            const tscTasks = targetPlatforms.map(getTscTask);
                            return new Listr(tscTasks, { concurrent: true });
                        }
                    },
                ];

                // Rollup tasks has to be serial beacuse of the macro
                targetPlatforms.forEach(t => {
                    tasks.push(getRollupTask(t, {prod}));
                })
            }

            const hrstart = process.hrtime()
            new Listr(tasks).run()
                .then(() => {
                    const hrend = process.hrtime(hrstart);
                    console.info("\nAll tasks successfully completed in %ds", hrend[0]);
                })
                .catch(err => {
                    console.error(err);
                });
        }
    })
    .help()
    .argv

function getNRDPSSLGenerationTask() {
    return {
        title: `nrdp: generate ssl functions`,
        task: () => execa('node', [path.join(__dirname, 'generate-ssl-functions.js')], { stdout: 'inherit' })
    }
}

function getLintTask() {
    return {
        title: `linting`,
        task: () => execa('node', [path.join(__dirname, 'lint.js')], { stdout: 'inherit' })
    }
}

function getTscTask(target) {
    const tscConfig = path.resolve(
        __dirname,
        `builds/tsconfig.${target}.json`
    );
    return {
        title: `${target}: compile typescript`,
        task: () => execa('tsc', ['-p', tscConfig], { stdout: 'inherit' })
    };
}

function getRollupTask(target, { prod }) {
    process.env.NODE_ENV = prod ? "production" : "development";
    process.env.TARGET_PLATFORM = target;

    const rollupConfig = path.resolve(
        __dirname,
        `builds/rollup.${target}.js`
    );
    const rollupOptions = [
        '-c',
        rollupConfig,
    ];

    if (prod) {
        rollupOptions.push('--prod');
    }
    return {
        title: `${target}: create bundle`,
        task: () => execa('rollup', rollupOptions, { stdout: 'inherit' })
    }
}
