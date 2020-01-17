
export function normalizeBufferLen(buf: string | Uint8Array | ArrayBuffer, offset?: number, length?: number): Buffer {
    return normalizeBuffer(buf, offset, offset + length);
};

export function normalizeBuffer(buf: string | Uint8Array | ArrayBuffer, offset?: number, endIdx?: number): Buffer {
    /*
    let outBuf;
    if (typeof buf === 'string') {
        outBuf = Buffer.from(buf);
    }
    else if (buf instanceof Uint8Array) {
        outBuf = Buffer.from(buf);
    }
    else {
        outBuf = Buffer.from(buf);
    }
     * This works, why wont this one below work.
     */
    // @ts-ignore
    return Buffer.from(buf).slice(offset, endIdx);
};

export function normalizeUint8Array(buf: string | Uint8Array | ArrayBuffer, offset?: number, endIdx?: number): Uint8Array {
    return new Uint8Array(normalizeBuffer(buf, offset, endIdx).buffer);
};

export function normalizeUint8ArrayLen(buf: string | Uint8Array | ArrayBuffer, offset?: number, length?: number): Uint8Array {
    return new Uint8Array(normalizeBufferLen(buf, offset, length).buffer);
};

function stringToUint8Array(str: string): Uint8Array {
    const buf = Buffer.from(str);
    return new Uint8Array(buf);
}

export function toUint8Array(buf: string | Uint8Array | ArrayBuffer): Uint8Array {

    if (buf instanceof ArrayBuffer) {
        return new Uint8Array(buf);
    }
    else if (typeof buf === 'string') {
        return stringToUint8Array(buf);
    }

    return buf;
}

export function createNonCopyBuffer(buf: Uint8Array | ArrayBuffer, offset: number = 0, length?: number): Buffer {
    return Buffer.
        // @ts-ignore
        from(buf.buffer ? buf.buffer : buf).slice(offset, offset + length);
};

