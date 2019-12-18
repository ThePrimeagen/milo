import {
    getContentLengthOffset,
    getContentLength,
    getEndLineOffset,
} from '../http';

import {
    basicGetRequest,
} from './utils/get';

const contentLength = "Content-Length:";
const bGRCLO = basicGetRequest.indexOf(contentLength) + contentLength.length;

describe("http", function() {
    it('should be able to do content length with space', function() {
        debugger;
        const justContentLength = Buffer.alloc(basicGetRequest.length);
        justContentLength.write(basicGetRequest);

        expect(getContentLengthOffset(justContentLength, 0, basicGetRequest.length)).toEqual(bGRCLO);
        expect(getContentLength(justContentLength, 0, basicGetRequest.length)).toEqual(11);
    });

    it('should getHTTPHeaderEndOffset', function() {
    });
});

