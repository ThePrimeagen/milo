import IDataBuffer from "../../../src/IDataBuffer";
import IRequestData from "../../../src/IRequestData";
import Request from "../../../src/Request";
import RequestResponse from "../../../src/RequestResponse";
import Platform from "../../../src/Platform";
import WS from "../../../src/ws";
import { runAutobahnTests, AutobahnOpts } from '../run-test';
import getAgent from './agent';

async function run() {
    await runAutobahnTests(WS, {
        Platform,
        agent: getAgent(),
    });

    Platform.log("NRDP Test Finished");
}

// @ts-ignore
nrdp.gibbon.init(run);

