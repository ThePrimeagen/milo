export function ab2str(buf: ArrayBuffer): string {
    return String.fromCharCode.apply(null, new Uint8Array(buf.slice(0)));
};

export function str2ab(str: string): ArrayBuffer {
    var buf = new ArrayBuffer(str.length); // 2 bytes for each char
    var bufView = new Uint8Array(buf);

    for (var i=0, strLen=str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
};
