import dotenv from 'dotenv';
dotenv.config();

import WebSocket from 'ws';

// @ts-ignore
import {WS} from '../dist/milo.node';

import autobahn from './runner';

const updateReport = process.env.UPDATE_REPORT === 'true';
const Class = process.env.MILO === 'true' ? WS : WebSocket

autobahn(Class, { 
    updateReport,
    port: 9001,
});

