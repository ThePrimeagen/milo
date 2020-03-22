import IPipeResult from "./IPipeResult";

export default interface ICreateSSLNetworkPipeOptions extends IPipeResult {
    tlsv13?: boolean;
};
