import fs from 'fs';
import path from 'path';
import WebSocket from 'ws';
import shell from 'shelljs';

// @ts-ignore
import { Platform } from '../../dist/milo.node';
import { systemReq } from './sys-requirements';
import { root } from './paths';
import { start, stop } from './docker';
import { runAutobahnTests, AutobahnOpts } from './run-test';

export default async function autobahn(WebSocketClass: WebSocket, opts: AutobahnOpts): Promise<number> {
    await systemReq();
    return await runAutobahnTests(WebSocketClass, opts);
};


