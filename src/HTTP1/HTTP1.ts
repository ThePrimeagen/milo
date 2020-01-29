import { HTTP, HTTPMethod, HTTPTransferEncoding, HTTPRequest, NetworkPipe } from "../types";

export class HTTP1 implements HTTP {
    readonly version = "HTTP1";
    pipe?: NetworkPipe;
    request?: HTTPRequest;

    send(pipe: NetworkPipe, request: HTTPRequest): boolean {
        this.pipe = pipe;
        this.request = request;

        return false;
    }

    onheaders?: (headers: HTTPTransferEncoding) => void;
    ondata?: (data: ArrayBuffer, offset: number, length: number) => void;
    onfinished?: () => void;
    onerror?: () => void;
};

