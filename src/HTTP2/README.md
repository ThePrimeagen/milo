### Goals
* initialize a stream from the client and send over the data to the server.
  The should reply with the data + 1. thinking {count: 1} -> server -> {count:
  2}

* Stream and connection state.
* How to make a stream / connection work with our current system.
* TBD

### TODOS

#### HPACK
* Testing.
  * Encode / Decode formats
  * Header table format
  * go through [Appendix C](https://tools.ietf.org/html/rfc7541#appendix-C) and
    create those as tests.  They are as reliable as it gets.
* Header return format.  Should this be an object?

