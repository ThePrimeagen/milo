import assert from "assert";

import { Platform } from "../../Platform";
import { IDataBuffer } from "../../types";
import { HeaderTable } from "./internals/header-table";

// NOTE: The state of the header parser is not reentrant (I believe) therefore
// we can have a single state object, this may be a bad idea, but for now I am
// fine with it.  For now, i'll asssume that keeping it in an object is nicer
// than simple state variables.
const state = {
    ptr: 0
};

function readString(len: number, huffed: boolean, data: IDataBuffer): string {
    // I have to do something with this...
    let buf = data;
    let strLen = len;
    let ptr = state.ptr;

    if (huffed) {
        // reset buf to something else.
        // and length
        // and ptr
    }

    const out = Platform.utf8toa(buf, ptr, strLen);
    state.ptr += len;
    return out;
}

function readVarInt(n: number, data: IDataBuffer): number {
    /**
     * Implementation from : https://tools.ietf.org/html/rfc7541#section-5.1
     *
     // decode I from the next N bits
     if I < 2^N - 1, return I
     else
     M = 0
     repeat
     B = next octet
     I = I + (B & 127) * 2^M
     M = M + 7
     while B & 128 == 128
     return I
    */
    const twoNMinus1 = (2 ** n) - 1;

    let I = data.getUInt8(state.ptr++) & ((1 << n) - 1);

    // 5 = 0x1F;
    if (I < twoNMinus1) {
        return I;
    }

    let M = 0, B = 0;
    do {
        B = data.getUInt8(state.ptr++) & 0x7F;
        I = I + (B & 127) * (2 ** M)
        M = M + 7
    } while ((B & 128) === 128);

    return I;
}

function reset(offset: number) {
    state.ptr = offset;
}

/** Returns the number of bytes written */
function writeVarInt(n: number, value: number, data: IDataBuffer, offset: number = 0): void {
    /**
     * Implementation from : https://tools.ietf.org/html/rfc7541#section-5.1
     *
     // Encodes the bitties
     if I < 2^N - 1, encode I on N bits
     else
     encode (2^N - 1) on N bits
     I = I - (2^N - 1)
     while I >= 128
     encode (I % 128 + 128) on 8 bits
     I = I / 128
     encode I on 8 bits

    */
    const twoNMinus1 = (2 ** n) - 1;

    let ptr = offset;
    let I = n;

    // 5 = 0x1F;
    if (I < twoNMinus1) {
        data.setUInt8(state.ptr++, I);
        return;
    }

    while (I >= 128) {
        data.setUInt8(state.ptr++, (I & 127) + 128);
        I = Math.floor(I / 128);
    }

    data.setUInt8(state.ptr++, I);
}

export default function parseHeaders(dynTable: HeaderTable, data: IDataBuffer, offset: number = 0, length?: number): { [key: string]: string } {
    length = length === undefined ? data.byteLength - offset : length;

    // TODO: do we need more things?
    reset(offset);

    const headers: { [key: string]: string } = {};
    do {
        const type = data.getUInt8(state.ptr);

        // Don't do that one logic law where you flip everything around, I
        // meant to do it this way.
        const addToTable = !((type & 0x7F) > 64 || type === 0);

        //
        // https://tools.ietf.org/html/rfc7541#section-6.1
        // 6.1.  Indexed Header Field Representation
        /*
          0   1   2   3   4   5   6   7
          +---+---+---+---+---+---+---+---+
          | 1 |        Index (7+)         |
          +---+---------------------------+
        */
        if ((type & 128) === 128) {
            // read it out.
            const {
                name,
                value
            } = dynTable.getNameAndValue(readVarInt(7, data));

            headers[name] = value;

        } else if ((type & 0x7F) > 64 || (type & 0xFF) < 16) {
            // https://tools.ietf.org/html/rfc7541#section-6.2.1
            // 6.2.1.  Literal Header Field with Incremental Indexing
            // indexed name, new value.
            /*
              0   1   2   3   4   5   6   7
              +---+---+---+---+---+---+---+---+
              | 0 | 1 |      Index (6+)       |
              +---+---+-----------------------+
              | H |     Value Length (7+)     |
              +---+---------------------------+
              | Value String (Length octets)  |
              +-------------------------------+
            */
            // (type & 0xFF) < 16)
            // 6.2.2.  Literal Header Field without Indexing
            // https://tools.ietf.org/html/rfc7541#section-6.2.2
            /*
              0   1   2   3   4   5   6   7
              +---+---+---+---+---+---+---+---+
              | 0 | 0 | 0 | 0 |  Index (4+)   |
              +---+---+-----------------------+
              | H |     Value Length (7+)     |
              +---+---------------------------+
              | Value String (Length octets)  |
              +-------------------------------+
            */
            const name = dynTable.getName(readVarInt(6, data));
            const huffed = (data.getUInt8(state.ptr) & 128) === 128;

            const strLen = readVarInt(7, data);
            const str = readString(strLen, huffed, data);

            headers[name] = str;

            if (addToTable) {
                dynTable.insert(name, str);
            }
        } else if ((type & 0x7F) === 64 || type === 0) {
            // https://tools.ietf.org/html/rfc7541#section-6.2.1
            // 6.2.1.  Literal Header Field with Incremental Indexing
            // but with new name and new value
            /*
              0   1   2   3   4   5   6   7
              +---+---+---+---+---+---+---+---+
              | 0 | 1 |           0           |
              +---+---+-----------------------+
              | H |     Name Length (7+)      |
              +---+---------------------------+
              |  Name String (Length octets)  |
              +---+---------------------------+
              | H |     Value Length (7+)     |
              +---+---------------------------+
              | Value String (Length octets)  |
              +-------------------------------+

              /*
              * if type === 0
              0   1   2   3   4   5   6   7
              +---+---+---+---+---+---+---+---+
              | 0 | 0 | 0 | 0 |       0       |
              +---+---+-----------------------+
              | H |     Name Length (7+)      |
              +---+---------------------------+
              |  Name String (Length octets)  |
              +---+---------------------------+
              | H |     Value Length (7+)     |
              +---+---------------------------+
              | Value String (Length octets)  |
              +-------------------------------+
            */
            state.ptr++;
            let huffed = (data.getUInt8(state.ptr) & 128) === 128;

            const nameLen = readVarInt(7, data);
            const name = readString(nameLen, huffed, data);

            huffed = (data.getUInt8(state.ptr) & 128) === 128;
            const valueLen = readVarInt(7, data);
            const value = readString(valueLen, huffed, data);

            headers[name] = value;

            if (addToTable) {
                dynTable.insert(name, value);
            }
        }

    } while (state.ptr - offset < length);

    return headers;
};
