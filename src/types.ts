type AddrInfoHints = {
    ai_socktype: number;
    ai_family?: number;
    ai_flags?: number;
    ai_protocol?: number;
}

type NodeCallback = (err: (x: any) => void, res: (x: any) => void) => void;
type AddrId = number;
type Socket = number;
type fd_set = number;
type select = (sockfd: Socket, set: fd_set, cb: NodeCallback) => void;

type NativeSocketInterface = {
    // Socket constants
    SOCK_STREAM: number;
    AF_INET: number;
    AI_PASSIVE: number;
    STDIN_FILENO: number;

    // TODO: Errors???

    // socket functions
    socket: (domain: number, type: number, flags: number) => number;

    // TODO: O_NONBLOCK for non blocking send when there is not enough room.
    // Another javascript context?????????
    // THINK ABOUT SHARING THOSE MEMORIES
    send: (sockfd: Socket, buf: Uint8Array, len: number, flags?: number) => number;
    recv: (sockfd: Socket, buf: Uint8Array, len: number, flags?: number) => number;
    accept: (sockfd: Socket) => number;
    getaddrinfo: (host: string | number, port: string, hints: AddrId, bindAddr: AddrId) => number;
    bind: (sockfd: Socket, bindAddr: AddrId) => number;
    listen: (sockfd: Socket, backlog: number) => number;
    close: (sockfd: Socket) => number;
    fd_set: () => fd_set,
    FD_ISSET: (sockfd: Socket, set: fd_set) => boolean,
    FD_CLR: (sockfd: Socket, set: fd_set) => void,
    FD_SET: (sockfd: Socket, set: fd_set) => void,
    FD_ZERO: (set: fd_set) => void,
    select: select,
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
    readstdin: (buf: Uint8Array, len: number) => number;
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
    fd_set,
    select,
    NodeCallback,

    NativeSocketInterface,
};

