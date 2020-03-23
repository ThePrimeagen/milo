import NetworkPipe from "./NetworkPipe";
import { DnsType } from "./types";
import IConnectionData from "./IConnectionData";

export default interface IPendingConnection extends IConnectionData {
    readonly id: number;

    abort(): void;
    onNetworkPipe(): Promise<NetworkPipe>;
}
