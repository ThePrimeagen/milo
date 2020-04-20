import ConnectionPool from "../ConnectionPool";
import DataBuffer from "./DataBuffer";
import ICompressionStream from "../ICompressionStream";
import ICreateSSLNetworkPipeOptions from "../ICreateSSLNetworkPipeOptions";
import ICreateTCPNetworkPipeOptions from "../ICreateTCPNetworkPipeOptions";
import IDataBuffer from "../IDataBuffer";
import IMilo from "../IMilo";
import IPipeResult from "../IPipeResult";
import IPlatform from "../IPlatform";
import IRequestData from "../IRequestData";
import IRequestTimeouts from "../IRequestTimeouts";
import ISHA256Context from "../ISHA256Context";
import N = nrdsocket;
import NrdpSSL from "./NrdpSSL";
import RequestResponse from "../RequestResponse";
import assert from "../utils/assert.macro";
import createNrdpSSLNetworkPipe from "./NrdpSSLNetworkPipe";
import createNrdpTCPNetworkPipe from "./NrdpTCPNetworkPipe";
import { CookieAccessInfo, CookieJar } from "cookiejar";
import { IpConnectivityMode, CompressionStreamMethod, CompressionStreamType } from "../types";

type NrdpGibbonLoadCallbackSignature = (response: RequestResponse) => void;
type NrdpGibbonLoadSignature = (data: IRequestData | string, callback?: NrdpGibbonLoadCallbackSignature) => number;
export class NrdpPlatform implements IPlatform {
    constructor() {
        this.scratch = new DataBuffer(16 * 1024);
        this.ssl = new NrdpSSL(this);
        this.realLoad = nrdp.gibbon.load;
        this.realLoadScript = nrdp.gibbon.loadScript;
        this.realStopLoad = nrdp.gibbon.stopLoad;
        this.polyfillAll = false;
        const sdkVersion = nrdp.device.SDKVersion;

        this.userAgent = `Gibbon/${sdkVersion.versionString}/${sdkVersion.versionString}: Netflix/${sdkVersion.versionString} (DEVTYPE=${nrdp.device.ESNPrefix}; CERTVER=${nrdp.device.certificationVersion})`;
        this.connectionPool = new ConnectionPool();
        this.cookieJar = new CookieJar();
        this.cookieAccessInfo = new CookieAccessInfo("");
        this.cachedLocation = "";
        this.cachedLocationBase = "";
    }

    sha1(input: string): Uint8Array { return nrdp.hash("sha1", input); }

    public readonly scratch: IDataBuffer;
    public readonly ssl: NrdpSSL;
    public readonly connectionPool: ConnectionPool;
    public readonly cookieJar: CookieJar;
    public readonly cookieAccessInfo: CookieAccessInfo;

    log(...args: any[]): void {
        args.unshift({ traceArea: "MILO" });
        nrdp.l.success.apply(nrdp.l, args);
    }
    error(...args: any[]): void {
        args.unshift({ traceArea: "MILO" });
        nrdp.l.error.apply(nrdp.l, args);
    }
    trace(...args: any[]): void {
        args.unshift({ traceArea: "MILO" });
        nrdp.l.trace.apply(nrdp.l, args);
    }

    get ipConnectivityMode(): IpConnectivityMode {
        switch (nrdp.device.ipConnectivityMode) {
        case "4":
            break;
        case "6":
            return 6;
        case "dual":
            return 10;
        case "invalid":
            return 0;
        }
        return 4;
    }

    get tlsv13SmallAssetsEnabled(): boolean {
        return nrdp.device.tlsv13SmallAssetsEnabled;
    }
    get tlsv13StreamingEnabled(): boolean {
        return nrdp.device.tlsv13StreamingEnabled;
    }

    get standardHeaders(): { [key: string]: string } {
        const currentLanguages = this.UILanguages;
        const location = this.location;
        if (!this.cachedStandardHeaders
            || this.cachedUILanguages !== currentLanguages
            || this.cachedLocationForHeaders !== location) {
            this.cachedUILanguages = currentLanguages;
            this.cachedLocationForHeaders = location;
            this.cachedStandardHeaders = {};
            this.cachedStandardHeaders["User-Agent"] = this.userAgent;
            this.cachedStandardHeaders.Accept = "*/*";
            this.cachedStandardHeaders.Referer = this.location;
            if (currentLanguages && currentLanguages.length) {
                this.cachedStandardHeaders.Language = currentLanguages.join(",");
            }
            this.cachedStandardHeaders["Accept-Encoding"] = "gzip,deflate";
        }
        return this.cachedStandardHeaders;
    }

    get defaultRequestTimeouts(): IRequestTimeouts {
        const opts = nrdp.options;
        return {
            timeout: opts.default_network_timeout,
            connectTimeout: opts.default_network_connect_timeout,
            dnsTimeout: opts.default_network_dns_timeout,
            dnsFallbackTimeoutWaitFor4: opts.default_network_dns_fallback_timeout_wait_for_4,
            dnsFallbackTimeoutWaitFor6: opts.default_network_dns_fallback_timeout_wait_for_6,
            happyEyeballsHeadStart: opts.default_network_happy_eyeballs_head_start,
            lowSpeedLimit: opts.default_network_low_speed_limit,
            lowSpeedTime: opts.default_network_low_speed_time,
            delay: opts.default_network_delay
        };
    }

    mono = nrdp.mono;
    btoa = nrdp.btoa;
    atob = nrdp.atob;
    atoutf8 = nrdp.atoutf8;
    utf8toa = nrdp.utf8toa;
    randomBytes = nrdp_platform.random;
    stacktrace = nrdp.stacktrace;
    assert = nrdp.assert;
    arrayBufferConcat = nrdp_platform.arrayBufferConcat;
    bufferSet = nrdp_platform.bufferSet;

    utf8Length = nrdp_platform.utf8Length;

    writeFile(fileName: string, contents: Uint8Array | IDataBuffer | ArrayBuffer | string): boolean {
        const fd = N.open(fileName, N.O_CREAT | N.O_WRONLY, 0o0664);
        if (fd === -1) {
            this.error(`Failed to open ${fileName} for writing`, N.errno, N.strerror());
            return false;
        }
        const len = typeof contents === "string" ? nrdp_platform.utf8Length(contents) : contents.byteLength;
        const w = N.write(fd, contents);
        N.close(fd);
        if (w !== len) {
            this.error(`Failed to write to ${fileName} for writing ${w} vs ${len}`, N.errno, N.strerror());
            return false;
        }
        return true;
    }

    createSHA256Context(): ISHA256Context {
        return new nrdp_platform.Hasher("sha256");
    }

    createCompressionStream(method: CompressionStreamMethod,
                            compress: boolean | CompressionStreamType): ICompressionStream {
        return new nrdp_platform.CompressionStream(method, compress);
    }

    createTCPNetworkPipe(options: ICreateTCPNetworkPipeOptions): Promise<IPipeResult> {
        return createNrdpTCPNetworkPipe(this, options);
    }
    createSSLNetworkPipe(options: ICreateSSLNetworkPipeOptions): Promise<IPipeResult> {
        return createNrdpSSLNetworkPipe(this, options);
    }

    lookupDnsHost = nrdp.dns.lookupHost.bind(nrdp.dns);

    get UILanguages(): string[] { return nrdp.device.UILanguages; }
    get location(): string { return nrdp.gibbon.location; }

    quit = nrdp.exit.bind(nrdp);

    parseXML = nrdp_platform.parseXML;
    parseJSONStream = nrdp_platform.JSON.parse;
    parseJSON(data: string | IDataBuffer): any | undefined {
        const ret = nrdp_platform.JSON.parse(data);
        if (ret)
            return ret[0];
        return undefined;
    }

    options(key: string): any {
        if (nrdp.js_options) {
            return nrdp.js_options[key];
        }
        return undefined;
    }

    loadMilo(milo: IMilo): boolean {
        this.log("CALLED", this.location, typeof nrdp.milo);
        if (typeof nrdp.milo !== "undefined")
            return false;
        nrdp.milo = milo;

        let poly: any = this.options("polyfill-milo");
        switch (typeof poly) {
        case "boolean":
            if (!poly) {
                break;
            }
            poly = "optin";
            // fall through
        case "string":
            if (poly !== "optin" && poly !== "all") {
                throw new Error("Invalid polyfill string " + poly);
            } else {
                this.polyfillAll = poly === "all";
                this.miloLoad = milo.load;
                nrdp.gibbon.load = this.polyfilledGibbonLoad.bind(this);
                // nrdp.gibbon.loadScript = this.polyfilledGibbonLoadScript.bind(this);
                nrdp.gibbon.stopLoad = this.polyfilledGibbonStopLoad.bind(this);
                // this.polyfillGibbonLoad(poly, milo.load);
            }
            break;
        case "undefined":
            break;
        default:
            throw new Error("Invalid polyfill type " + typeof poly);
        }

        return true;
    }

    private polyfilledGibbonLoad(data: IRequestData | string,
                                 callback?: NrdpGibbonLoadCallbackSignature): number {
        // nrdp.l.success("LOAD", JSON.stringify(data, (key: string, value: any) => {
        //     if (key === "data" || key === "body" || key === "source") {
        //         return key;
        //     }
        //     return value;
        // }));
        if (typeof data === "string") {
            data = { url: this.resolveUrl(data) };
        } else {
            data.url = this.resolveUrl(data.url);
        }

        if ((!this.polyfillAll && !data.milo)
            || !this.miloLoad
            || data.url.lastIndexOf("http://localcontrol.netflix.com/", 0) === 0
            || data.url.lastIndexOf("file://", 0) === 0
            || data.url.lastIndexOf("data:", 0) === 0) {
            // this.log("got req", realData.url, typeof realData.body);
            // return this.realLoad(data, (response: RequestResponse) => {
            //     callback(response);
            // });
            return this.realLoad(data, callback);
        }
        return this.miloLoad(data, callback);
    }

    private polyfilledGibbonLoadScript(data: IRequestData | string,
                                       callback?: NrdpGibbonLoadCallbackSignature): number {
        // nrdp.l.success("LOADSCRIPT", JSON.stringify(data, (key: string, value: any) => {
        //     if (key === "data" || key === "body" || key === "source") {
        //         return key;
        //     }
        //     return value;
        // }));
        if (typeof data === "string") {
            data = { url: this.resolveUrl(data) };
        } else {
            data.url = this.resolveUrl(data.url);
        }
        if ((!this.polyfillAll && !data.milo)
            || !this.miloLoad
            || data.url.lastIndexOf("http://localcontrol.netflix.com/", 0) === 0
            || data.url.lastIndexOf("file://", 0) === 0
            || data.url.lastIndexOf("data:", 0) === 0) {
            // this.log("got req", realData.url, typeof realData.body);
            // return this.realLoad(data, (response: RequestResponse) => {
            //     callback(response);
            // });
            return this.realLoadScript(data, callback);
        }
        if (!data.format) {
            data.format = "databuffer";
        }

        return this.miloLoad(data, (response: RequestResponse) => {
            if (response.statusCode === 200 && response.data) {
                assert(typeof data === "object", "Must be an object now");
                try {
                    nrdp.gibbon.eval(response.data, data.url);
                } catch (err) {
                    response.exception = err;
                }
            }
            if (callback) {
                callback(response);
            }
        });
    }

    private polyfilledGibbonStopLoad(id: number): void {
        if (id < 0) {
            nrdp.l.error("SOMEONE CALLING STOPLOAD ON US", id);
        } else {
            this.realStopLoad(id);
        }
    }

    private resolveUrl(url: string): string {
        if (url.indexOf("://") !== -1 || url.lastIndexOf("data:", 0) === 0) {
            return url;
        }

        if (nrdp.gibbon.location !== this.cachedLocation) {
            this.cachedLocation = nrdp.gibbon.location;
            const q = this.cachedLocationBase.indexOf("?");
            let s = q === -1 ? this.cachedLocation.lastIndexOf("/") : this.cachedLocation.lastIndexOf("/", q);
            if (s < 8)
                s = -1;
            if (s === -1) {
                this.cachedLocationBase = this.cachedLocation + "/";
            } else {
                this.cachedLocationBase = this.cachedLocation.substr(0, s + 1);
            }
        }

        let baseUrl = this.cachedLocationBase;
        let slash = -1;
        if (url[0] === "/") {
            slash = baseUrl.indexOf("/", 8);
            if (slash !== -1) {
                baseUrl = baseUrl.substr(0, slash);
            }
        }
        // this.log("taking", url, "turning it into", (baseUrl + url),
        //          "baseUrl", baseUrl, "slash", slash, "base", this.cachedLocationBase);
        return baseUrl + url;
    }

    private cachedStandardHeaders?: { [key: string]: string };
    private cachedUILanguages?: string[];
    private cachedLocationForHeaders?: string;
    private realLoad: NrdpGibbonLoadSignature;
    private realLoadScript: NrdpGibbonLoadSignature;
    private realStopLoad: (id: number) => void;
    private miloLoad?: NrdpGibbonLoadSignature;
    private polyfillAll: boolean;
    private userAgent: string;
    private cachedLocation: string;
    private cachedLocationBase: string;
};

export default new NrdpPlatform();
