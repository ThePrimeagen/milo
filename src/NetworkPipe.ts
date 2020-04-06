import EventEmitter from "./EventEmitter";
import DataBuffer from "./DataBuffer";
import IDataBuffer from "./IDataBuffer";
import IPlatform from "./IPlatform";
import assert from './utils/assert.macro';

let pipeId = 0;
export abstract class NetworkPipe extends EventEmitter {
    protected platform: IPlatform;
    private stashBuffer?: IDataBuffer;

    constructor(platform: IPlatform) {
        super();
        this.idle = false;
        if (++pipeId === 2147483647) {
            pipeId = 1;
        }
        this.id = pipeId;
        this.platform = platform;
        this.forbidReuse = false;
    }

    // concrete properties
    idle: boolean;
    forbidReuse: boolean;

    readonly id: number;

    // abstract properties
    abstract bytesRead: number;
    abstract bytesWritten: number;
    abstract hostname: string;
    abstract port: number;
    abstract readonly ipAddress: string;
    abstract socket: number; // socket
    abstract firstByteWritten: number;
    abstract firstByteRead: number;

    abstract readonly ssl: boolean;
    abstract readonly closed: boolean;

    // abstract methods
    abstract removeEventHandlers(): void;
    abstract write(buf: IDataBuffer | Uint8Array | ArrayBuffer | string, offset: number, length: number): void;
    abstract write(buf: string): void;
    abstract read(buf: ArrayBuffer | IDataBuffer, offset: number, length: number, nostash?: boolean): number;

    abstract close(): void;
    abstract clearStats(): void;

    // concrete methods
    stash(buf: ArrayBuffer | Uint8Array | IDataBuffer, offset: number, length: number): void {
        if (length === undefined) {
            length = buf.byteLength - offset;
        }
        assert(length > 0, "Must have length");
        this.platform.log("NetworkPipe#stash", offset, length);
        if (this.stashBuffer) {
            this.stashBuffer.bufferLength = this.stashBuffer.bufferLength + length;
            this.stashBuffer.set(this.stashBuffer.bufferLength - length, buf, offset, length);
        } else if (buf instanceof DataBuffer) {
            this.stashBuffer = buf.subarray(offset, length);
        } else {
            this.stashBuffer = new DataBuffer(buf, offset, length);
        }
    }

    unstash(buf: IDataBuffer | ArrayBuffer | Uint8Array, offset: number, length: number): number {
        if (this.stashBuffer) {
            const byteLength = this.stashBuffer.byteLength;
            if (length >= byteLength) {
                this.platform.bufferSet(buf, offset, this.stashBuffer, 0, byteLength);
                this.stashBuffer = undefined;
                // this.platform.log("NetworkPipe#unstash#ALL", offset, length, byteLength);
                return byteLength;
            }

            this.platform.bufferSet(buf, offset, this.stashBuffer, 0, length);
            this.stashBuffer.setView(this.stashBuffer.byteOffset + length, this.stashBuffer.byteLength - length);
            this.platform.log("NetworkPipe#unstash#PARTIAL", offset, length, this.stashBuffer.byteLength);
            return length;
        }
        return -1;
    }

    hasStash() {
        return !!this.stashBuffer;
    }
};

export default NetworkPipe;
