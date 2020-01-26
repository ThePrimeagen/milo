import Platform from "./Platform";

export function headerValue(headers: string[], header: string): string {
    const lower = header.toLowerCase() + ": ";
    for (let i = 0; i < headers.length; ++i) {
        const h = headers[i].toLowerCase();
        if (h.lastIndexOf(lower, 0) === 0) {
            return headers[i].substring(lower.length);
        }
    }
    return "";
}

export function assert(condition: any, msg?: string): asserts condition {
    if (!condition) {
        Platform.assert(condition, msg);
    }
}

export function escapeData(data: Uint8Array | ArrayBuffer | string, offset?: number, length?: number): string {
    if (typeof data !== "string") {
        data = Platform.utf8toa(data, offset || 0, length);
    } else if (offset && !length) {
        data = data.substr(offset);
    } else if (length) {
        data = data.substr(offset || 0, length);
    }
    return data.replace(/\r/g, "\\r").replace(/\n/g, "\\n\n");
}
