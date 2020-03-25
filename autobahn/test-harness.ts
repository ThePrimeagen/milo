import dotenv from 'dotenv';
dotenv.config();

// @ts-ignore
import { WS } from '../dist/milo.node';

import autobahn from './runner';
import getAgent, { setAgent, getVersion } from './runner/get-agent';
import autobahnTestSuite from './start';
import { getReports, testPass, getId } from './autobahn-reports';

async function wait(ms: number) {
    return new Promise(res => {
        setTimeout(res, ms);
    });
}

async function run() {
    const agent = `test_harness_${getVersion()}`;
    /* tslint:disable:no-console */
    console.log("Testing Autobahn with", process.env.CASES);
    console.log("Agent", agent);
    console.log("If this is wrong, please edit your .env file.");

    setAgent(agent);

    await wait(1000);
    await autobahnTestSuite();
    await autobahn(WS, {
        updateReport: true,
        port: 9001,
    });

    const reports = await getReports(agent);
    const fails = reports.map(r => {
        if (!testPass(r)) {
            return getId(r);
        }

        return false;
    }).filter(x => x) as string[];

    if (fails.length) {
        console.log(fails.length, "Test cases have failed:", fails.join(', '));
        process.exit(1);
    }

    console.log("Successfully passed", process.env.CASES, "autobahn tests");
    process.exit(0);
}

run();

