declare module 'network-byte-order' {
    /**
    The htonl() function converts the given unsigned 32-bit (long) integer from
    host byte order to network byte order (Little-Endian to Big-Endian).

    b is an Array of octets or a Node.JS Buffer. i is the zero-based index at which
    to write into b. v is the value to convert.
     */
    export function htonl(buffer: Uint8Array, index: number, v: number): number;

    /**
    htons(b, i, v) The htons() function converts the given unsigned 16-bit (short)
    integer from host byte order to network byte order (Little-Endian to
    Big-Endian).

    b is an Array of octets or a Node.JS Buffer. i is the zero-based index at which
    to write into b. v is the value to convert.

     */
    export function htons(buffer: Uint8Array, index: number, v: number): number;

    /**
    ntohl(b, i) The ntohl() function converts the unsigned 32-bit (long) integer
    from network byte order to host byte order (Big-Endian to Little-Endian).

    b is an Array of octets or a Node.JS Buffer to read the value from. i is the
    zero-based index at which to read from b.

     */
    export function ntohl(buffer: Uint8Array, index: number): number;

    /**
    ntohs(b, i) The ntohs() function converts the unsigned 16-bit (short) integer
    from network byte order to host byte order (Big-Endian to Little-Endian).

    b is an Array of octets or a Node.JS Buffer to read the value from. i is the
    zero-based index at which to read from b.
     */
    export function ntohs(buffer: Uint8Array, index: number): number;

    /*
    ntohsStr(s, i) s is a string to the read value from. i is the zero-based index
    at which to read from s.
     */
    export function ntohsStr(buffer: string, index: number): number;

    /**
    ntohlStr(s, i) s is a string to the read value from. i is the zero-based index
    at which to read from s.
     */
    export function ntohlStr(buffer: string, index: number): number;
}
