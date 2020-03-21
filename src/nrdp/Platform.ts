import "./polyfills";

import {
    ICreateSSLNetworkPipeOptions, ICreateTCPNetworkPipeOptions, IpConnectivityMode,
    IPlatform, IRequestTimeouts, ISHA256Context, IDataBuffer, IPipeResult
} from "../types";
import DataBuffer from "./DataBuffer";
import createNrdpSSLNetworkPipe from "./NrdpSSLNetworkPipe";
import createNrdpTCPNetworkPipe from "./NrdpTCPNetworkPipe";
import NrdpSSL from "./NrdpSSL";
import N = nrdsocket;

export class NrdpPlatform implements IPlatform {
    constructor() {
        this.scratch = new DataBuffer(16 * 1024);
        this.ssl = new NrdpSSL(this);
    }

    sha1(input: string): Uint8Array { return nrdp.hash("sha1", input); }

    public readonly scratch: IDataBuffer;
    public readonly ssl: NrdpSSL;

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

    private cachedStandardHeaders?: { [key: string]: string };
    private cachedUILanguages?: string[];
    get standardHeaders(): { [key: string]: string } {
        const currentLanguages = this.UILanguages;
        if (!this.cachedStandardHeaders || this.cachedUILanguages !== currentLanguages) {
            this.cachedUILanguages = currentLanguages;
            this.cachedStandardHeaders = {};
            this.cachedStandardHeaders["User-Agent"] = "Milo/0.1";
            this.cachedStandardHeaders.Accept = "*/*";
            if (currentLanguages && currentLanguages.length) {
                this.cachedStandardHeaders.Language = currentLanguages.join(",");
            }
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
    assert = nrdp.assert;
    btoa = nrdp.btoa;
    atob = nrdp.atob;
    atoutf8 = nrdp.atoutf8;
    utf8toa = nrdp.utf8toa;
    randomBytes = nrdp_platform.random;
    stacktrace = nrdp.stacktrace;

    utf8Length(str: string): number { return nrdp_platform.utf8Length(str); }

    writeFile(fileName: string, contents: Uint8Array | IDataBuffer | ArrayBuffer | string): boolean {
        const fd = N.open(fileName, N.O_CREAT | N.O_WRONLY, 0o0664);
        if (fd === -1) {
            this.error(`Failed to open ${fileName} for writing`, N.errno, N.strerror());
            return false;
        }
        const len = typeof contents === "string" ? contents.length : contents.byteLength;
        const w = N.write(fd, contents);
        N.close(fd);
        if (w !== len && (typeof contents !== "string" || w !== nrdp.atoutf8(contents).byteLength)) {
            this.error(`Failed to write to ${fileName} for writing ${w} vs ${len}`, N.errno, N.strerror());
            return false;
        }
        return true;
    }

    createSHA256Context(): ISHA256Context {
        return new nrdp_platform.Hasher("sha256");
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

    quit(exitCode: number = 0): void { nrdp.exit(exitCode); }
};

export default new NrdpPlatform();
