import fs from 'fs';
import path from 'path';
import shelljs from 'shelljs';

import { root } from './runner/paths';
import { IPlatform } from './types';

export const reportsDir = path.join(root, 'autobahn-testsuite/docker/reports/clients');
export function clearReports(platform: IPlatform) {
    shelljs.pushd(reportsDir);
    try {
        shelljs.exec(`rm -rf ${reportsDir}`);
    } catch (e) {
        platform.error(`Erro executing "rm -rf ${reportsDir}" ${e}`);
    }
    try {
        shelljs.exec(`mkdir ${reportsDir}`);
    } catch (e) {
        platform.error(`Erro executing "mkdir ${reportsDir}" ${e}`);
    }
    shelljs.popd();
}

export function getReports(agentName: string): Promise<string[]> {
    return new Promise((res, rej) => {
        fs.readdir(reportsDir, (err, items) => {
            if (err) {
                rej(err);
                return;
            }

            res(items.
                filter(file => ~file.indexOf(agentName)).
                filter(file => ~file.indexOf('json')));
        });
    });
};

export type Report = {
    behavior: string;
    behaviorClose: string;
    id: string;
};

function getFileContents(fileName: string): Report {
    const contents = fs.readFileSync(path.join(reportsDir, fileName)).toString();
    return JSON.parse(contents) as Report;
}

export function testPass(fileName: string): boolean {
    const results = getFileContents(fileName);

    return results.behavior === 'OK' &&
        results.behaviorClose === 'OK';
}

export function getId(fileName: string): string {
    const results = getFileContents(fileName);
    return results.id;
}
