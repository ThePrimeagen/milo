export type IPlatform = {
    error(...args: any[]): void;
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
    let doneRes: (...args: any[]) => void;

    /* tslint:disable-next-line */
    new Promise(res => {
        doneRes = res
    });

    return new Promise((res, rej) => {
        let hasError = false;

        function reject(e: Error) {
            Platform.log(currentCaseId, "reject the websockets", e);
            hasError = true;
            rej(e);
            doneRes();
        }

        function startTestRun() {
            Platform.log(currentCaseId, "startTestRun");
            currentCaseId = 1;
            getCaseCount(runNextCase);
        }

        function updateStatus(msg: string) {
            Platform.log(msg);
        }

        function openWebSocket(wsUri: string) {
            Platform.log(currentCaseId, "openSocket", wsUri);
            // @ts-ignore
            return new WebSocketClass(wsUri);
        }

        function getCaseCount(cont: () => void) {
            const wsUri = wsuri + "/getCaseCount";
            const webSocket = openWebSocket(wsUri);
            Platform.log("getCaseCount --------------- START -----------------------");

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
                Platform.log(currentCaseId, "getCaseCount#close", caseCount);
                Platform.log("getCaseCount --------------- END -----------------------");
                cont();
            }
        }

        function updateReports() {
            Platform.log(currentCaseId, "updateReport");
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

                Platform.log(currentCaseId, "webSocket#close Is autobahn runner completed?", currentCaseId, caseCount);
                // Last socket closed.
                if (currentCaseId >= caseCount) {
                    res(caseCount);
                }
            }
        }

        let hasFinished = false;
        function finish() {
            Platform.log(currentCaseId, "Finished the websockets");
            if (hasFinished) {
                return;
            }
            hasFinished = true;
            updateStatus("All test cases executed.");
            updateReports();
            doneRes();
        }

        function readyNextCase() {
            Platform.log(`EMPTY SPACE ----------------- START ${currentCaseId} --------------- `);
            // setTimeout(() => {
                Platform.log(`EMPTY SPACE ----------------- END ${currentCaseId} --------------- `);
                currentCaseId = currentCaseId + 1;
                if (!hasFinished && !hasError && currentCaseId <= caseCount) {
                    runNextCase();
                } else {
                    finish();
                }
            // }, 100);
        }

        function runNextCase() {
            if (isNaN(+caseCount)) {
                const e = new Error(
                    `CaseCount for autobahn is not a number: ${caseCount}`);
                Platform.error(e);
                reject(e);
                return;
            }

            Platform.log(`runNextCase ----------------- START ${currentCaseId} --------------- `);

            if (hasError || hasFinished) {
                Platform.log(currentCaseId, "hadError or hasFinished", hasError, hasFinished);
                finish();
            }

            const wsUri = wsuri + "/runCase?case=" + currentCaseId + "&agent=" + agent;
            const webSocket = openWebSocket(wsUri);

            Platform.log(currentCaseId, "runNextCase", wsUri);

            webSocket.binaryType = "arraybuffer";
            webSocket.onopen = () => {
                Platform.log(currentCaseId, "runNextCase#webSocket.onopen");
                updateStatus("Executing test case " + currentCaseId + "/" + caseCount);
            }

            webSocket.onerror = (e: any) => {
                Platform.log(currentCaseId, "runNextCase#webSocket.onerror");
                Platform.log(currentCaseId, "getCaseCount#onerror", e);
                reject(e);
            }

            webSocket.onclose = () => {
                Platform.trace(`runNextCase ----------------- END ${currentCaseId} --------------- `);
                readyNextCase();
            }

            webSocket.onmessage = (e: { data: any }) => {
                Platform.log(currentCaseId, "Websocket:onmessage (Not including message due to length)");
                webSocket.send(e.data);
            }
        }

        startTestRun();
    });
}
