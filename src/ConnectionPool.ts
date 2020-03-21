import Url from "url-parse";
import { ICreateTCPNetworkPipeOptions, IUnorderedMap, IPipeResult, DnsType } from "./types";
import Platform from "./Platform";
import NetworkPipe from "./NetworkPipe";
import UnorderedMap from "./UnorderedMap";
import { assert } from "./utils";

export interface ConnectionOptions {
    url: Url;
    freshConnect?: boolean;
    forbidReuse?: boolean;
    connectTimeout: number;
    dnsTimeout: number;
};

export interface PendingConnection {
    readonly id: number;

    abort(): void;
    onNetworkPipe(): Promise<NetworkPipe>;

    readonly cname?: string;
    readonly connectTime?: number;
    readonly dnsChannel?: string;
    readonly dnsTime?: number;
    readonly dnsType?: DnsType;
}

class PendingConnectionImpl implements PendingConnection {
    private pool: ConnectionPool;
    private error?: Error;
    private pipe?: NetworkPipe;
    private rejectFunction?: (reason: Error) => void;
    private resolveFunction?: (pipe: NetworkPipe) => void;

    public hostname: string;
    public port: number;

    public dnsTimeout: number;
    public connectTimeout: number;

    public dnsTime?: number;
    public connectTime?: number;
    public dnsType?: DnsType;
    public cname?: string;
    public dnsChannel?: string;

    constructor(pool: ConnectionPool, id: number, hostname: string,
                port: number, dnsTimeout: number, connectTimeout: number) {
        this.id = id;
        this.pool = pool;
        this.hostname = hostname;
        this.port = port;
        this.dnsTimeout = dnsTimeout;
        this.connectTimeout = connectTimeout;
    }

    readonly id: number;

    abort(): void {
        if (this.error || this.pipe) {
            throw new Error("Too late to abort pending connection");
        }
        this.pool.abort(this.id);
    }
    onNetworkPipe(): Promise<NetworkPipe> {
        Platform.log("onNetworkPipe called", typeof this.pipe, typeof this.error);
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

    reject(error: Error): void {
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
    pipes: NetworkPipe[];
    initializing: number;
    pending: PendingConnectionImpl[];
    ssl: boolean;
};

export class ConnectionPool {
    private _id: number;
    private _maxPoolSize: number;
    private _maxConnectionsPerHost: number;
    private _hosts: IUnorderedMap<string, HostData>;
    private _pendingFreshConnects?: PendingConnection[];

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

        // ###
        // assert(!pipe.listenerCount("data"), "Shouldn't have data callbacks anymore");
        // assert(!pipe.listenerCount("close"), "Shouldn't have close callbacks anymore");
        // assert(!pipe.listenerCount("error"), "Shouldn't have error callbacks anymore");
        const hostPort = `${pipe.hostname}:${pipe.port}`;
        let data = this._hosts.get(hostPort);
        if (!data) { // can this happen?
            data = { pipes: [], initializing: 0, pending: [], ssl: pipe.ssl, hostPort };
            this._hosts.set(hostPort, data);
        }

        if (pipe.closed) {
            const idx = data.pipes.indexOf(pipe);
            assert(idx !== -1);
            data.pipes.splice(idx, 1);
        } else {
            pipe.idle = true;
            data.pipes.push(pipe);
        }
        this.processHost(data);
    }

    // what to do for people who need to wait?, need an id
    requestConnection(options: ConnectionOptions): Promise<PendingConnection> {
        return new Promise((resolve, reject) => {
            let port: number = 0;
            if (options.url.port) {
                port = parseInt(options.url.port, 10);
            }

            // Platform.trace("Request#send port", port);
            let ssl = false;
            switch (options.url.protocol) {
            case "https:":
            case "wss:":
                ssl = true;
                if (!port) {
                    port = 443;
                }
                break;
            default:
                if (!port)
                    port = 80;
                break;
            }

            const hostname = options.url.hostname;
            if (!hostname || port < 1 || port > 65535) {
                reject(new Error("Invalid url " + options.url));
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

            const pending = new PendingConnectionImpl(this, ++this._id, hostname, port,
                                                      options.dnsTimeout, options.connectTimeout);
            resolve(pending);
            if (this._id === Number.MAX_SAFE_INTEGER) {
                this._id = 0;
            }

            if (options.freshConnect) {
                const tcpOpts = {
                    hostname: pending.hostname,
                    port: pending.port,
                    dnsTimeout: pending.dnsTimeout,
                    connectTimeout: pending.connectTimeout,
                    ipVersion: 4 // gotta do happy eyeballs and send off multiple tcp network pipe things
                } as ICreateTCPNetworkPipeOptions;
                Platform.createTCPNetworkPipe(tcpOpts).then((pipeResult: IPipeResult) => {
                    Platform.trace(`Got tcp connection for ${hostPort} with socket ${pipeResult.pipe.socket}`);
                    if (ssl) {
                        Platform.trace(`Requesting ssl pipe for ${hostPort} with socket ${pipeResult.pipe.socket}`);
                        return Platform.createSSLNetworkPipe(pipeResult);
                    } else {
                        return pipeResult;
                    }
                }).then((pipeResult: IPipeResult) => {
                    pending.resolve(pipeResult.pipe);
                }).catch((error: Error) => {
                    pending.reject(error);
                });
                return;

                // if (this._maxPoolSize > 0 && this._connectionCount >= this._maxPoolSize) {
                //     const pending = new PendingConnectionImpl(++this._id);
                //     if (this._id == Number.MAX_SAFE_INTEGER) {
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
                assert(pending);
                Platform.trace(`found idle connection for ${data.hostPort} socket: ${pipe.socket}`);
                pending.resolve(pipe);
                return;
            }
        }

        if (data.pipes.length + data.initializing < this._maxConnectionsPerHost) {
            const pending = data.pending.shift();
            assert(pending);
            const tcpOpts = {
                hostname: pending.hostname,
                port: pending.port,
                dnsTimeout: pending.dnsTimeout,
                connectTimeout: pending.connectTimeout,
                ipVersion: 4 // gotta do happy eyeballs and send off multiple tcp network pipe things
            } as ICreateTCPNetworkPipeOptions;

            ++data.initializing;
            Platform.trace(`Requesting tcp connection for ${data.hostPort}`);
            Platform.createTCPNetworkPipe(tcpOpts).then((pipeResult: IPipeResult) => {
                const pipe = pipeResult.pipe;
                Platform.trace(`Got tcp connection for ${data.hostPort} with socket ${pipe.socket}`);
                if (data.ssl) {
                    Platform.trace(`Requesting ssl pipe for ${data.hostPort} with socket ${pipe.socket}`);
                    return Platform.createSSLNetworkPipe(pipeResult);
                } else {
                    return pipeResult;
                }
            }).then((pipeResult: IPipeResult) => {
                const pipe = pipeResult.pipe;
                pipe.idle = false;
                assert(data);
                --data.initializing;
                data.pipes.push(pipe);
                pending.resolve(pipe);
            }).catch((error: Error) => {
                --data.initializing;
                pending.reject(error);
                this.processHost(data);
            });
        }
    }
}

export default new ConnectionPool();
