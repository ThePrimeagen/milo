#!/usr/bin/env node

/* global BigInt */

const fs = require("fs");
const path = require("path");

function stat(file)
{
    try {
        const stat = fs.statSync(file);
        // console.log(stat);
        return stat.mtimeMs;
    } catch (err) {
        return 0;
    }
}

const outputFile = path.join(__dirname, "../src/nrdp/NrdpSSLBoundFunctions.ts");
const statGenerate = stat(path.join(__dirname, "generate-ssl-functions.js"));
const statJson = stat(path.join(__dirname, "../src/nrdp/bound_ssl_functions.json"));
const statOutput = stat(outputFile);

if (statOutput > statGenerate && statOutput > statJson) {
    // console.log(statGenerate, statJson, statOutput);
    // nothing to do
    process.exit(0);
}

let ts = `import { IDataBuffer, IUnorderedMap, IPlatform } from "../types";
import N = nrdsocket;

`;

function layout(text) {
    if (text.length > 120) {
        let idx = 0;
        while (text.charCodeAt(idx) === 32) {
            ++idx;
        }
        return `${' '.repeat(idx)}/* tslint:disable:max-line-length */
${text}
`;
    }
    return text + "\n";
}

const data = JSON.parse(fs.readFileSync(path.join(__dirname, "../src/nrdp/bound_ssl_functions.json")));

data.functions.sort((a, b) => {
    return a.name.localeCompare(b.name);
});

data.constants.sort((a, b) => {
    return a.name.localeCompare(b.name);
});

data.functions.forEach((func) => {
    ts += layout(`type ${func.name}_type = ${func.type};`);
});

ts += `

export class NrdpSSLBoundFunctions {
    /* tslint:disable:variable-name */
`;

data.functions.forEach((func) => {
    ts += layout(`    public ${func.name} : ${func.name}_type`);
});

ts += "\n";
data.constants.forEach((constant) => {
    if (typeof constant.value === "number") {
        ts += layout(`    public readonly ${constant.name} = ${constant.value};`);
    } else {
        const value = BigInt(constant.value);
        if (value > Number.MAX_SAFE_INTEGER) {
            ts += layout(`    public readonly ${constant.name} = \"${constant.value}\";`);
        } else {
            ts += layout(`    public readonly ${constant.name} = ${constant.value};`);
        }
    }
});

ts += `
    constructor() {
`;

data.functions.forEach((func) => {
    ts += layout(`        this.${func.name} = N.bindFunction<${func.name}_type>(\"${func.signature}\");`);
});

ts += `    }
};
`;

// this.BIO_ctrl = N.bindFunction<BIO_ctrl_type>("long BIO_ctrl(BIO *bp, int cmd, long larg, void *parg);");

try {
    fs.writeFileSync(outputFile, ts);
} catch (err) {
    console.error("Failed to write file", err);
    process.exit(1);
}
