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
    return execFile(path.join(__dirname, "../node_modules/.bin/tsc"), [ "--pretty", "-p", path.join(__dirname, "../tsconfig.nrdp.json") ]);
}).then(() => {
    return Promise.all([ execFile(path.join(__dirname, "../node_modules/.bin/rollup"), [ "-c", path.join(__dirname, "../rollup.nrdp.js") ]),
                         execFile(path.join(__dirname, "../node_modules/.bin/rollup"), [ "-c", path.join(__dirname, "../rollup.nrdp.test.js") ]) ]);
});

const node = execFile(path.join(__dirname, "../node_modules/.bin/tsc"), [ "--pretty", "-p", path.join(__dirname, "../tsconfig.node.json") ]).then(() => {
    return execFile(path.join(__dirname, "../node_modules/.bin/rollup"), [ "-c", path.join(__dirname, "../rollup.node.js") ]);
});

Promise.all([ nrdp, node ]).then(() => {
    return execFile("node", [ path.join(__dirname, "lint.js") ]);
}).catch((error) => {
    console.error("BUILD FAILURE", error.toString());
    process.exit(1);
});
