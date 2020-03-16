import { IDataBuffer } from "../types"

function mask(buf: IDataBuffer, offset: number, length: number, mask: IDataBuffer) {
    for (let i = offset, j = 0; j < length; ++j, ++i) {
        buf.setUInt8(i, buf.getUInt8(i) ^ (mask.getUInt8(j % 4) & 0xFF));
    }
}

export default mask;


