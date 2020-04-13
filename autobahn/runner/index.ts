import fs from 'fs';
import path from 'path';
import shell from 'shelljs';

import { Platform } from '../../dist/milo.node';
import { systemReq } from './sys-requirements';
import { root } from './paths';
import { runAutobahnTests, AutobahnOpts } from './run-test';

export default async function autobahn(WebSocketClass: any, opts: AutobahnOpts): Promise<number> {
    await systemReq();
    return await runAutobahnTests(WebSocketClass, opts);
};


