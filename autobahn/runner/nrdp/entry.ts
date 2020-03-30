import IDataBuffer from "../../../src/IDataBuffer";
import IRequestData from "../../../src/IRequestData";
import Request from "../../../src/Request";
import RequestResponse from "../../../src/RequestResponse";
import Platform from "../../../src/Platform";
import WS from "../../../src/ws";
import { runAutobahnTests, AutobahnOpts } from '../run-test';
import getAgent from './agent';

async function run() {
    Platform.log("NRDP Test Started");
    const context = {};

    let errCode = 0;
    try {
        Platform.error("NRDP ABout to run tests.");
        await runAutobahnTests(WS, {
            Platform,
            agent: getAgent(),
        });
        Platform.error("NRDP Finish Tests");
    } catch (e) {
        Platform.error("NRDPs autobahn tests have failed:");
        Platform.error(e);
        errCode = 1;
    }

    Platform.log("NRDP Test Finished");
    nrdp.exit(errCode);
}

// @ts-ignore
nrdp.gibbon.init(run);

