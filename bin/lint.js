const child_process = require("child_process");
const path = require("path");
const fs = require("fs");

child_process.execFile(path.join(__dirname, "../node_modules/.bin/tslint"),
                       [ "--project", path.join(__dirname, "..") ],
                       (error, stdout, stderr) => {
                           // if (error) {
                           //     console.error("Failed to run tslint", error);
                           // }
                           if (stdout) {
                               let file;
                               console.log(stdout.split("\n").map(line => {
                                   const match = /^(\/.*):[0-9]+:[0-9]+$/.exec(line);
                                   if (match) {
                                       file = match[1];
                                       return undefined;
                                   }

                                   if (!file) {
                                       return undefined;
                                   }

                                   const error = /^ERROR: ([0-9]+):([0-9]+) *(.*)$/.exec(line);
                                   if (!error) {
                                       const warning = /^WARNING: ([0-9]+):([0-9]+) *(.*)$/.exec(line);
                                       if (!warning) {
                                           return undefined;
                                       }
                                       return `${file}:${warning[1]}:${warning[2]}: warning: ${warning[3]}`;
                                   }
                                   return `${file}:${error[1]}:${error[2]}: error: ${error[3]}`;
                               }).filter(x => x).join("\n"));
                               // console.log("got stdout", typeof stdout);
                           }
                           if (stderr) {
                               console.error(stderr);
                           }
                           process.exit(error || stderr || stdout ? 1 : 0);
                       });
