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

    Platform.log("runAutobahnTests", agent, wsuri);

    return new Promise((res, rej) => {
        function startTestRun() {
            Platform.log("startTestRun");
            currentCaseId = 1;
            getCaseCount(runNextCase);
        }

        function updateStatus(msg: string) {
            Platform.log(msg);
        }

        function openWebSocket(wsUri: string) {
            Platform.log("openSocket", wsUri);
            // @ts-ignore
            return new WebSocketClass(wsUri);
        }

        function getCaseCount(cont: () => void) {
            const wsUri = wsuri + "/getCaseCount";
            const webSocket = openWebSocket(wsUri);

            // @ts-ignore
            webSocket.onmessage = (e: { data: any }) => {
                caseCount = JSON.parse(e.data);
                Platform.log("getCaseCount#onmessage", caseCount);
                updateStatus("Will run " + caseCount + " cases ..");
            }

            // @ts-ignore
            webSocket.onclose = () => {
                Platform.log("getCaseCount#close");
                cont();
            }
        }

        function updateReports() {
            Platform.log("updateReport");
            if (!updateReport) {
                return;
            }
            const wsUri = wsuri + "/updateReports?agent=" + agent;
            const webSocket = openWebSocket(wsUri);

            // @ts-ignore
            webSocket.onopen = () => {
                updateStatus("Updating reports ..");
            }

            // @ts-ignore
            webSocket.onclose = () => {
                updateStatus("Reports updated.");
                updateStatus("Test suite finished!");

                // Last socket closed.
                if (currentCaseId >= caseCount) {
                    res();
                }
            }
        }

        function runNextCase() {
            const wsUri = wsuri + "/runCase?case=" + currentCaseId + "&agent=" + agent;
            const webSocket = openWebSocket(wsUri);

            Platform.log("runNextCase", wsUri);

            webSocket.binaryType = "arraybuffer";
            webSocket.onopen = (e: { data: any }) => {
                updateStatus("Executing test case " + currentCaseId + "/" + caseCount);
            }

            webSocket.onclose = () => {
                currentCaseId = currentCaseId + 1;
                Platform.log("runNextCase#onclose", currentCaseId);
                if (currentCaseId <= caseCount) {
                    runNextCase();
                } else {
                    updateStatus("All test cases executed.");
                    updateReports();
                }
            }

            webSocket.onmessage = (e: { data: any }) => {
                Platform.log("onmessage", e);
                webSocket.send(e.data);
            }
        }

        startTestRun();

    });
}
