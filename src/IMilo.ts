import RequestResponse from "./RequestResponse";
import IRequestData from "./IRequestData";
import IPlatform from "./IPlatform";
import WS, { WSState } from "./ws";

export default interface IMilo {
    load(data: IRequestData | string, callback?: (response: RequestResponse) => void): number;
    ws(url: string, milo: boolean): Promise<WS>;

    readonly platform: IPlatform;
};
