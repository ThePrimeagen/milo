import { createBufferBuilder } from "../buffer";
import { uint8ArrayWriteString } from "../../utils";

const helloWorld = new Uint8Array(28);
uint8ArrayWriteString(helloWorld, "Hello World\r\nHello Sunny\r\n\r\n");

describe("buffer", function() {
    it("should addStrings with ease", function() {
        const buffer = createBufferBuilder(28);
        buffer.addString("Hello World");
        buffer.addNewLine();
        buffer.addString("Hello Sunny");
        buffer.addNewLine();
        buffer.addNewLine();

        const buf = buffer.getBuffer();
        expect(buf.length).toEqual(helloWorld.length);

        for (let i = 0; i < 28; ++i) {
            expect(buf[i]).toEqual(helloWorld[i]);
        }
    });
});


