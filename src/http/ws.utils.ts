import sha1 from 'sha1';

const WS_KEY = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

export function switchProtocolResponse(key: string) {
    return [
        "HTTP/1.1 101 Switching Protocols",
        "Upgrade: websocket",
        "Connection: Upgrade",
        `Sec-WebSocket-Accept: ${key}`,
    ];
}

export function getResponseWSKey(incomingKey: string): string {
    const shadKey = sha1(incomingKey + WS_KEY);
    return Buffer.from(shadKey, 'hex').toString('base64');
}

export function validateUpgradeResponse(requestKey: string, responseKey: string): boolean {
    return getResponseWSKey(requestKey) === responseKey;
};

export function generateWSUpgradeKey(): string {
    return 'dGhlIHNhbXBsZSBub25jZQ==';
}


