const path = require("path");
const fs = require("fs");
const child_process = require("child_process");

function execFile(path, args) {
    return new Promise((resolve, reject) => {
        console.log(`invoking ${path} ${args.join(" ")}`);
        child_process.execFile(path, args, (error, stdout, stderr) => {
            // console.log(path, args, "finished");
            if (stdout) {
                console.log(stdout);
            }
            if (stderr) {
                console.log(stderr);
            }
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

const nrdp = execFile("node", [ path.join(__dirname, "generate-ssl-functions.js") ]).then(() => {
    const lint = execFile("node", [ path.join(__dirname, "lint.js") ]);
    const tsc = execFile(path.join(__dirname, "../node_modules/.bin/tsc"), [ "--pretty", "-p", path.join(__dirname, "../tsconfig.nrdp.json") ]);
    return Promise.all([ lint, tsc ]);
}).then(() => {
    const nrdp = execFile(path.join(__dirname, "../node_modules/.bin/rollup"), [ "-c", path.join(__dirname, "../rollup.nrdp.js") ]);
    const test = execFile(path.join(__dirname, "../node_modules/.bin/rollup"), [ "-c", path.join(__dirname, "../rollup.nrdp.test.js") ]);
    return Promise.all([ nrdp, test ]);
});

const node = execFile(path.join(__dirname, "../node_modules/.bin/tsc"), [ "--pretty", "-p", path.join(__dirname, "../tsconfig.node.json") ]).then(() => {
    return execFile(path.join(__dirname, "../node_modules/.bin/rollup"), [ "-c", path.join(__dirname, "../rollup.node.js") ]);
});


Promise.all([ nrdp, node ]).catch((error) => {
    console.error("BUILD FAILURE", error.toString());
    process.exit(1);
});
