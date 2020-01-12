import nrdp from "../nrdp";

export function ab2str(buf: Uint8Array): string {
    return nrdp.utf8toa(buf);
    // // TODO: Why is this failing, clearly its not wrong..................
    // // @ts-ignore
    // return String.fromCharCode.apply(null, new Uint8Array(buf));
};

export function uint8ArrayWriteString(buf: Uint8Array, str: string): number
{
    const b = nrdp.atoutf8(str);
    buf.set(b);
    return b.byteLength;
}

export function str2ab(str: string, buf: Uint8Array): number {
    // TODO: You are ackshually assuming that every character is 1 byte...

    let i, strLen;
    for (i = 0, strLen = str.length; i < strLen; i++) {
        buf[i] = str.charCodeAt(i);
    }

    return i;
};

export function arrayBufferSlice(buf: Uint8Array|ArrayBuffer, start: number, end?: number): ArrayBuffer
{
    if (buf instanceof ArrayBuffer) {
        return buf.slice(start, end);
    } else {
        return buf.buffer.slice(start + buf.byteOffset, end);
    }
}

export function uint8ArraySlice(buf: Uint8Array|ArrayBuffer, start: number, end?: number): Uint8Array
{
    return new Uint8Array(arrayBufferSlice(buf, start, end));
}

export function arrayBufferConcat(...buffers: Array<Uint8Array|ArrayBuffer>): ArrayBuffer
{
    // @ts-ignore
    // TODO michael fix
    return ArrayBuffer.concat(...buffers);
}

export function uint8ArrayConcat(...buffers: Array<Uint8Array|ArrayBuffer>): ArrayBuffer
{
    // @ts-ignore
    // TODO michael fix
    return new Uint8Array(ArrayBuffer.concat(...buffers));
}
