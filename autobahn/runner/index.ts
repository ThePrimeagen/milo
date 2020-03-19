import fs from 'fs';
import path from 'path';
import WebSocket from 'ws';
import shell from 'shelljs';

// @ts-ignore
import { Platform } from '../../dist/milo.node';
import { systemReq } from './sys-requirements';
import { root } from './paths';
import { start, stop } from './docker';
import { runAutobahnTests } from './run-test';

export type RunnerOptions = {
    updateReport: boolean;
    port: number;
};

export default async function autobahn(WebSocketClass: WebSocket, opts: RunnerOptions) {
    await systemReq();
    await runAutobahnTests(WebSocketClass, opts);
};


