#!/usr/bin/env nodejs

const express = require("express");
const fs = require("fs");
const path = require("path");
const https = require('https');

const argv = require("minimist")(process.argv.slice(2));
const app = express();

app.get('/', (req, res) => {
    console.log("got here");
    res.send('Hello World');
});

const options = {
    key: fs.readFileSync(path.join(__dirname, "key.pem")),
    cert: fs.readFileSync(path.join(__dirname, "cert.pem"))
};

const file = argv["ports-file"] || __dirname + ".ports";
let ports = "";

let startPort = 1023;
const maxPort = 65535;
function createServer(opts)
{
    return new Promise((resolve, reject) => {
        function tryPort()
        {
            let server;
            const port = ++startPort;
            if (port > maxPort) {
                reject(new Error("Couldn't find a port"));
                return;
            }

            try {
                server = https.createServer(function() {
                    console.log("got shit");
                });
                server.listen(port);
            } catch (err) {
                tryPort();
                return;
            }

            const id = setTimeout(() => { // timed out
                tryPort();
            }, 250);
            server.on("error", err => {
                clearTimeout(id);
                tryPort();
            });

            server.once("listening", () => {
                clearTimeout(id);
                console.log(opts ? "https" : "http", "listening on", port);
                resolve(server);
            });
        }
        tryPort();
    });
}
let httpServer, httpsServer;
createServer().then(server => {
    httpServer = server;
//     return createServer(options);
// }).then(server => {
//     httpsServer = server;
}).catch(err => {
    console.error(err);
    process.exit(1);
});

