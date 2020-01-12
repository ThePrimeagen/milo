jest.mock('../../bindings', () => {
    return {
        send: jest.fn()
    };
});

// dont be rude sunny
import * as wsUtils from '../ws.utils';
import { uint8ArrayWriteString } from "../../utils";

jest.doMock('../ws.utils.ts', () => {
    return {
        generateWSUpgradeKey() {
            return 'dGhlIHNhbXBsZSBub25jZQ==';
        },
        getResponseWSKey: (key: string) => wsUtils.getResponseWSKey(key),
    };
});


const hwBuf = new Uint8Array(11);
uint8ArrayWriteString(hwBuf, "Hello World");

import {SlowParsedHttp} from '../types';

const createBufferBuilderMock = {
    addString: jest.fn(),
    addNewLine: jest.fn(),
    getBuffer: jest.fn(() => hwBuf),
    length: jest.fn(() => 11),
};

jest.mock('../buffer', () => {
    return {
        createBufferBuilder: jest.fn(() => createBufferBuilderMock),
    };
});

import HTTP from '../index';
import bindings from '../../bindings';

const {
    HeaderKey,
} = require('../types');

describe("http", function() {

    beforeEach(() => {
        // @ts-ignore
        bindings.send.mockClear();

        createBufferBuilderMock.addString.mockClear();
        createBufferBuilderMock.addNewLine.mockClear();
        createBufferBuilderMock.getBuffer.mockClear();
        createBufferBuilderMock.length.mockClear();
    });

    // TODO: Fulfill the cases
    describe("ws", function() {
        it("should ensure the handshake actually works", function() {
            const httpSendUpgrade = new HTTP();
            httpSendUpgrade.upgradeToWS(5, "prime.com:8080", "/chat");

            expect(bindings.send).toHaveBeenCalledTimes(1);
            expect(bindings.send).toHaveBeenLastCalledWith(5, hwBuf, 11, 0);

            expect(httpSendUpgrade.validateUpgrade({
                headers: {
                    [HeaderKey.SecWebSocketAccept]: 's3pPLMBiTxaQ9kYGzzhZRbK+xOo='
                }
            } as SlowParsedHttp)).toEqual(true);
        });
    });
});

