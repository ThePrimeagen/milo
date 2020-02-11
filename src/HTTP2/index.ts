import Url from "url-parse";
import Platform from "../#{target}/Platform";
import SettingsFrame from "./frame/settings-frame";
import FrameConstructor from "./frame/frame-constructor";
import { VersionIdentification } from "./consts";
import { RequestData, Request } from "../Request";
import { NetworkPipe, DnsResult } from "../types";
import { assert } from "../utils"

// RFC: 3.4 Starting a request with prior knowledge.
// This requires a special connection frame with a octet string of
// "PRI * HTTP/2.0\r\n\r\nSM\r\n\r\n"
// Then a settings frame directly after.
export async function createRawConnection(data: RequestData | string): Promise<NetworkPipe> {
    return await Request.connect(data);
}

export async function http2Upgrade(data: RequestData): Promise<NetworkPipe> {
    Platform.log("HTTP2 Got some data headers or something.", data);

    if (!data.headers) {
        data.headers = {};
    }

    data.headers["Upgrade"] = data.secure ? VersionIdentification.Secure :
        VersionIdentification.NonSecure;

    data.headers["Connection"] = "Upgrade, HTTP2-Settings";
    // Note: https://tools.ietf.org/html/rfc7540#section-3.2
    // This is a bit complicated and seems oddly worded when I don't really
    // try to read the rfc but instead talk to the twitch chat about RHCP.
    data.headers["HTTP2-Settings"] = '';/* TODO: base64 encode these bad boys */;

    const req = new Request(data);
    let pipe;
    try {
        const response = await req.send();
        Platform.log("Got response", response);

        if (response.statusCode !== 101) {
            throw new Error("status code");
        }

        Platform.log("successfully upgraded (maybe).");

        pipe = req.networkPipe;

        // Send Preface... (TODO:)

    } catch (e) {
        Platform.log("Got e", e);
        throw e;
    }

    // TODO: This literally can never happen, but due to the structure of the
    // typescript, it can.
    if (!pipe) {
        throw new Error("Somehow your pipe was undefined.  I think its Ricky Gervais fault.");;
    }

    return pipe;
}

