type AddrId = number;

type AddrInfoHints = {
    ai_socktype: number;
    ai_family?: number;
    ai_protocol?: number;
}

type NativeSocketInterface = {
    // Socket constants
    SOCK_STREAM: number;
    AF_INET: number;
    AI_PASSIVE: number;

    // TODO: Errors???

    // socket functions
    socket: (domain: number, type: number, protocol: number) => number;
    connect: (socket: number, bindAddr: AddrId) => number | null;
    send: (sockfd: number, buf: Uint8Array, len: number, flags?: number) => number;
    getaddrinfo: (host: string, port: string, hints: AddrId, bindAddr: AddrId) => number;

    // Convenience methods
    getErrorString: () => string;
    isValidSocket: (result: number) => boolean;

    // TODO: Breaking from c on this one.  There is no easy way to do this.
    newAddrInfo: (hints?: AddrInfoHints) => AddrId;
    addrInfoToObject: (id: AddrId) => AddrInfoHints;
};

export {
    AddrId,
    AddrInfoHints,

    NativeSocketInterface,
};

