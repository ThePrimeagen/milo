import { NetworkErrorCode } from "./types";

export default interface INetworkError extends Error {
    code: NetworkErrorCode;
};
