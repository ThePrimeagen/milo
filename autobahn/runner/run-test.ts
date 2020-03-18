import fs from 'fs';
import path from 'path';

import WebSocket from 'ws';

import { root } from './paths';

// @ts-ignore
import { Platform } from '../../dist/milo.node';

export async function runAutobahnTests(WebSocketClass: WebSocket, {
    updateReport = true,
    port = 9001,
}) {

    const packageJson = JSON.parse(fs.
        readFileSync(path.join(root, "package.json")).toString());
    const agent = `Milo_${packageJson.version}`;
    const wsuri = `ws://localhost:${port}`; 
    let currentCaseId: number;
    let caseCount: number;

    console.log("runAutobahnTests", agent, wsuri);

    return new Promise((res, rej) => {
        function startTestRun() {
            console.log("startTestRun");
            currentCaseId = 1;
            getCaseCount(runNextCase);
        }

        function updateStatus(msg: string) {
            Platform.log(msg);
        }

        function openWebSocket(wsUri: string) {
            console.log("openSocket", wsUri);
            // @ts-ignore
            return new WebSocketClass(wsUri);
        }

        function getCaseCount(cont: () => void) {
            const ws_uri = wsuri + "/getCaseCount";
            const webSocket = openWebSocket(ws_uri);

            // @ts-ignore
            webSocket.onmessage = function(e: { data: any }) {
                caseCount = JSON.parse(e.data);
                console.log("getCaseCount#onmessage", caseCount);
                updateStatus("Will run " + caseCount + " cases ..");
            }

            // @ts-ignore
            webSocket.onclose = function() {
                console.log("getCaseCount#close");
                cont();
            }
        }

        function updateReports() {
            console.log("updateReport");
            if (!updateReport) {
                return;
            }
            const ws_uri = wsuri + "/updateReports?agent=" + agent;
            const webSocket = openWebSocket(ws_uri);

            // @ts-ignore
            webSocket.onopen = function() {
                updateStatus("Updating reports ..");
            }

            // @ts-ignore
            webSocket.onclose = function() {
                updateStatus("Reports updated.");
                updateStatus("Test suite finished!");

                // Last socket closed.
                if (currentCaseId >= caseCount) {
                    res();
                }
            }
        }

        function runNextCase() {
            const ws_uri = wsuri + "/runCase?case=" + currentCaseId + "&agent=" + agent;
            const webSocket = openWebSocket(ws_uri);

            console.log("runNextCase", ws_uri);

            webSocket.binaryType = "arraybuffer";
            webSocket.onopen = function(e: { data: any }) {
                updateStatus("Executing test case " + currentCaseId + "/" + caseCount);
            }

            webSocket.onclose = function() {
                currentCaseId = currentCaseId + 1;
                console.log("runNextCase#onclose", currentCaseId);
                if (currentCaseId <= caseCount) {
                    runNextCase();
                } else {
                    updateStatus("All test cases executed.");
                    updateReports();
                }
            }

            webSocket.onmessage = function(e: { data: any }) {
                Platform.log("onmessage", e);
                webSocket.send(e.data);
            }
        }

        startTestRun();

    });
}
