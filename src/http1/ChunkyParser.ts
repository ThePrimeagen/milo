import Platform from "../Platform";

export class ChunkyParser
{
    private buffers: Uint8Array[] = [];
    private offset: number = 0;
    private dataNeeded: number = -1;
    private available: number = 0;
    constructor()
    {
    }

    feed(data: ArrayBuffer, offset: number, length: number): void
    {
        Platform.assert(this.onchunk, "Gotta have an onchunk");
        this.buffers.push(new Uint8Array(data, offset, length));
        this.available += length;
        this._process();
    }

    dump(): string
    {
        let str = "";
        for (let bi=0; bi<this.buffers.length; ++bi) {
            let idx = bi ? 0 : this.offset;
            while (idx < this.buffers[bi].byteLength) {
                let char = String.fromCharCode(this.buffers[bi][idx]);
                if (char === '\r') {
                    char = "\\r";
                } else if (char === '\n') {
                    char = "\\n\n";
                }
                str += char;
                ++idx;
            }
        }
        return str;
    }

    private _process(): void
    {
        while (true) {
            // Platform.log("processing balls", this.dataNeeded, this.buffers.length, this.offset, this.available, "\n" + this.dump());
            if (this.dataNeeded == -1) {
                if (this.available > 2) {
                    let lastWasBackslashR = false;
                    let consumed = 0;
                    let str = "";
                    for (let bi=0; bi<this.buffers.length && this.dataNeeded === -1; ++bi) {
                        // Platform.log("shit", bi, this.buffers.length);
                        let buf = this.buffers[bi];
                        // Platform.log("this is", buf, Platform.utf8toa(buf));
                        for (let i=bi ? 0 : this.offset; i<buf.length; ++i) {
                            // Platform.log("looking at", i, bi, buf[i], String.fromCharCode(buf[i]), str);
                            ++consumed;
                            if (lastWasBackslashR) {
                                if (buf[i] === 10) {
                                    const len = parseInt(str, 16);
                                    if (isNaN(len)) {
                                        this.onerror(-1, "Failed to chunky parse [" + str + "] " + len);
                                        return;
                                    }
                                    this.dataNeeded = len;
                                    // Platform.log("got len", len, "for", str, consumed + "\n" + this.dump());
                                    this._consume(consumed);
                                    break;
                                }
                            } else if (buf[i] === 13) {
                                lastWasBackslashR = true;
                            } else {
                                lastWasBackslashR = false;
                                str += String.fromCharCode(buf[i]);
                            }
                        }
                    }
                }
                    if (this.dataNeeded === -1)
                        break;
            } else if (!this.dataNeeded && this.available >= 2) {
                this._consume(2);
                const buffer = this._extractChunk(this.available);
                Platform.assert(!this.available, "Nothing should be left");
                Platform.assert(!this.buffers.length, "No buffers here");
                this.ondone(buffer);
            } else if (this.dataNeeded + 2 <= this.available) {
                const chunk = this._extractChunk(this.dataNeeded);
                // Platform.log("extracted a chunk", Platform.utf8toa(chunk));
                this._consume(2);
                this.dataNeeded = -1;
                this.onchunk(chunk);
            } else {
                break;
            }
        }
    }

    ondone: (buffer: Uint8Array) => void;
    onchunk: (chunk: Uint8Array) => void;
    onerror: (code: number, message: string) => void;

    private _consume(bytes: number): void
    {
        Platform.assert(bytes <= this.available, "Not enough bytes to consume");
        // Platform.log("consuoming", bytes, "from", this.buffers, this.available);
        let consumed = 0;
        while (consumed < bytes) {
            const bufferAvailable = this.buffers[0].byteLength - this.offset;
            if (bytes - consumed >= bufferAvailable) {
                this.buffers.shift();
                this.offset = 0;
                consumed += bufferAvailable;
            } else {
                const wanted = bytes - consumed;
                this.offset += wanted;
                consumed += wanted;
                Platform.assert(consumed === bytes);
                break;
            }
        }
        Platform.assert(consumed === bytes, "Bytes should be nothing by now " + bytes + " " + consumed + " " + this.available);
        this.available -= consumed;
    }

    private _extractChunk(size: number): Uint8Array
    {
        if (!size)
            return undefined;
        Platform.assert(this.available >= size, "available's gotta be more than size");
        // grab the whole first chunk
        if (!this.offset && this.buffers[0].byteLength === size) {
            this.available -= size;
            return this.buffers.shift();
        }

        const ret = new Uint8Array(size);
        let idx = 0;
        while (idx < size) {
            const buf = this.buffers[0];
            const wanted = size - idx;
            const bufferAvailable = buf.byteLength - this.offset;
            if (bufferAvailable > size - idx) {
                ret.set(buf.subarray(this.offset, this.offset + wanted), idx);
                idx += wanted;
                this.offset += wanted;
                break;
            } else if (this.offset) {
                Platform.assert(bufferAvailable <= wanted, "foo");
                ret.set(buf.subarray(this.offset, this.offset + bufferAvailable), idx);
                this.offset = 0;
                this.buffers.shift();
                idx += bufferAvailable;
            } else {
                Platform.assert(bufferAvailable <= wanted, "bar");
                Platform.assert(!this.offset, "zot");
                ret.set(buf, idx);
                this.buffers.shift();
                idx += bufferAvailable;
            }
        }
        Platform.assert(idx === size, "We should be done now");
        this.available -= size;
        return ret;
    }


};

export function fuck()
{
    const shit = `4\r
Wiki\r
5\r
pedia\r
E\r
 in\r
\r
chunks.\r
0\r
\r\n`;

    // Platform.log("fuck start");
    for (let size = 1; size<shit.length; ++size) {
        const balls = new ChunkyParser;
        let chunks: Uint8Array[] = [];
        balls.onchunk = (chunk: Uint8Array) => {
            // Platform.log("got chunk", size, Platform.utf8toa(chunk));
            chunks.push(chunk);
        };
        balls.onerror = (code: number, message: string) => {
            Platform.log("got error", size, code, message);
            return;
        };
        balls.ondone = (buf: Uint8Array) => {
            Platform.log("Got done with", size, buf);
            let str = "";
            chunks.forEach((a: Uint8Array) => {
                str += Platform.utf8toa(a);
            });
            // Platform.log("shit is done");
            Platform.log(str);
        };

        let idx = 0;
        while (idx < shit.length) {
            const sub = shit.substr(idx, size);
            const chunk = Platform.atoutf8(sub);
            // Platform.log("feeding", idx, shit.length);
            balls.feed(chunk, 0, chunk.byteLength);
            idx += size;
        }
    }
}
