### HTTP2
* Basic frame validation process and ignores.
    * https://tools.ietf.org/html/rfc7540#section-4.1
    * ignore flags/types/reserved bit issues.

* Header compression and decrompression
    * https://tools.ietf.org/html/rfc7540#section-4.3

### WebSocket
* Figure out why NRDP is so slow
* Set up autobahn test suite and make it pass
* Set up autotest in the cloud to check performance under more realistic circumstances
* Get wss working

### Request

* Don't close TCP socket on SSL_ERROR_ZERO_RETURN
* ssl resumption
* ssl 0-RTT
* ssl false start
* http pipelining
* enforce http connection management
* handle other X-Gibbon-Cache-Control stuff than key=
* handle file:/// and data:/ urls, maybe localcontrol as well.
* Pool more classes, things like HTTP1 and Request should be quite poolable
* network.js?
* connection racing
* happy eyeballs ipv6
* fix location setting, gotta always load it
* fix images, gotta always load it first
* disallow non-const enums somehow (eslint, tsconfig)
* handling of format === "none" is not right with content length and compression stream and so on
* nrdp.gibbon.cookie must be polyfilled
* synchronous network requests, maybe some select enter loop business
* network statistics for milo
* /command for milo

### DONE
* Support -X
* Report peer verification errors correctly
* don't make a databuffer when output format is arraybuffer/uint8array and data is in chunks
* call callbacks when I get errors
* transfer-encoding/transport-encoding inflate,gzip etc
* consider sockets surviving scriptengine restart or not?, considered, they will not
