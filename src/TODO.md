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
* Report peer verification errors correctly
* ssl resumption
* ssl 0-RTT
* ssl false start
* http pipelining
* enforce http connection management
* transfer-encoding/transport-encoding inflate,gzip etc
* handle other X-Gibbon-Cache-Control stuff than key=
* don't make a databuffer when output format is arraybuffer/uint8array and data is in chunks
* consider sockets surviving scriptengine restart or not?
* handle file:/// and data:/ urls, maybe localcontrol as well.
* call callbacks when I get errors