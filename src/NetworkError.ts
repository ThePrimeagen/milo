import { NetworkErrorCode, networkErrorCodeToString } from "./types";
import INetworkError from "./INetworkError";

export default class NetworkError extends Error implements INetworkError {
    constructor(code: NetworkErrorCode, message?: string) {
        super(message || networkErrorCodeToString(code));
        this.code = code;
    }
    public readonly code: NetworkErrorCode;
};
