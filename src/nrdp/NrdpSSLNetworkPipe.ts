import {
    ICreateSSLNetworkPipeOptions, INetworkPipe, IDataBuffer
} from "../types";
import NetworkPipe from "../NetworkPipe";
import Platform from "./Platform";
import DataBuffer from "./DataBuffer";
import N = nrdsocket;

// have to redeclare assert since NrdpPlatform doesn't declare assert as asserting
function assert(condition: any, msg?: string): asserts condition {
    Platform.assert(condition, msg);
}

class NrdpSSLNetworkPipe extends NetworkPipe implements INetworkPipe {
    private sslInstance: N.Struct;
    private inputBio: N.Struct;
    private outputBio: N.Struct;
    private pipe: INetworkPipe;
    private connected: boolean;
    private writeBuffers: (Uint8Array | ArrayBuffer | string | IDataBuffer)[];
    private writeBufferOffsets: number[];
    private writeBufferLengths: number[];
    private connectedCallback?: (error?: Error) => void;
    private buffer?: IDataBuffer;

    constructor(options: ICreateSSLNetworkPipeOptions, callback: (error?: Error) => void) {
        super();
        this.connectedCallback = callback;
        this.connected = false;
        this.writeBuffers = [];
        this.writeBufferOffsets = [];
        this.writeBufferLengths = [];

        this.pipe = options.pipe;
        this.sslInstance = Platform.ssl.createSSL();

        const memMethod = Platform.ssl.BIO_s_mem();
        this.inputBio = Platform.ssl.BIO_new(memMethod);
        Platform.ssl.BIO_ctrl(this.inputBio, Platform.ssl.BIO_C_SET_BUF_MEM_EOF_RETURN, -1, undefined);

        this.outputBio = Platform.ssl.BIO_new(memMethod);

        Platform.ssl.BIO_ctrl(this.outputBio, Platform.ssl.BIO_C_SET_BUF_MEM_EOF_RETURN, -1, undefined);
        this.pipe.on("data", () => {
            const read = this.pipe.read(Platform.scratch, 0, Platform.scratch.byteLength);
            if (read === -1) {
                assert(N.errno === N.EWOULDBLOCK || N.errno === N.EAGAIN || this.pipe.closed,
                       "Should be closed already");
                return;
            }

            if (read === 0) {
                assert(this.pipe.closed, "Should be closed already");
                return;
            }
            Platform.trace("got data", read);
            // throw new Error("fiskball");
            const written = Platform.ssl.BIO_write(this.inputBio, Platform.scratch, 0, read);
            Platform.trace("wrote", read, "bytes to inputBio =>", written);
            if (!this.connected) {
                this._connect();
            }
            if (this.connected) {
                const pending = Platform.ssl.BIO_ctrl_pending(this.inputBio);
                if (pending) {
                    this.emit("data");
                }
            }
        });
        this.pipe.once("close", () => {
            this.emit("close");
        });
        this.pipe.on("error", (error: Error) => {
            Platform.error("got error", error);
            this._error(error);
        });

        Platform.ssl.SSL_set_bio(this.sslInstance, this.inputBio, this.outputBio);
        this._connect();
    }

    get ipAddress() { return this.pipe.ipAddress; }
    get dns() { return this.pipe.dns; }
    get dnsChannel() { return this.pipe.dnsChannel; }
    get closed() { return this.pipe.closed; }
    get hostname() { return this.pipe.hostname; }
    get port() { return this.pipe.port; }
    get ssl() { return true; }
    get fd() { return this.pipe.fd; }
    get dnsTime() { return this.pipe.dnsTime; }
    get connectTime() { return this.pipe.connectTime; }

    removeEventHandlers() {
        this.removeAllListeners();
    }

    write(buf: IDataBuffer | string, offset?: number, length?: number): void {
        if (typeof buf === 'string') {
            length = buf.length;
        } else if (length === undefined) {
            length = buf.byteLength;
        }
        offset = offset || 0;

        if (!length)
            throw new Error("0 length write");

        Platform.trace("write called", buf, offset, length);

        if (!this.connected) {
            throw new Error("SSLNetworkPipe is not connected");
        }

        const written = (this.writeBuffers.length
                         ? -1
                         : Platform.ssl.SSL_write(this.sslInstance, buf, offset, length));
        Platform.trace("wrote to output bio", length, "=>", written);

        if (written === -1) {
            this.writeBuffers.push(buf);
            this.writeBufferOffsets.push(offset || 0);
            this.writeBufferLengths.push(length);
        } else {
            this._flushOutputBio();
        }
    }

    read(buf: IDataBuffer, offset: number, length: number): number {
        if (this.buffer) {
            const byteLength = this.buffer.byteLength;
            if (length >= byteLength) {
                Platform.bufferSet(buf, offset, this.buffer, 0, byteLength);
                this.buffer = undefined;
                return byteLength;
            } else {
                Platform.bufferSet(buf, offset, this.buffer, 0, length);
                this.buffer = this.buffer.slice(length);
                return length;
            }
        }

        Platform.trace("someone's calling read on ", this.pipe.fd, length,
                       Platform.ssl.SSL_pending(this.sslInstance));
        const read = Platform.ssl.SSL_read(this.sslInstance, buf, offset, length);
        if (read <= 0) {
            const err = Platform.ssl.SSL_get_error(this.sslInstance, read);
            // Platform.error("got err", err);
            this._flushOutputBio();
            switch (err) {
            case Platform.ssl.SSL_ERROR_NONE:
                Platform.error("got error none");
                break;
            case Platform.ssl.SSL_ERROR_SSL:
                Platform.error("got error ssl");
                break;
            case Platform.ssl.SSL_ERROR_WANT_READ:
                Platform.trace("got error want read");
                break;
            case Platform.ssl.SSL_ERROR_WANT_WRITE:
                Platform.trace("got error want write");
                break;
            case Platform.ssl.SSL_ERROR_WANT_X509_LOOKUP:
                Platform.error("got error want x509 lookup");
                break;
            case Platform.ssl.SSL_ERROR_SYSCALL:
                Platform.error("got error syscall");
                break;
            case Platform.ssl.SSL_ERROR_ZERO_RETURN:
                this.close();
                Platform.trace("got error zero return");
                break;
            case Platform.ssl.SSL_ERROR_WANT_CONNECT:
                Platform.error("got error want connect");
                break;
            case Platform.ssl.SSL_ERROR_WANT_ACCEPT:
                Platform.error("got error want accept");
                break;
            case Platform.ssl.SSL_ERROR_WANT_ASYNC:
                Platform.error("got error want async");
                break;
            case Platform.ssl.SSL_ERROR_WANT_ASYNC_JOB:
                Platform.error("got error want async job");
                break;
            case Platform.ssl.SSL_ERROR_WANT_CLIENT_HELLO_CB:
                Platform.error("got error want client hello cb");
                break;
            default:
                Platform.error("got error other", err);
                break;
            }
        }

        // Platform.trace("SSL_read called", read);
        return read;
    }

    unread(buf: ArrayBuffer | Uint8Array | IDataBuffer): void {
        if (this.buffer) {
            this.buffer.bufferLength = this.buffer.byteLength + buf.byteLength;
            this.buffer.set(0, buf);
        } else if (buf instanceof DataBuffer) {
            this.buffer = buf;
        } else {
            this.buffer = new DataBuffer(buf);
        }
        this.emit("data");
    }

    close(): void {
        this.pipe.close();
    }

    private _flushOutputBio() {
        const pending = Platform.ssl.BIO_ctrl_pending(this.outputBio);
        // assert(pending <= this.scratch.byteLength,
        //        "Pending too large. Probably have to increase scratch buffer size");
        if (pending > 0) {
            // should maybe pool these arraybuffers
            const buf = new ArrayBuffer(pending);
            const read = Platform.ssl.BIO_read(this.outputBio, buf, 0, pending);
            assert(read === pending, "Read should be pending");
            // Platform.trace("writing", read, Platform.ssl.BIO_ctrl_pending(this.outputBio));
            this.pipe.write(buf, 0, read);
            // Platform
        }
    }

    private _connect() {
        assert(this.connectedCallback);
        const ret = Platform.ssl.SSL_connect(this.sslInstance);
        // Platform.trace("CALLED CONNECT", ret);
        if (ret <= 0) {
            const err = Platform.ssl.SSL_get_error(this.sslInstance, ret);
            // Platform.trace("GOT ERROR FROM SSL_CONNECT", err);
            if (Platform.ssl.SSL_get_error(this.sslInstance, ret) === Platform.ssl.SSL_ERROR_WANT_READ) {
                this._flushOutputBio();
            } else {
                Platform.error("BIG FAILURE", Platform.ssl.SSL_get_error(this.sslInstance, ret), N.errno);
                this.connectedCallback(new Error(`SSL_connect failure ${Platform.ssl.SSL_get_error(this.sslInstance, ret)} ${N.errno}`));
                this.connectedCallback = undefined;
            }
        } else {
            // Platform.trace("sheeeet", ret);
            assert(ret === 1, "This should be 1");
            // Platform.trace("we're connected");
            this.connected = true;
            this.firstByteWritten = this.pipe.firstByteWritten;
            this.firstByteRead = this.pipe.firstByteRead;
            assert(this.connectedCallback);
            this.connectedCallback();
            this.connectedCallback = undefined;
        }
    }

    private _error(error: Error): void {
        // ### have to shut down all sorts of ssl stuff
        this.emit("error", error);
    }
};

export default function createSSLNetworkPipe(options: ICreateSSLNetworkPipeOptions): Promise<INetworkPipe> {
    return new Promise<INetworkPipe>((resolve, reject) => {
        const sslPipe = new NrdpSSLNetworkPipe(options, (error?: Error) => {
            // platform.trace("connected or something", error);
            if (error) {
                reject(error);
            } else {
                resolve(sslPipe);
            }
        });
    });
};
