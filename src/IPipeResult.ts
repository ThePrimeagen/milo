import IConnectionData from "./IConnectionData";
import NetworkPipe from "./NetworkPipe";
import { DnsType } from "./types";

export default interface IPipeResult extends IConnectionData {
    pipe: NetworkPipe;
};
