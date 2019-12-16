export function ab2str(buf: ArrayBuffer): string {
    debugger;
    return String.fromCharCode.apply(null, new Uint8Array(buf));
};

export function str2ab(str: string, buf: Buffer): number {
    // TODO: You are ackshually assuming that every character is 1 byte...
    const bufView = new Uint8Array(buf);

    let i, strLen;
    for (i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }

    return i;
};
