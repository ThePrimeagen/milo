import http2 from "http2";

import { Request } from "../../Request";
import { createRawConnection } from "../index";
import StreamManager, {SMState} from "../stream/stream-manager";

describe("HTTP2 integration test", function() {

    it('should setup a http2 server and create a connection to it.', async function(done) {
        const server = http2.createServer();

        server.on('error', (err) => console.error(err));
        server.on('stream', (stream, headers) => {
            // stream is a Duplex
            stream.respond({
                'content-type': 'text/html',
                ':status': 200
            });
            stream.end('<h1>Hello World</h1>');
        });

        server.listen(8000);

        // create the http2 upgrade request
        const pipe = await createRawConnection('http://localhost:8000');
        const streamManager = new StreamManager(pipe);

        let count = 0;
        const expects = [
            SMState.WAITING_ON_SETTINGS_ACK,
            SMState.OPEN,
            SMState.CLOSED,
        ];

        streamManager.onStateChange(newState => {
            expect(newState).toEqual(expects[count++]);

            if (streamManager.isInitialized()) {
                streamManager.close();
            }

            if (newState === SMState.CLOSED) {
                server.close(() => {
                    done();
                });
            }
        });
    });
});

