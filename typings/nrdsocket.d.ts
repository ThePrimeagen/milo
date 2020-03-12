declare namespace nrdsocket {
    // interfaces
    class Sockaddr {
        constructor(arg?: Sockaddr | string);

        ipAddress: string | undefined;
        ipVersion: 4 | 6 | 0;
        port: number;
        readonly valid: boolean;
        clear(): void;
    }

    class BIO {
        flags: number;

        onctrl: (cmd: number, num: number, ptr: undefined | DataPointer) => number;

        onread: (bufferSize: number) => number; // this is called when the buffer wants to read, e.g. you need to call writeData in the callback
        onwrite: (bufferSize: number) => number; // this is called when the buffer wants to write, e.g. you need to call readData in the callback

        readData(offset: number, buffer: ArrayBuffer | Uint8Array, buffeOffset: number, bufferLength: number): void; // this reads from the bio
        writeData(offset: number, buffer: ArrayBuffer | Uint8Array | string, buffeOffset: number, bufferLength: number): void; // this writes to the bio

        eq(other: BIO | Struct): boolean;
    }

    interface Struct {
        readonly null: boolean;
        free: string;
        release(): void;
        eq(other: BIO | Struct): boolean;
    }

    interface MsgHdr {
        name?: ConstBuffer;
        iov?: [Buffer] | Buffer;
        control?: Buffer;
        flags?: number;
    }

    interface ConstMsgHdr {
        name?: ConstBuffer;
        iov?: [ConstBuffer] | ConstBuffer;
        control?: ConstBuffer;
        flags?: number;
    }

    interface BindFunctionOptions {
        no_trace?: boolean;
        allow_null_struct?: boolean;
    }

    class DataPointer {
        constructor(arg?: DataPointer);

        readonly valid: boolean;
        readonly size: number;

        set(index: number, value: number): void;
        get(index: number): void;

        null: boolean;

        clear(): void;
    }

    class ConstDataPointer {
        constructor(arg?: ConstDataPointer | DataPointer);

        readonly valid: boolean;
        readonly size: number;

        get(index: number): number;

        clear(): void;
    }

    class UnorderedMap {
        constructor(arg?: [[]] | UnorderedMap);
        clone(): UnorderedMap;
        has(key: any): boolean;
        get(key: any): any;
        set(key: any, value: any): void;
        take(key: any): any;
        delete(key: any): boolean;
        forEach(callback: ForEachCallback): void;
        keys(): [any];
        values(): [any];
        entries(): [any];
        clear(): void;
        readonly size: number;
        readonly length: number;
    }

    // types
    type IDataBuffer = import("../src/types").IDataBuffer;
    type Buffer = ArrayBuffer | Uint8Array | IDataBuffer;
    type ConstBuffer = string | ArrayBuffer | Uint8Array | ConstDataPointer | IDataBuffer | DataPointer;

    type ForEachCallback = (key: any, value: any) => boolean;
    type FDCallback = (fd: number, mode: number) => void;

    // functions
    function setFD(fd: number, mode: number, callback: FDCallback | undefined): void;
    function clearFD(fd: number): void;
    function clearFDs(): void;

    // properties
    const READ: number;
    const WRITE: number;
    const READWRITE: number;

    let errno: number;
    function strerror(err?: number): string;
    const sockets: [number];
    const files: [number];

    const AF_ALG: number;
    const AF_APPLETALK: number;
    const AF_ATMPVC: number;
    const AF_AX25: number;
    const AF_INET: number;
    const AF_INET6: number;
    const AF_IPX: number;
    const AF_LOCAL: number;
    const AF_NETLINK: number;
    const AF_PACKET: number;
    const AF_UNIX: number;
    const AF_X25: number;

    const E2BIG: number;
    const EACCES: number;
    const EADDRINUSE: number;
    const EADDRNOTAVAIL: number;
    const EAFNOSUPPORT: number;
    const EAGAIN: number;
    const EALREADY: number;
    const EBADE: number;
    const EBADF: number;
    const EBADFD: number;
    const EBADMSG: number;
    const EBADR: number;
    const EBADRQC: number;
    const EBADSLT: number;
    const EBUSY: number;
    const ECANCELED: number;
    const ECHILD: number;
    const ECHRNG: number;
    const ECOMM: number;
    const ECONNABORTED: number;
    const ECONNREFUSED: number;
    const ECONNRESET: number;
    const EDEADLK: number;
    const EDEADLOCK: number;
    const EDESTADDRREQ: number;
    const EDOM: number;
    const EDQUOT: number;
    const EEXIST: number;
    const EFAULT: number;
    const EFBIG: number;
    const EHOSTDOWN: number;
    const EHOSTUNREACH: number;
    const EHWPOISON: number;
    const EIDRM: number;
    const EILSEQ: number;
    const EINPROGRESS: number;
    const EINTR: number;
    const EINVAL: number;
    const EIO: number;
    const EISCONN: number;
    const EISDIR: number;
    const EISNAM: number;
    const EKEYEXPIRED: number;
    const EKEYREJECTED: number;
    const EKEYREVOKED: number;
    const EL2HLT: number;
    const EL2NSYNC: number;
    const EL3HLT: number;
    const EL3RST: number;
    const ELIBACC: number;
    const ELIBBAD: number;
    const ELIBEXEC: number;
    const ELIBMAX: number;
    const ELIBSCN: number;
    const ELNRANGE: number;
    const ELOOP: number;
    const EMEDIUMTYPE: number;
    const EMFILE: number;
    const EMLINK: number;
    const EMSGSIZE: number;
    const EMULTIHOP: number;
    const ENAMETOOLONG: number;
    const ENETDOWN: number;
    const ENETRESET: number;
    const ENETUNREACH: number;
    const ENFILE: number;
    const ENOANO: number;
    const ENOBUFS: number;
    const ENODATA: number;
    const ENODEV: number;
    const ENOENT: number;
    const ENOEXEC: number;
    const ENOKEY: number;
    const ENOLCK: number;
    const ENOLINK: number;
    const ENOMEDIUM: number;
    const ENOMEM: number;
    const ENOMSG: number;
    const ENONET: number;
    const ENOPKG: number;
    const ENOPROTOOPT: number;
    const ENOSPC: number;
    const ENOSR: number;
    const ENOSTR: number;
    const ENOSYS: number;
    const ENOTBLK: number;
    const ENOTCONN: number;
    const ENOTDIR: number;
    const ENOTEMPTY: number;
    const ENOTRECOVERABLE: number;
    const ENOTSOCK: number;
    const ENOTSUP: number;
    const ENOTTY: number;
    const ENOTUNIQ: number;
    const ENXIO: number;
    const EOPNOTSUPP: number;
    const EOVERFLOW: number;
    const EOWNERDEAD: number;
    const EPERM: number;
    const EPFNOSUPPORT: number;
    const EPIPE: number;
    const EPROTO: number;
    const EPROTONOSUPPORT: number;
    const EPROTOTYPE: number;
    const ERANGE: number;
    const EREMCHG: number;
    const EREMOTE: number;
    const EREMOTEIO: number;
    const ERESTART: number;
    const ERFKILL: number;
    const EROFS: number;
    const ESHUTDOWN: number;
    const ESOCKTNOSUPPORT: number;
    const ESPIPE: number;
    const ESRCH: number;
    const ESTALE: number;
    const ESTRPIPE: number;
    const ETIME: number;
    const ETIMEDOUT: number;
    const ETOOMANYREFS: number;
    const ETXTBSY: number;
    const EUCLEAN: number;
    const EUNATCH: number;
    const EUSERS: number;
    const EWOULDBLOCK: number;
    const EXDEV: number;
    const EXFULL: number;

    const F_DUPFD: number;
    const F_GETFD: number;
    const F_GETFL: number;
    const F_SETFD: number;
    const F_SETFL: number;

    const IPPORT_BIFFUDP: number;
    const IPPORT_CMDSERVER: number;
    const IPPORT_DAYTIME: number;
    const IPPORT_DISCARD: number;
    const IPPORT_ECHO: number;
    const IPPORT_EFSSERVER: number;
    const IPPORT_EXECSERVER: number;
    const IPPORT_FINGER: number;
    const IPPORT_FTP: number;
    const IPPORT_LOGINSERVER: number;
    const IPPORT_MTP: number;
    const IPPORT_NAMESERVER: number;
    const IPPORT_NETSTAT: number;
    const IPPORT_RESERVED: number;
    const IPPORT_RJE: number;
    const IPPORT_ROUTESERVER: number;
    const IPPORT_SMTP: number;
    const IPPORT_SUPDUP: number;
    const IPPORT_SYSTAT: number;
    const IPPORT_TELNET: number;
    const IPPORT_TFTP: number;
    const IPPORT_TIMESERVER: number;
    const IPPORT_TTYLINK: number;
    const IPPORT_USERRESERVED: number;
    const IPPORT_WHOIS: number;
    const IPPORT_WHOSERVER: number;
    const IPPROTO_AH: number;
    const IPPROTO_BEETPH: number;
    const IPPROTO_COMP: number;
    const IPPROTO_DCCP: number;
    const IPPROTO_DSTOPTS: number;
    const IPPROTO_EGP: number;
    const IPPROTO_ENCAP: number;
    const IPPROTO_ESP: number;
    const IPPROTO_FRAGMENT: number;
    const IPPROTO_GRE: number;
    const IPPROTO_HOPOPTS: number;
    const IPPROTO_ICMP: number;
    const IPPROTO_ICMPV6: number;
    const IPPROTO_IDP: number;
    const IPPROTO_IGMP: number;
    const IPPROTO_IP: number;
    const IPPROTO_IPIP: number;
    const IPPROTO_IPV6: number;
    const IPPROTO_MAX: number;
    const IPPROTO_MH: number;
    const IPPROTO_MPLS: number;
    const IPPROTO_MTP: number;
    const IPPROTO_NONE: number;
    const IPPROTO_PIM: number;
    const IPPROTO_PUP: number;
    const IPPROTO_RAW: number;
    const IPPROTO_ROUTING: number;
    const IPPROTO_RSVP: number;
    const IPPROTO_SCTP: number;
    const IPPROTO_TCP: number;
    const IPPROTO_TP: number;
    const IPPROTO_UDP: number;
    const IPPROTO_UDPLITE: number;

    const O_ACCMODE: number;
    const O_APPEND: number;
    const O_ASYNC: number;
    const O_CLOEXEC: number;
    const O_CREAT: number;
    const O_DIRECT: number;
    const O_DIRECTORY: number;
    const O_DSYNC: number;
    const O_EXCL: number;
    const O_FSYNC: number;
    const O_LARGEFILE: number;
    const O_NDELAY: number;
    const O_NOATIME: number;
    const O_NOCTTY: number;
    const O_NOFOLLOW: number;
    const O_NONBLOCK: number;
    const O_PATH: number;
    const O_RDONLY: number;
    const O_RDWR: number;
    const O_RSYNC: number;
    const O_SYNC: number;
    const O_TMPFILE: number;
    const O_TRUNC: number;
    const O_WRONLY: number;

    const SCM_TIMESTAMP: number;
    const SCM_TIMESTAMPING: number;
    const SCM_TIMESTAMPNS: number;
    const SCM_WIFI_STATUS: number;
    const SOCK_CLOEXEC: number;
    const SOCK_DCCP: number;
    const SOCK_DGRAM: number;
    const SOCK_NONBLOCK: number;
    const SOCK_PACKET: number;
    const SOCK_RAW: number;
    const SOCK_RDM: number;
    const SOCK_SEQPACKET: number;
    const SOCK_STREAM: number;
    const SOL_SOCKET: number;
    const SO_ACCEPTCONN: number;
    const SO_ATTACH_FILTER: number;
    const SO_BINDTODEVICE: number;
    const SO_BROADCAST: number;
    const SO_BSDCOMPAT: number;
    const SO_DEBUG: number;
    const SO_DETACH_FILTER: number;
    const SO_DOMAIN: number;
    const SO_DONTROUTE: number;
    const SO_ERROR: number;
    const SO_GET_FILTER: number;
    const SO_KEEPALIVE: number;
    const SO_LINGER: number;
    const SO_LOCK_FILTER: number;
    const SO_MARK: number;
    const SO_NOFCS: number;
    const SO_NO_CHECK: number;
    const SO_OOBINLINE: number;
    const SO_PASSCRED: number;
    const SO_PASSSEC: number;
    const SO_PEEK_OFF: number;
    const SO_PEERCRED: number;
    const SO_PEERNAME: number;
    const SO_PEERSEC: number;
    const SO_PRIORITY: number;
    const SO_PROTOCOL: number;
    const SO_RCVBUF: number;
    const SO_RCVBUFFORCE: number;
    const SO_RCVLOWAT: number;
    const SO_RCVTIMEO: number;
    const SO_REUSEADDR: number;
    const SO_REUSEPORT: number;
    const SO_RXQ_OVFL: number;
    const SO_SECURITY_AUTHENTICATION: number;
    const SO_SECURITY_ENCRYPTION_NETWORK: number;
    const SO_SECURITY_ENCRYPTION_TRANSPORT: number;
    const SO_SELECT_ERR_QUEUE: number;
    const SO_SNDBUF: number;
    const SO_SNDBUFFORCE: number;
    const SO_SNDLOWAT: number;
    const SO_SNDTIMEO: number;
    const SO_TIMESTAMP: number;
    const SO_TIMESTAMPING: number;
    const SO_TIMESTAMPNS: number;
    const SO_TYPE: number;
    const SO_WIFI_STATUS: number;


    // functions
    function bindFunction<T>(signature: string, options?: BindFunctionOptions): T;
    function unbindFunction(signature: string): boolean;

    function accept(sockfd: number, addr: Sockaddr | undefined): number;
    function bind(sockfd: number, addr: Sockaddr): number;
    function close(fd: number): number;
    function connect(sockfd: number, addr: Sockaddr): number;
    function fcntl(fd: number, cmd: number, arg?: ConstBuffer | undefined | number | boolean): number;
    function getsockopt(fd: number, level: number, optname: number, optval: Buffer | undefined, optvalOffset?: number, optvalLength?: number): number;
    function listen(sockfd: number, backlog: number): number;
    function open(pathname: ConstBuffer, flags: number, mode: number): number;
    function read(fd: number, buf: Buffer, bufOffset?: number, bufLength?: number): number;
    function recv(sockfd: number, buf: Buffer, bufOffset: number, bufLength: number, flags: number): number;
    function recvfrom(sockfd: number, buf: Buffer, bufOffset: number, bufLength: number, flags: number, addr: Sockaddr | undefined): number;
    function recvmsg(sockfd: number, msg: MsgHdr, flags: number): number;
    function send(sockfd: number, buf: ConstBuffer, bufOffset: number, bufLength: number, flags: number): number;
    function sendmsg(sockfd: number, msg: ConstMsgHdr, flags: number): number;
    function sendto(sockfd: number, buf: ConstBuffer, bufOffset: number, bufLength: number, flags: number, addr: Sockaddr): number;
    function setsockopt(fd: number, level: number, optname: number, optval: ConstBuffer | undefined, optvalOffset?: number, optvalLength?: number): number;
    function socket(domain: number, type: number, protocol: number): number;
    function unlink(pathname: ConstBuffer): number;
    function write(fd: number, buf: ConstBuffer, bufOffset?: number, bufLength?: number): number;

    interface SSLCallbackData {
        callback: Function;
        functionPointer: DataPointer;
    }
    function setSSLCallback(name: string, callback?: Function): DataPointer;
    function allSSLCallbacks(): { [key: string]: SSLCallbackData | undefined };
}
