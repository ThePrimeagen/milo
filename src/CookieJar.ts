
import Platform from "./Platform";
import assert from "./utils/assert.macro";
import Url from "url-parse";
import { CookieFlag } from "./types";

interface Cookie {
    name: string;
    value: string;
    domain: string;
    path: string;
    secure?: boolean;
    expires?: number;
    http?: boolean;
};

function domainSuffix(host: string, suffix: string): boolean {
    if (host === suffix) {
        return true;
    }

    if (host.indexOf(suffix, host.length - suffix.length) === -1)
        return false;

    if (suffix[0] !== ".") {
        return true;
    }

    return host[host.length - suffix.length - 1] === ".";
}

export default class CookieJar {
    private cookieArray: Cookie[];
    constructor(serialized?: string) {
        if (!serialized) {
            this.cookieArray = [];
        } else {
            const serverTime = Platform.serverTime();
            this.cookieArray = JSON.parse(serialized);
            if (!Array.isArray(this.cookieArray))
                throw new Error("Invalid serialized data " + typeof this.cookieArray);
            for (let idx = 0; idx < this.cookies.length; ++idx) {
                const c = this.cookieArray[idx];
                // ### don't really need to do this checking, the data just has to be right
                if (!c.name || typeof c.name !== "string")
                    throw new Error("Bad cookie: Bad name");
                if (!c.value || typeof c.value !== "string")
                    throw new Error("Bad cookie: Bad value");
                if (!c.domain || typeof c.domain !== "string")
                    throw new Error("Bad cookie: Bad domain");
                if (!c.path || typeof c.path !== "string")
                    throw new Error("Bad cookie: Bad path");

                const secureType = typeof c.secure;
                if (secureType !== "undefined" && secureType !== "boolean")
                    throw new Error("Bad cookie: Bad secure");

                const httpType = typeof c.http;
                if (httpType !== "undefined" && httpType !== "boolean")
                    throw new Error("Bad cookie: Bad http");

                const expiresType = typeof c.expires;
                if (expiresType === "number") {
                    assert(typeof c.expires === "number", "Must have expires");
                    if (serverTime && serverTime >= c.expires) {
                        this.cookieArray.splice(idx--, 1);
                        continue;
                    }
                } else if (expiresType !== "undefined") {
                    throw new Error("Bad cookie: Bad expires");
                }
            }
        }
    }

    serialize() {
        return JSON.stringify(this.cookieArray);
    }

    processCookies(url: Url, setCookie: string) {
        // const parts = setCookie.split(";");
    }

    cookies(url: Url, flags?: CookieFlag): string | undefined {
        const serverTime = Platform.serverTime();

        let ret = "";
        const domain = url.hostname;
        let path: string | undefined = url.pathname;
        if (path === "/")
            path = undefined;
        for (let idx = 0; idx < this.cookies.length; ++idx) {
            const cookie = this.cookieArray[idx];
            if (!domainSuffix(domain, cookie.domain))
                continue;
            if (!path) {
                if (cookie.path !== "/")
                    continue;
            } else if (path.lastIndexOf(cookie.path, 0) !== 0) {
                continue;
            }

            if (cookie.secure
                && (!flags || !(flags & CookieFlag.Trusted))
                && !Platform.sendSecureCookies
                && url.protocol !== "https:") {
                continue;
            }

            if (serverTime && cookie.expires && serverTime >= cookie.expires) {
                this.cookieArray.splice(idx--, 1);
                continue;
            }


            if (ret) {
                ret += "; ";
            }


            ret += this.toRequestHeader(cookie);
        }

        return ret;
    }

    private toRequestHeader(cookie: Cookie) {


        return "";
    }

}

