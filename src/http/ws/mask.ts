export default function mask(buf: Buffer, offset: number, length: number, mask: Buffer) {
    for (let i = offset, j = 0; j < length; ++j, ++i) {
        buf[i] = buf[i] ^ ((mask[j % 4]) & 0xFF);
    }
};


