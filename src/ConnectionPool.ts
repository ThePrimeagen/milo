import DataBuffer from "./DataBuffer";
import IConnectionOptions from "./IConnectionOptions";
import ICreateSSLNetworkPipeOptions from "./ICreateSSLNetworkPipeOptions";
import ICreateTCPNetworkPipeOptions from "./ICreateTCPNetworkPipeOptions";
import INetworkError from "./INetworkError";
import IPendingConnection from "./IPendingConnection";
import IPipeResult from "./IPipeResult";
import IUnorderedMap from "./IUnorderedMap";
import NetworkError from "./NetworkError";
import NetworkPipe from "./NetworkPipe";
import Platform from "./Platform";
import UnorderedMap from "./UnorderedMap";
import assert from "./utils/assert.macro";
import { DnsType, NetworkErrorCode } from "./types";

class PendingConnectionImpl implements IPendingConnection {
    private pool: ConnectionPool;
    private error?: INetworkError;
    private pipe?: NetworkPipe;
    private rejectFunction?: (reason: INetworkError) => void;
    private resolveFunction?: (pipe: NetworkPipe) => void;

    public hostname: string;
    public port: number;

    public connectionOptions: IConnectionOptions;
    public dnsTime: number;
    public connectTime: number;
    public dnsType: DnsType;
    public dnsWireTime: number;
    public cname: string;
    public dnsChannel: string;
    public socketReused: boolean;
    public sslVersion?: string;
    public sslSessionResumed?: boolean;
    public sslHandshakeTime?: number;

    constructor(pool: ConnectionPool, id: number, hostname: string, port: number, options: IConnectionOptions) {
        this.id = id;
        this.pool = pool;
        this.hostname = hostname;
        this.port = port;
        this.connectionOptions = options;
        this.cname = "";
        this.dnsChannel = "";
        this.dnsType = "unknown";
        this.connectTime = 0;
        this.dnsWireTime = 0;
        this.dnsTime = 0;
        this.socketReused = false;
    }

    readonly id: number;

    abort(): void {
        if (this.error || this.pipe) {
            throw new Error("Too late to abort pending connection");
        }
        this.pool.abort(this.id);
    }
    onNetworkPipe(): Promise<NetworkPipe> {
        assert(!this.resolveFunction, "must not have resolve");
        assert(!this.rejectFunction, "must not have reject");
        return new Promise((resolve, reject) => {
            if (this.error) {
                reject(this.error);
                return;
            }

            if (this.pipe) {
                resolve(this.pipe);
                return;
            }

            this.resolveFunction = resolve;
            this.rejectFunction = reject;
        });
    }

    resolve(pipe: NetworkPipe): void {
        assert(!this.pipe, "must not have pipe");
        assert(!this.error, "must not have error");

        this.pipe = pipe;
        Platform.trace(`resolving with a pipe ${pipe.hostname}:${pipe.port} ${typeof this.resolveFunction}`);
        if (this.resolveFunction) {
            this.resolveFunction(pipe);
        }
    }

    reject(error: INetworkError): void {
        assert(!this.pipe, "must not have pipe");
        assert(!this.error, "must not have error");

        this.error = error;
        if (this.rejectFunction) {
            this.rejectFunction(error);
        }
    }
};

interface HostData {
    hostPort: string;
    pipes: NetworkPipe[]; // ### TODO might need to keep some data for dns wire time and such
    initializing: number;
    pending: PendingConnectionImpl[];
    ssl: boolean;
};

export default class ConnectionPool {
    private _id: number;
    private _maxPoolSize: number;
    private _maxConnectionsPerHost: number;
    private _hosts: IUnorderedMap<string, HostData>;
    private _pendingFreshConnects?: IPendingConnection[];

    constructor() {
        this._id = 0;
        this._maxPoolSize = 0;
        this._maxConnectionsPerHost = 3;
        this._hosts = new UnorderedMap();
    }

    get maxPoolSize() {
        return this._maxPoolSize;
    }

    set maxPoolSize(value: number) {
        this._maxPoolSize = value;
    }

    abort(id: number): void {
        this._hosts.forEach((key, value) => {
            if (value.pending) {
                for (let i = 0; i < value.pending.length; ++i) {
                    if (value.pending[i].id === id) {
                        value.pending.splice(i, 1);
                        return false;
                    }
                }
            }
            return true;
        });

        if (this._pendingFreshConnects) {
            for (let i = 0; i < this._pendingFreshConnects.length; ++i) {
                if (this._pendingFreshConnects[i].id === id) {
                    if (this._pendingFreshConnects.length === 1) {
                        this._pendingFreshConnects = undefined;
                    } else {
                        this._pendingFreshConnects.splice(i, 1);
                    }
                    return;
                }
            }
        }
        throw new Error("Can't find request to abort with id " + id);
    }

    finish(pipe: NetworkPipe): void {
        Platform.trace(`pipe returned to the nest ${pipe.hostname}:${pipe.port} forbidReuse ${pipe.forbidReuse} closed ${pipe.closed} socket ${pipe.socket}`);
        if (pipe.forbidReuse) {
            if (!pipe.closed) {
                pipe.close();
            }
            return;
        }

        assert(!pipe.listenerCount("data"), "Shouldn't have data callbacks anymore");
        assert(!pipe.listenerCount("close"), "Shouldn't have close callbacks anymore");
        assert(!pipe.listenerCount("error"), "Shouldn't have error callbacks anymore");

        const hostPort = `${pipe.hostname}:${pipe.port}`;
        const data = this._hosts.get(hostPort);
        assert(data, "Must have data");

        if (pipe.closed) {
            this.onClose(data, pipe);
        } else {
            pipe.on("close", this.onClose.bind(this, data, pipe));
            pipe.on("data", this.onData.bind(this, pipe));
            pipe.idle = true;
            pipe.clearStats();
            assert(data.pipes.indexOf(pipe) !== -1, "It should be in here");
        }
        this.processHost(data);
    }

    // what to do for people who need to wait?, need an id
    requestConnection(options: IConnectionOptions): Promise<IPendingConnection> {
        return new Promise((resolve, reject) => {
            let port = options.url.portNumber;

            // Platform.trace("Request#send port", port);
            let ssl = false;
            switch (options.url.scheme) {
            case "https:":
            case "wss:":
                ssl = true;
                break;
            default:
                if (!port)
                    port = 80;
                break;
            }

            const hostname = options.url.host;
            if (!hostname) {
                reject(new NetworkError(NetworkErrorCode.InvalidUrl, "Invalid url " + options.url));
                return;
            }


            const hostPort = `${hostname}:${port}`;
            Platform.trace(`request for connection ${options.url} -> ${hostPort}`);
            let data = this._hosts.get(hostPort);

            if ((port === 80 && ssl) || (port === 443 && !ssl) || (data && data.ssl !== ssl)) {
                // this is completely asinine but it's simple enough to allow
                options.freshConnect = true;
                options.forbidReuse = true;
            }

            const pending = new PendingConnectionImpl(this, ++this._id, hostname, port, options);
            resolve(pending);
            if (this._id === 2147483647) {
                this._id = 0;
            }

            if (options.freshConnect) {
                const tcpOpts = {
                    hostname: pending.hostname,
                    port: pending.port,
                    dnsTimeout: options.dnsTimeout,
                    connectTimeout: options.connectTimeout,
                    ipVersion: 4 // gotta do happy eyeballs and send off multiple tcp network pipe things
                } as ICreateTCPNetworkPipeOptions;
                Platform.createTCPNetworkPipe(tcpOpts).then((pipeResult: IPipeResult) => {
                    Platform.trace(`Got tcp connection for ${hostPort} with socket ${pipeResult.pipe.socket}`);
                    if (ssl) {
                        Platform.trace(`Requesting ssl pipe for ${hostPort} with socket ${pipeResult.pipe.socket}`);
                        const opts = pipeResult as ICreateSSLNetworkPipeOptions;
                        opts.tlsv13 = options.tlsv13;
                        return Platform.createSSLNetworkPipe(opts);
                    } else {
                        return pipeResult;
                    }
                }).then((pipeResult: IPipeResult) => {
                    pending.resolve(pipeResult.pipe);
                }).catch((error: INetworkError) => {
                    pending.reject(error);
                });
                return;

                // if (this._maxPoolSize > 0 && this._connectionCount >= this._maxPoolSize) {
                //     const pending = new PendingConnectionImpl(++this._id);
                //     if (this._id == 2147483647) {
                //         this._id = 0;
                //     }

                //     if (!this._pendingFreshConnects) {
                //         this._pendingFreshConnects = [];
                //     }
                //     this._pendingFreshConnects.push(pending);
                //     const prom = new Promise<PendingConnection>((resolve, reject) {
                //         pending.resolve = resolve;
                //         pending.reject = reject;
                //     });
                // }
            }

            if (!data) {
                data = { pipes: [], initializing: 0, pending: [], ssl, hostPort };
                this._hosts.set(hostPort, data);
            }

            data.pending.push(pending);
            this.processHost(data);
        });
    }

    // called when there's something to do and a pending
    private processHost(data: HostData): void {
        Platform.trace(`processHost(${data.hostPort} -> ${data.pending.length} pending`);
        if (!data.pending.length)
            return;

        for (const pipe of data.pipes) {
            assert(!pipe.closed, "This shouldn't be closed");
            if (pipe.idle) {
                pipe.idle = false;
                const pending = data.pending.shift();
                assert(pending, "must have pending");
                Platform.trace(`found idle connection for ${data.hostPort} socket: ${pipe.socket}`);
                assert(pipe.listenerCount("close") === 1, "Should have exactly one listener for close");
                assert(pipe.listenerCount("data") === 1, "Should have exactly one listener for data");
                pipe.removeAllListeners("close");
                pipe.removeAllListeners("data");
                pending.socketReused = true;
                pending.resolve(pipe);
                return;
            }
        }

        if (data.pipes.length + data.initializing < this._maxConnectionsPerHost) {
            const pending = data.pending.shift();
            assert(pending, "must have pending");
            const tcpOpts = {
                hostname: pending.hostname,
                port: pending.port,
                dnsTimeout: pending.connectionOptions.dnsTimeout,
                connectTimeout: pending.connectionOptions.connectTimeout,
                ipVersion: 4 // gotta do happy eyeballs and send off multiple tcp network pipe things
            } as ICreateTCPNetworkPipeOptions;

            ++data.initializing;
            Platform.trace(`Requesting tcp connection for ${data.hostPort}`);
            Platform.createTCPNetworkPipe(tcpOpts).then((pipeResult: IPipeResult) => {
                const pipe = pipeResult.pipe;
                Platform.trace(`Got tcp connection for ${data.hostPort} with socket ${pipe.socket}`);
                if (data.ssl) {
                    Platform.trace(`Requesting ssl pipe for ${data.hostPort} with socket ${pipe.socket}`);
                    const sslOpts = pipeResult as ICreateSSLNetworkPipeOptions;
                    sslOpts.tlsv13 = pending.connectionOptions.tlsv13;
                    return Platform.createSSLNetworkPipe(pipeResult);
                } else {
                    return pipeResult;
                }
            }).then((pipeResult: IPipeResult) => {
                const pipe = pipeResult.pipe;
                pending.cname = pipeResult.cname;
                pending.connectTime = pipeResult.connectTime;
                pending.dnsChannel = pipeResult.dnsChannel;
                pending.dnsTime = pipeResult.dnsTime;
                pending.dnsType = pipeResult.dnsType;
                pending.dnsWireTime = pipeResult.dnsWireTime;
                pending.socketReused = pipeResult.socketReused;
                if (pipeResult.sslVersion) {
                    pending.sslVersion = pipeResult.sslVersion;
                    assert(typeof pipeResult.sslSessionResumed !== "undefined", "must have sslSessionResumed");
                    pending.sslSessionResumed = pipeResult.sslSessionResumed;
                    assert(typeof pipeResult.sslHandshakeTime !== "undefined", "must have sslHandshakeTime");
                    pending.sslHandshakeTime = pipeResult.sslHandshakeTime;
                }
                pipe.idle = false;
                assert(data, "must have data");
                --data.initializing;
                data.pipes.push(pipe);
                pending.resolve(pipe);
            }).catch((error: any) => {
                if (!(error instanceof NetworkError)) {
                    error.code = NetworkErrorCode.UnknownError;
                }
                --data.initializing;
                pending.reject(error);
                this.processHost(data);
            });
        }
    }

    private onClose(data: HostData, pipe: NetworkPipe): void {
        const idx = data.pipes.indexOf(pipe);
        assert(idx !== -1, "where the pipe?");
        if (data.pipes.length === 1 && !data.pending.length && !data.initializing) {
            const hostPort = `${pipe.hostname}:${pipe.port}`;
            // Platform.log("deleting the whole thing", data);
            this._hosts.delete(hostPort);
            return;
        }
        data.pipes.splice(idx, 1);
    }

    private onData(pipe: NetworkPipe): void {
        while (true) {
            // We shouldn't really get any data at this point, this is
            // to monitor if the pipe has been closed
            const buf = new DataBuffer(32);
            assert(!pipe.closed, "Should not be closed yet");
            const read = pipe.read(buf, 0, 32, true);
            if (read <= 0) {
                break;
            }
            pipe.stash(buf, 0, read);
        }
    }
}
