import IEventEmitter from "./IEventEmitter";
import IHTTPRequest from "./IHTTPRequest";
import NetworkPipe from "./NetworkPipe";

export default interface IHTTP extends IEventEmitter {
    httpVersion: string;
    send(pipe: NetworkPipe, request: IHTTPRequest): boolean;

    timeToFirstByteRead?: number;
    timeToFirstByteWritten?: number;

    upgrade: boolean;
};
