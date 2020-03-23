import EventEmitter from "./EventEmitter";
import IHTTPRequest from "./IHTTPRequest";
import NetworkPipe from "./NetworkPipe";

export default interface IHTTP extends EventEmitter {
    send(pipe: NetworkPipe, request: IHTTPRequest): boolean;
    upgrade: boolean;
};
