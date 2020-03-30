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

    try {
        Platform.error("NRDP ABout to run tests.");
        await runAutobahnTests(WS, {
            context,
            Platform,
            agent: getAgent(),
        });
        Platform.error("NRDP Finish Tests");
    } catch (e) {
        Platform.error("NRDPs autobahn tests have failed:");
        Platform.error(e);
    }

    Platform.log("NRDP Test Finished");
}

// @ts-ignore
nrdp.gibbon.init(run);

