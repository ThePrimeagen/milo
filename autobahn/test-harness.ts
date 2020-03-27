import dotenv from 'dotenv';
dotenv.config();

// @ts-ignore
import {WS, Platform} from '../dist/milo.node';

import autobahn from './runner';
import getAgent, { setAgent, getVersion } from './runner/get-agent';
import autobahnTestSuite from './start';
import { getReports, testPass, getId } from './autobahn-reports';
import getNrdpAgent from './runner/nrdp/agent';
import testNrdp from './runner/nrdp';

const isNrdpRun = process.argv[2] === 'nrdp';

async function wait(ms: number) {
    return new Promise(res => {
        setTimeout(res, ms);
    });
}

async function run() {
    let agent = `test_harness_${getVersion()}`;
    console.log("Testing Autobahn with", process.env.CASES);
    console.log("Agent", agent);
    console.log("If this is wrong, please edit your .env file.");

    setAgent(agent);

    await wait(1000);
    if (process.env.SELF_MANAGED_AUTOBAHN !== 'true') {
        await autobahnTestSuite();
    }

    if (isNrdpRun) {
        agent = getNrdpAgent();
        await testNrdp(Platform);
    }
    else {
        await autobahn(WS, {
            updateReport: true,
            port: 9001,
            Platform,
            agent,
        });
    }

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

