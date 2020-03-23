import EventEmitter from "../EventEmitter";

describe("test", () => {
    it("once", () => {
        ["throw", undefined, EventEmitter.prototype.off, EventEmitter.prototype.removeListener].forEach(removeFunc => {
            const emitter = new EventEmitter();
            expect(emitter.eventNames()).toEqual([]);
            let hit = 0;
            function handler(value: number) {
                expect(value).toEqual(12);
                if (typeof removeFunc === "string") {
                    throw new Error("Balls");
                }
                ++hit;
            }
            function handler2(value: number) {
                expect(value).toEqual(12);
                ++hit;
            }
            function handler3(value: number) {
                expect(value).toEqual(12);
                ++hit;
            }

            expect(emitter.hasListener("foo")).toEqual(false);
            emitter.once("foo", handler);
            expect(emitter.hasListener("foo")).toEqual(true);
            expect(emitter.listeners("foo")).toEqual([handler]);
            expect(emitter.listenerCount("foo")).toEqual(1);

            emitter.prependOnceListener("foo", handler2);
            expect(emitter.listeners("foo")).toEqual([handler2, handler]);
            expect(emitter.listenerCount("foo")).toEqual(2);
            expect(emitter.hasListener("foo")).toEqual(true);

            emitter.addOnceListener("foo", handler3);
            expect(emitter.listeners("foo")).toEqual([handler2, handler, handler3]);
            expect(emitter.listenerCount("foo")).toEqual(3);
            expect(emitter.hasListener("foo")).toEqual(true);

            emitter.addOnceListener("foo", handler);
            expect(emitter.listeners("foo")).toEqual([handler2, handler, handler3, handler]);
            expect(emitter.listenerCount("foo")).toEqual(4);
            expect(emitter.hasListener("foo")).toEqual(true);

            let count = 4;
            if (typeof removeFunc === "function") {
                removeFunc.call(emitter, "foo", handler);
                expect(emitter.listeners("foo")).toEqual([handler2, handler3, handler]);
                expect(emitter.hasListener("foo")).toEqual(true);
                --count;
            }
            expect(emitter.eventNames()).toEqual(["foo"]);
            expect(emitter.listenerCount("foo")).toEqual(count);

            if (typeof removeFunc === "string") {
                let gotErr = false;
                expect(emitter.listeners("foo")).toEqual([handler2, handler, handler3, handler]);
                try {
                    expect(emitter.emit("foo", 12)).toThrow(new Error("balls"));
                } catch (err) {
                    gotErr = true;
                    expect(emitter.listeners("foo")).toEqual([handler3, handler]);
                }
                expect(gotErr).toEqual(true);
                expect(hit).toEqual(1);
                expect(emitter.listenerCount("foo")).toEqual(2);
                expect(emitter.listeners("foo")).toEqual([handler3, handler]);
                removeFunc = undefined;
                --count;
            }

            expect(emitter.emit("foo", 12)).toEqual(true);
            expect(emitter.listenerCount("foo")).toEqual(0);
            expect(emitter.listeners("foo")).toEqual([]);
            expect(emitter.eventNames()).toEqual([]);
            expect(hit).toEqual(count);
            expect(emitter.emit("foo", 12)).toEqual(false);
            expect(hit).toEqual(count);
        });
    });

    it("once", () => {
        ["throw", undefined, EventEmitter.prototype.off, EventEmitter.prototype.removeListener].forEach(removeFunc => {
            const emitter = new EventEmitter();
            expect(emitter.eventNames()).toEqual([]);
            let hit = 0;
            function handler(value: number) {
                expect(value).toEqual(12);
                if (typeof removeFunc === "string") {
                    throw new Error("Balls");
                }
                ++hit;
            }
            function handler2(value: number) {
                expect(value).toEqual(12);
                ++hit;
            }
            function handler3(value: number) {
                expect(value).toEqual(12);
                ++hit;
            }

            expect(emitter.hasListener("foo")).toEqual(false);
            emitter.on("foo", handler);
            expect(emitter.hasListener("foo")).toEqual(true);
            expect(emitter.listeners("foo")).toEqual([handler]);
            expect(emitter.listenerCount("foo")).toEqual(1);

            emitter.prependListener("foo", handler2);
            expect(emitter.listeners("foo")).toEqual([handler2, handler]);
            expect(emitter.listenerCount("foo")).toEqual(2);
            expect(emitter.hasListener("foo")).toEqual(true);

            emitter.addListener("foo", handler3);
            expect(emitter.listeners("foo")).toEqual([handler2, handler, handler3]);
            expect(emitter.listenerCount("foo")).toEqual(3);
            expect(emitter.hasListener("foo")).toEqual(true);

            emitter.addListener("foo", handler);
            expect(emitter.listeners("foo")).toEqual([handler2, handler, handler3, handler]);
            expect(emitter.listenerCount("foo")).toEqual(4);
            expect(emitter.hasListener("foo")).toEqual(true);

            const expectedHandlers = [handler2, handler, handler3, handler];
            if (typeof removeFunc === "function") {
                removeFunc.call(emitter, "foo", handler);
                expectedHandlers.splice(1, 1);
                expect(emitter.listeners("foo")).toEqual(expectedHandlers);
                expect(emitter.hasListener("foo")).toEqual(true);
            }
            expect(emitter.eventNames()).toEqual(["foo"]);
            expect(emitter.listenerCount("foo")).toEqual(expectedHandlers.length);

            if (typeof removeFunc === "string") {
                let gotErr = false;
                expect(emitter.listeners("foo")).toEqual(expectedHandlers);
                try {
                    expect(emitter.emit("foo", 12)).toThrow(new Error("balls"));
                } catch (err) {
                    gotErr = true;
                    expect(emitter.listeners("foo")).toEqual(expectedHandlers);
                }
                expect(gotErr).toEqual(true);
                expect(hit).toEqual(1);
                expect(emitter.listenerCount("foo")).toEqual(4);
                expect(emitter.listeners("foo")).toEqual(expectedHandlers);
                removeFunc = undefined;
                hit = 0;
            }

            expect(emitter.emit("foo", 12)).toEqual(true);
            expect(emitter.listenerCount("foo")).toEqual(expectedHandlers.length);
            expect(emitter.listeners("foo")).toEqual(expectedHandlers);
            expect(emitter.eventNames()).toEqual(["foo"]);
            expect(hit).toEqual(expectedHandlers.length);
            expect(emitter.emit("foo", 12)).toEqual(true);
            expect(hit).toEqual(expectedHandlers.length * 2);
        });
    });
});
