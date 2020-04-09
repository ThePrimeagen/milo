import { IpVersion } from "./types";

function resolveUrl(url: string, base?: string | Url) {
    if (!base || url.indexOf("://") !== -1 || url.lastIndexOf("data:", 0) === 0) {
        return url;
    }

    if (typeof base === "object")
        base = base.href;

    const q = base.indexOf("?");

    let s = q === -1 ? base.lastIndexOf("/") : base.lastIndexOf("/", q);
    if (s < 8)
        s = -1;
    let baseUrl = s === -1 ? base + "/" : base.substr(0, s + 1);
    let slash = -1;
    if (url[0] === "/") {
        slash = baseUrl.indexOf("/", 8);
        if (slash !== -1) {
            baseUrl = baseUrl.substr(0, slash);
        }
    }
    return baseUrl + url;
}

export default class Url {
    constructor(s?: string, base?: string | Url) {
        this.portNumber = 0;
        this._hierPart = -1;
        this._host = -1;
        this._port = -1;
        this._path = -1;
        this._query = -1;
        this._fragment = -1;
        if (!s) {
            this.href = "";
            return;
        }

        this.href = resolveUrl(s, base);
        let slash = this.href.indexOf("/");
        const scheme = this.href.indexOf(":");

        this._path = this._host = this._port = -1;
        this.portNumber = 0;

        this._hierPart = (scheme !== -1 && scheme < slash ? (scheme + 1) : 0);
        this._query = this.href.indexOf("?", this._hierPart);
        this._fragment = this.href.indexOf("#", this._query !== -1 ? this._query : this._hierPart);
        if (this.href.length >= (this._hierPart + 2)
            && this.href[this._hierPart] === "/"
            && this.href[this._hierPart + 1] === "/") {
            slash = this.href.indexOf("/", this._hierPart + 2);
            this._path = slash !== -1 && (slash < this._query || this._query === -1) ? slash : this._query;
            if (this._path === -1)
                this._path = this.href.length;

            const at = this.href.indexOf("@", this._hierPart + 2);
            this._host = (at !== -1 && at < slash ? at + 1 : this._hierPart + 2);
            if (this.href[this._host] === "[") {
                const close = this.href.indexOf("]");
                if (close === -1) {
                    throw new Error("Invalid url, missing ']'");
                }
                this.ipVersion = 6;
                this._port = this.href[close + 1] === ":" ? close + 2 : -1;
            } else {
                const p = this.href.indexOf(":", this._host);
                this._port = p !== -1 && p < this._path ? p + 1 : -1;
            }
        } else {
            this._path = this._hierPart;
        }

        const hasScheme = this._hasScheme();
        if (hasScheme) {
            let foundUpperCase = false;
            for (let i = 0; i < this._hierPart - 1; ++i) {
                const code = this.href.charCodeAt(i);
                switch (code) {
                case 43: // "+":
                case 45: // "-":
                case 46: // ".":
                    break;
                default:
                    if (code >= 65 && code <= 90) { // A-Z
                        foundUpperCase = true;
                    } else if (!(code >= 48 && code <= 57) // 0-9
                               && !(code >= 97 && code <= 122)) {
                        throw new Error("Illegal scheme character " + this.href[i]);
                    }
                }
            }
            if (foundUpperCase) {
                this.href = this.href.substr(0, this._hierPart).toLowerCase() + this.href.substr(this._hierPart);
            }
        }

        if (this._hasAuthority()) {
            let foundUpperCase = false;
            const end = this._port === -1 ? this._path : this._port;
            for (let i = this._host; i < end; ++i) {
                const code = this.href.charCodeAt(i);
                if (code >= 128) {
                    throw new Error("Invalid url character " + this.href[i]);
                }
                if (code >= 65 && code <= 90) {
                    foundUpperCase = true;
                }
            }
            if (foundUpperCase) {
                this.href = (this.href.substr(0, this._host)
                             + this.href.substring(this._host, end).toLowerCase()
                             + this.href.substr(end));
            }
        }

        if (this._hasPort()) {
            this.portNumber = parseInt(this.href.substring(this._port, this._path), 10);
            if (isNaN(this.portNumber) || this.portNumber <= 0 || this.portNumber > 65535) {
                throw new Error("Invalid port " + this.href.substring(this._port, this._path));
            }
        } else if (hasScheme) {
            if (this.href.lastIndexOf("http:", 0) === 0 || this.href.lastIndexOf("ws:", 0) === 0) {
                this.portNumber = 80;
            } else if (this.href.lastIndexOf("https:", 0) === 0 || this.href.lastIndexOf("wss:", 0) === 0) {
                this.portNumber = 443;
            }
        }
    }

    toString(): string {
        return this.href;
    }

    readonly ipVersion?: IpVersion;

    get scheme(): string | undefined {
        return this._hasScheme() ? this.href.substr(0, this._hierPart) : undefined;
    }

    get hierPart(): string | undefined {
        if (this._hierPart === -1)
            return undefined;

        return this.href.substr(this._hierPart,
                                (this._query !== -1
                                 ? this._query - this._hierPart
                                 : (this._fragment !== -1
                                    ? this._fragment - this._hierPart
                                    : undefined)));
    }

    get host(): string | undefined {
        if (!this._hasAuthority())
            return undefined;
        return this.href.substr(this._hierPart + 2,
                                (this._path !== -1
                                 ? this._path - this._hierPart - 2
                                 : (this._query !== -1
                                    ? this._query - this._hierPart - 2
                                    : (this._fragment !== -1
                                       ? this._fragment - this._hierPart - 2
                                       : undefined))));
    }

    get userinfo(): string | undefined {
        if (!this._hasUserinfo())
            return undefined;
        return this.href.substr(this._hierPart + 2, this._host - this._hierPart - 3);
    }

    get username(): string | undefined {
        const info = this.userinfo;
        if (!info)
            return undefined;
        const colon = info.indexOf(":");
        if (colon !== -1) {
            return info.substr(0, colon);
        }
        return undefined;
    }

    get password(): string | undefined {
        const info = this.userinfo;
        if (!info)
            return undefined;
        const colon = info.indexOf(":");
        if (colon !== -1) {
            return info.substr(colon + 1);
        }
        return undefined;
    }

    get hostname(): string | undefined {
        if (!this._hasAuthority())
            return undefined;

        if (this.href[this._host] === '[') {
            return this.href.substr(this._host + 1,
                                    (this._port !== -1
                                     ? this._port - this._host - 3
                                     : this._path - this._host - 2));
        }

        return this.href.substr(this._host,
                                (this._port !== -1
                                 ? this._port - this._host - 1
                                 : this._path - this._host));
    }

    get port(): string | undefined {
        if (!this._hasPort())
            return undefined;
        return this.href.substr(this._port, this._path - this._port);
    }

    get path(): string {
        if (this._path === -1)
            return "/";

        return this.href.substr(this._path,
                                (this._query !== -1
                                 ? this._query - this._path
                                 : (this._fragment !== -1
                                    ? this._fragment - this._path
                                    : undefined)));
    }

    get query(): string | undefined {
        if (!this._hasQuery())
            return undefined;
        return this.href.substr(this._query,
                                (this._fragment === -1
                                 ? undefined
                                 : this._fragment - this._query));
    }

    get fragment(): string | undefined {
        if (!this._hasFragment())
            return undefined;
        return this.href.substr(this._fragment);
    }

    get origin(): string | undefined {
        if (!this._hasAuthority())
            return undefined;

        return this.href.substring(0, (this._port !== -1 ? this._port : (this._path === -1 ? undefined : this._path)));
    }

    readonly href: string;

    readonly portNumber: number;

    private _hierPart: number;
    private _host: number;
    private _port: number;
    private _path: number;
    private _query: number;
    private _fragment: number;

    private _hasScheme(): boolean {
        return this._hierPart > 0;
    }

    private _hasAuthority(): boolean {
        return this._hierPart !== -1 && (this._path !== this._hierPart);
    }

    private _hasPort(): boolean {
        return this._hasAuthority() && this._port !== -1;
    }

    private _hasUserinfo(): boolean {
        return this._hasAuthority() && (this._host !== (this._hierPart + 2));
    }

    private _hasFragment(): boolean {
        return this._fragment !== -1;
    }

    private _hasQuery(): boolean {
        return this._query !== -1;
    }
};
