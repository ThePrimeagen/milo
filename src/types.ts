type AddrInfoHints = {
    ai_socktype: number;
    ai_family?: number;
    ai_flags?: number;
    ai_protocol?: number;
}

type AddrId = number;
type Socket = number;

type NativeSocketInterface = {
    // Socket constants
    SOCK_STREAM: number;
    AF_INET: number;
    AI_PASSIVE: number;

    // TODO: Errors???

    // socket functions
    socket: (domain: number, type: number, flags: number) => number;
    send: (sockfd: Socket, buf: Uint8Array, len: number, flags?: number) => number;
    onRecv: ((sockfd: Socket, buf: Buffer, offset: number, cb: (readBytes: number) => void) => void);
    getaddrinfo: (host: string | number, port: string, hints: AddrId, bindAddr: AddrId) => number;
    bind: (sockfd: Socket, bindAddr: AddrId) => number;
    listen: (sockfd: Socket, backlog: number) => number;
    close: (sockfd: Socket) => number;
    gai_strerror: (error: number) => string;

    // NOTE: Broke from api
    connect: (socket: Socket, bindAddr: AddrId) => number | null;

    // TODO: Tomorrow we need to do.
    // 1.  Create a simple chat room server.
    // 2.  Have my nodes participate in it.
    // 3.  Create a better client than slack?
    //
    // 4.  select?  -- Break from api.
    //   - fd set
    //   - fd clear
    //
    //   while (1) {
    //      if (select(...,
    //   }
    //
    // 5.  recv
    // 6.  overcome discord

    // Convenience methods
    getErrorString: () => string;
    isValidSocket: (result: number) => boolean;

    // TODO: Breaking from c on this one.  There is no easy way to do this.
    newAddrInfo: (hints?: AddrInfoHints) => AddrId;
    addrInfoToObject: (id: AddrId) => AddrInfoHints;
};

export {
    Socket,
    AddrId,
    AddrInfoHints,

    NativeSocketInterface,
};

