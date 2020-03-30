import dotenv from 'dotenv';
dotenv.config();

// @ts-ignore
import {WS, Platform} from '../dist/milo.node';

import mergeCustomConfig from './merge-custom-config';
mergeCustomConfig(Platform);

import autobahn from './runner';
import getAgent, { setAgent, getVersion } from './runner/get-agent';
import autobahnTestSuite from './start';
import { killContext, LocalContext } from './context';
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
    const context = {} as LocalContext;
    let agent = `test_harness_${getVersion()}`;
    console.log("Testing Autobahn with", process.env.CASES);
    console.log("Agent", agent);
    console.log("If this is wrong, please edit your .env file.");

    setAgent(agent);

    console.error("XXX starting test");
    await wait(1000);
    console.error("XXX self managed autobahn test suite?", process.env.SELF_MANAGED_AUTOBAHN);
    if (process.env.SELF_MANAGED_AUTOBAHN !== 'true') {
        console.error("XXX launchinng autobahn test suite");
        await autobahnTestSuite(context);
        console.error("XXX finished autobahn test suite");
    }

    console.error("XXX Is NRDP?", isNrdpRun);
    if (isNrdpRun) {
        agent = getNrdpAgent();
        console.error("XXX launching NRDP");
        await testNrdp(Platform, context);
        console.error("XXX finished NRDP");
    }
    else {
        await autobahn(WS, {
            updateReport: true,
            port: 9001,
            Platform,
            agent,
            context,
        });
    }

    console.error("XXX examining reports");
    const reports = await getReports(agent);
    const fails = reports.map(r => {
        if (!testPass(r)) {
            return getId(r);
        }

        return false;
    }).filter(x => x) as string[];

    console.error("XXX examining reports finished, failures are ", fails);
    if (fails.length) {
        console.log(fails.length, "Test cases have failed:", fails.join(', '));
        process.exit(1);
    }

    console.log("Successfully passed", process.env.CASES, "autobahn tests");
    killContext(context);
    process.exit(0);
}

run();

