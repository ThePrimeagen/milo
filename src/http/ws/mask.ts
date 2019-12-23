export default function mask(buf: Buffer, offset: number, length: number, mask: number) {
    for (let i = offset, j = 0; j < length; ++j, ++i) {
        buf[i] = buf[i] ^ (mask >>> ((j % 4) * 8) & 0xFF);
    }
};


