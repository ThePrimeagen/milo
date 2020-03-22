import EventEmitter from "./EventEmitter";
import DataBuffer from "./DataBuffer";
import IDataBuffer from "./IDataBuffer";
import IPlatform from "./IPlatform";

// have to redeclare assert since NrdpPlatform doesn't declare assert as asserting
function assert(platform: IPlatform, condition: any, msg?: string): asserts condition {
    platform.assert(condition, msg);
}

export abstract class NetworkPipe extends EventEmitter {
    protected platform: IPlatform;
    private buffer?: IDataBuffer;

    constructor(platform: IPlatform) {
        super();
        this.idle = false;
        this.platform = platform;
        this.forbidReuse = false;
    }

    // concrete properties
    idle: boolean;
    forbidReuse: boolean;
    firstByteWritten?: number;
    firstByteRead?: number;

    // abstract properties
    abstract hostname: string;
    abstract readonly ipAddress: string;
    abstract port: number;
    abstract socket: number; // socket

    abstract readonly ssl: boolean;
    abstract readonly closed: boolean;

    // abstract methods
    abstract removeEventHandlers(): void;
    abstract write(buf: IDataBuffer | Uint8Array | ArrayBuffer | string, offset: number, length: number): void;
    abstract write(buf: string): void;
    abstract read(buf: ArrayBuffer | IDataBuffer, offset: number, length: number): number;

    abstract close(): void;

    // concrete methods
    stash(buf: ArrayBuffer | Uint8Array | IDataBuffer, offset: number, length?: number): void {
        if (length === undefined) {
            length = buf.byteLength - offset;
        }
        assert(this.platform, length > 0, "Must have length");
        if (this.buffer) {
            this.buffer.bufferLength = this.buffer.bufferLength + buf.byteLength;
            this.buffer.set(this.buffer.bufferLength - buf.byteLength, buf);
        } else if (buf instanceof DataBuffer) {
            this.buffer = buf;
        } else {
            this.buffer = new DataBuffer(buf);
        }
        this.emit("data");
    }

    unstash(buf: IDataBuffer, offset: number, length: number): number {
        if (this.buffer) {
            const byteLength = this.buffer.byteLength;
            if (length >= byteLength) {
                buf.set(offset, this.buffer, 0, byteLength);
                this.buffer = undefined;
                return byteLength;
            }

            buf.set(offset, this.buffer, 0, length);
            this.buffer.setView(this.buffer.byteOffset + length, this.buffer.byteLength - length);
            return length;
        }
        return -1;
    }

    hasStash() {
        return !!this.buffer;
    }
};

export default NetworkPipe;
