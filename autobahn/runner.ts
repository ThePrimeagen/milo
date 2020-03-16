// @ts-ignore
import WebSocket from 'ws';

// @ts-ignore
import {Platform} from '../dist/milo.node';

export default function autobahn(WebSocketClass: WebSocket, {
    updateReport = true,
    port = 9001,
}) {
    const agent = "ThePrimeagen";
    const wsuri = `ws://localhost:${port}`; //:${port}/runCase?case=${testCase}&agent=ThePrimeagen
    let currentCaseId: number;
    let caseCount: number;

    function startTestRun() {
        currentCaseId = 1;
        getCaseCount(runNextCase);
    }

    function updateStatus(msg: string) {
        Platform.log(msg);
    }

    function openWebSocket(wsUri: string) {
        // @ts-ignore
        return new WebSocketClass(wsUri);
    }

    function getCaseCount(cont: () => void) {
        const ws_uri = wsuri + "/getCaseCount";
        const webSocket = openWebSocket(ws_uri);

        // @ts-ignore
        webSocket.onmessage = function(e: {data: any}) {
            debugger;
            caseCount = JSON.parse(e.data);
            updateStatus("Will run " + caseCount + " cases ..");
        }

        // @ts-ignore
        webSocket.onclose = function() {
            cont();
        }
    }

    function updateReports() {
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
        }
    }

    function runNextCase() {
        const ws_uri = wsuri + "/runCase?case=" + currentCaseId + "&agent=" + agent;
        const webSocket = openWebSocket(ws_uri);
            debugger;

        // @ts-ignore
        webSocket.binaryType = "arraybuffer";

        // @ts-ignore
        webSocket.onopen = function(e: {data: any}) {
            debugger;
            updateStatus("Executing test case " + currentCaseId + "/" + caseCount);
        }

        webSocket.onclose = function() {
            currentCaseId = currentCaseId + 1;
            if (currentCaseId <= caseCount) {
                runNextCase();
            } else {
                updateStatus("All test cases executed.");
                updateReports();
            }
        }

        // @ts-ignore
        webSocket.onmessage = function(e: {data: any}) {
            debugger;
            Platform.log("onmessage", e);
            webSocket.send(e.data);
        }
    }

    startTestRun();
};


