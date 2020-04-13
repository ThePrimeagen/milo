export type IPlatform = {
    log(...args: any[]): void;
    trace(...args: any[]): void;
}

export type AutobahnOpts = {
    updateReport?: boolean;
    port?: number;
    Platform: IPlatform;
    agent: string;
};

export async function runAutobahnTests(WebSocketClass: any, {
    updateReport = true,
    port = 9001,
    agent,
    Platform,
}: AutobahnOpts): Promise<number> {

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
            webSocket.onopen = () => {
                Platform.log("getCaseCount#onopen");
            }

            webSocket.onerror = (e: any) => {
                Platform.log("getCaseCount#onerror", e);
            }

            webSocket.onmessage = (e: { data: any }) => {
                caseCount = JSON.parse(e.data);
                Platform.log("getCaseCount#onmessage", caseCount);
                updateStatus("Will run " + caseCount + " cases ..");
            }

            // @ts-ignore
            webSocket.onclose = () => {
                Platform.log("getCaseCount#close", caseCount);
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

                Platform.log("webSocket#close Is autobahn runner completed?", currentCaseId, caseCount);
                // Last socket closed.
                if (currentCaseId >= caseCount) {
                    res(caseCount);
                }
            }
        }

        function runNextCase() {
            if (isNaN(+caseCount)) {
                throw new Error(`CaseCount for autobahn is not a number: ${caseCount}`);
            }

            const wsUri = wsuri + "/runCase?case=" + currentCaseId + "&agent=" + agent;
            const webSocket = openWebSocket(wsUri);

            Platform.log("runNextCase", wsUri);

            webSocket.binaryType = "arraybuffer";
            webSocket.onopen = (e: { data: any }) => {
                updateStatus("Executing test case " + currentCaseId + "/" + caseCount);
            }

            webSocket.onerror = (e: any) => {
                Platform.log("getCaseCount#onerror", e);
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
                Platform.log("Websocket:onmessage (Not including message due to length)");
                webSocket.send(e.data);
            }
        }

        startTestRun();

    });
}
