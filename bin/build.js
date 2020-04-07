const path = require('path');
const execa = require('execa');
const Listr = require('listr');

const targetPlatforms = [
    'node',
    'nrdp',
];

const taskRenderer = process.env.EMACS ? 'verbose' : 'default';

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
            });
        },
        handler: (argv) => {
            const { target, prod } = argv;

            let tasks;
            if (target) {
                tasks = [getTargetTasks(target, {prod})];
            } else {
                /* Build for all the target platforms */
                const buildAllTasks = targetPlatforms.map(t => getTargetTasks(t, {prod}));
                tasks = [
                    {
                        title: `build platforms: ${targetPlatforms.join(', ')}`,
                        task: () => {
                            return new Listr(buildAllTasks, { concurrent: true });
                        }
                    }
                ];
            }

            const hrstart = process.hrtime();
            new Listr(tasks, {
                renderer: taskRenderer
            }).run()
                .then(() => {
                    const hrend = process.hrtime(hrstart);
                    console.info("\nAll tasks successfully completed in %ds", hrend[0]);
                })
                .catch(err => {
                    console.error(err);
                    process.exit(1);
                });
        }
    })
    .help()
    .argv;

function getTargetTasks(target, {prod}) {
    return {
        title: `build target: ${target}`,
        task: () => {
            return new Listr([
                target === 'nrdp' && getNRDPSSLGenerationTask(),
                {
                    title: `lint & compile TS`,
                    task: () => {
                        return new Listr([
                            getLintTask(),
                            getTscTask(target),
                        ], { concurrent: true });
                    }
                },
                getRollupTask(target, {prod})
            ].filter(Boolean));
    }
    };
}

function getNRDPSSLGenerationTask() {
    return {
        title: `generate ssl functions`,
        task: () => execa('node', [path.join(__dirname, 'generate-ssl-functions.js')], { stdout: 'inherit' })
    };
}

function getLintTask() {
    return {
        title: `linting`,
        task: () => execa('node', [path.join(__dirname, 'lint.js')], { stdout: 'inherit' })
    };
}

function getTscTask(target) {
    const tscConfig = path.resolve(
        __dirname,
        `builds/tsconfig.${target}.json`
    );
    return {
        title: `compile typescript`,
        task: () => execa('tsc', ['-p', tscConfig], { stdout: 'inherit' })
    };
}

function getRollupTask(target, { prod }) {
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
        title: `create bundle`,
        task: () => execa(
            'rollup',
            rollupOptions,
            {
                env: {
                    NODE_ENV: prod ? "production" : "development",
                    TARGET_PLATFORM: target
                },
                stdout: 'inherit'
            }
        )
    };
}
