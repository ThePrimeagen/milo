import EventEmitter from "./EventEmitter";
import IHTTPRequest from "./IHTTPRequest";
import NetworkPipe from "./NetworkPipe";

export default interface IHTTP extends EventEmitter {
    httpVersion: string;
    send(pipe: NetworkPipe, request: IHTTPRequest): boolean;

    timeToFirstByteRead?: number;
    timeToFirstByteWritten?: number;

    upgrade: boolean;
};
