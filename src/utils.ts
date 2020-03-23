import Platform from "./Platform";
import IDataBuffer from "./IDataBuffer";

export function headerValue(headers: string[], header: string): string {
    const lower = header.toLowerCase() + ": ";
    for (const h of headers) {
        if (h.toLowerCase().lastIndexOf(lower, 0) === 0) {
            return h.substring(lower.length);
        }
    }
    return "";
}

export function assert(condition: any, msg: string): asserts condition {
    if (!condition) {
        Platform.assert(condition, msg);
    }
}

export function escapeData(data: Uint8Array | ArrayBuffer | IDataBuffer | string,
                           offset?: number, length?: number): string {
    if (typeof data !== "string") {
        data = Platform.utf8toa(data, offset || 0, length);
    } else if (offset && !length) {
        data = data.substr(offset);
    } else if (length) {
        data = data.substr(offset || 0, length);
    }
    return data.replace(/\r/g, "\\r").replace(/\n/g, "\\n\n");
}

