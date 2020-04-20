import { systemReq } from './sys-requirements';
import { runAutobahnTests, AutobahnOpts } from './run-test';

export default async function autobahn(WebSocketClass: any, opts: AutobahnOpts): Promise<number> {
    await systemReq();
    return await runAutobahnTests(WebSocketClass, opts);
};


