const createBufferBuilder = require('../buffer').createBufferBuilder;

const helloWorld = Buffer.alloc(28);
helloWorld.write("Hello World\r\nHello Sunny\r\n\r\n");

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


