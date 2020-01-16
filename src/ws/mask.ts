export default function mask(buf: Uint8Array, offset: number, length: number, mask: Uint8Array) {
    for (let i = offset, j = 0; j < length; ++j, ++i) {
        buf[i] = buf[i] ^ ((mask[j % 4]) & 0xFF);
    }
};


