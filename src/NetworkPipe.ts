import { INetworkPipeData } from "./types";
import { EventEmitter } from "./EventEmitter";

class NetworkPipe extends EventEmitter implements INetworkPipeData {
    constructor() {
        super();
        this.idle = true;
        this.forbidReuse = false;
    }

    public idle: boolean;
    public forbidReuse: boolean;
    public firstByteWritten?: number;
    public firstByteRead?: number;
    public dnsTime?: number;
    public connectTime?: number;
};

export default NetworkPipe;
