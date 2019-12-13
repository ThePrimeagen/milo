import {
    AddrId,
    AddrInfoHints,

    NativeSocketInterface
} from './types';

function ab2str(buf: ArrayBuffer) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}

function str2ab(str: string) {
  var buf = new ArrayBuffer(str.length); // 2 bytes for each char
  var bufView = new Uint8Array(buf);

  for (var i=0, strLen=str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

export default function test(bindings: NativeSocketInterface) {
    const addrHints: AddrInfoHints = {
        ai_socktype: bindings.SOCK_STREAM,
        ai_family: bindings.AF_INET
    };

    const hintsId = bindings.newAddrInfo(addrHints);
    const bindId = bindings.newAddrInfo();
    console.log("XXXX - localhost", "8080");
    const addrInfoResult =
        bindings.getaddrinfo("example.com", "80", hintsId, bindId);

    if (addrInfoResult) {
        console.error("Unable to getaddrinfo.  Also stop using this method you dingus");
        return;
    }

    const bindData = bindings.addrInfoToObject(bindId);
    const socketId = bindings.socket(
        bindData.ai_family, bindData.ai_socktype, bindData.ai_protocol);

    if (!bindings.isValidSocket(socketId)) {
        console.error("Unable to create the socket", bindings.getErrorString());
        return;
    }

    const connectStatus = bindings.connect(socketId, bindId);
    if (connectStatus) {
        console.error("Unable to connect to the socket", bindings.getErrorString());
        return;
    }

    // TODO: Send data to example.com
    ab2str;
    str2ab;
    debugger;
};

