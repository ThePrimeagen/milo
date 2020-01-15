/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 17);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ab2str; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return uint8ArrayWriteString; });
/* unused harmony export str2ab */
/* unused harmony export arrayBufferSlice */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return uint8ArraySlice; });
/* unused harmony export arrayBufferConcat */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return uint8ArrayConcat; });
/* harmony import */ var _nrdp__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);

function ab2str(buf) {
    return _nrdp__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].utf8toa(buf);
}
;
function uint8ArrayWriteString(buf, str) {
    const b = _nrdp__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].atoutf8(str);
    buf.set(b);
    return b.byteLength;
}
function str2ab(str, buf) {
    // TODO: You are ackshually assuming that every character is 1 byte...
    let i, strLen;
    for (i = 0, strLen = str.length; i < strLen; i++) {
        buf[i] = str.charCodeAt(i);
    }
    return i;
}
;
function arrayBufferSlice(buf, start, end) {
    if (buf instanceof ArrayBuffer) {
        return buf.slice(start, end);
    }
    else {
        return buf.buffer.slice(start + buf.byteOffset, end);
    }
}
function uint8ArraySlice(buf, start, end) {
    if (buf instanceof ArrayBuffer) {
        return new Uint8Array(buf).subarray(start, end);
    }
    return buf.subarray(start, end);
}
function arrayBufferConcat(...buffers) {
    // @ts-ignore
    // TODO michael fix
    return ArrayBuffer.concat(...buffers);
}
function uint8ArrayConcat(...buffers) {
    if (true) {
        // @ts-ignore
        return new Uint8Array(ArrayBuffer.concat(...buffers));
    }
    // TODO: Make this better, but for now.
    const buf = Buffer.concat(buffers.map(x => {
        if (x instanceof ArrayBuffer) {
            return new Uint8Array(x);
        }
        return x;
    }));
    return Uint8Array.from(buf);
}


/***/ }),

/***/ 1:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export parse64BigInt */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return BufferPool; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return createBufferBuilder; });
/* unused harmony export getCharacterIdx */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return getColonIdx; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return getSpaceIdx; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return NotFound; });
/* unused harmony export r */
/* unused harmony export n */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return getEndLineOffset; });
/* unused harmony export getHTTPHeaderEndOffset */
/* harmony import */ var _utils_index__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(0);

const r = "\r".charCodeAt(0);
const n = "\n".charCodeAt(0);
const newLine = [r, n];
const space = " ".charCodeAt(0);
const colon = ":".charCodeAt(0);
const contentLength = "content-length".split('').map(x => x.charCodeAt(0));
const NotFound = -1;
function parse64BigInt(buffer, offset) {
    throw new Error('Cannot have a 4GB packet rook.');
    // @ts-ignore
    // TODO michael fix me
    return BigInt(`0x${Object(_utils_index__WEBPACK_IMPORTED_MODULE_0__[/* uint8ArraySlice */ "c"])(buffer, offset, offset + 8).toString('hex')}`);
}
;
class BufferPool {
    constructor(size) {
        this.pool = [];
        this.size = size;
    }
    malloc() {
        if (this.pool.length === 0) {
            this.pool.push(new Uint8Array(this.size));
        }
        return this.pool.pop();
    }
    free(buffer) {
        this.pool.push(buffer);
    }
}
;
class BufferBuilder {
    constructor(buf = 4096) {
        this.ptr = 0;
        if (typeof buf === 'number') {
            this.buffer = new Uint8Array(buf);
        }
        else {
            this.buffer = buf;
        }
    }
    length() {
        return this.ptr;
    }
    getBuffer() {
        return this.buffer;
    }
    addString(str) {
        for (let i = 0; i < str.length; ++i) {
            this.buffer[this.ptr++] = str.charCodeAt(i);
        }
    }
    addNewLine() {
        this.buffer[this.ptr++] = r;
        this.buffer[this.ptr++] = n;
    }
    clear() {
        this.ptr = 0;
    }
}
function createBufferBuilder(buf = 4096) {
    return new BufferBuilder(buf);
}
;
function getCharacterIdx(buf, needle, offset, maxLength) {
    let idx = NotFound;
    maxLength = maxLength || buf.length;
    for (let i = offset; idx === NotFound && i < maxLength; ++i) {
        if (buf[i] === needle) {
            idx = i;
        }
    }
    return idx;
}
function getColonIdx(buf, offset, maxLength) {
    return getCharacterIdx(buf, colon, offset, maxLength);
}
function getSpaceIdx(buf, offset) {
    return getCharacterIdx(buf, space, offset);
}

function getEndLineOffset(buf, offset, maxLength) {
    let i = offset;
    let found = false;
    for (; i < maxLength; ++i) {
        if (buf[i] === r &&
            buf[i + 1] === n) {
            found = true;
            break;
        }
    }
    return found ? i : -1;
}
function getHTTPHeaderEndOffset(buf, offset, maxLength) {
    let i = offset;
    let found = false;
    for (; i < maxLength; ++i) {
        if (buf[i] === r &&
            buf[i + 1] === n &&
            buf[i + 2] === r &&
            buf[i + 3] === n) {
            found = true;
            break;
        }
    }
    return found ? i : -1;
}
;


/***/ }),

/***/ 17:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

// EXTERNAL MODULE: ./src/http/buffer.ts
var http_buffer = __webpack_require__(1);

// CONCATENATED MODULE: ./src/http/ws/mask.ts
function mask_mask(buf, offset, length, mask) {
    for (let i = offset, j = 0; j < length; ++j, ++i) {
        buf[i] = buf[i] ^ ((mask[j % 4]) & 0xFF);
    }
}
;

// EXTERNAL MODULE: ./src/utils/index.ts
var utils = __webpack_require__(0);

// CONCATENATED MODULE: ./src/http/ws/types.ts
// TODO: Continuation Frame
var Opcodes;
(function (Opcodes) {
    Opcodes[Opcodes["ContinuationFrame"] = 0] = "ContinuationFrame";
    Opcodes[Opcodes["TextFrame"] = 1] = "TextFrame";
    Opcodes[Opcodes["BinaryFrame"] = 2] = "BinaryFrame";
    Opcodes[Opcodes["CloseConnection"] = 8] = "CloseConnection";
    Opcodes[Opcodes["Ping"] = 9] = "Ping";
    Opcodes[Opcodes["Pong"] = 10] = "Pong";
})(Opcodes || (Opcodes = {}));
;

// EXTERNAL MODULE: ./node_modules/network-byte-order/lib/index.js
var lib = __webpack_require__(7);

// CONCATENATED MODULE: ./src/http/ws/framer.ts




// @ts-ignore

var State;
(function (State) {
    State[State["Waiting"] = 1] = "Waiting";
    State[State["ParsingHeader"] = 2] = "ParsingHeader";
    State[State["WaitingForCompleteHeader"] = 3] = "WaitingForCompleteHeader";
    State[State["ParsingBody"] = 4] = "ParsingBody";
})(State || (State = {}));
;
// NOTE: For teh stream, not for the streamer
// 1.  How to open up, insert, command, and quit.
// 2.  How to hjkl
// 3.  How to wb
// 4.  How to yp
// 5.  How to d
// 6.  How to ft
// 7.  How to xs
// 8.  How to ci({|(|[)
// 9.  How to $%
//
// TODO: Probably should do some sort of object pool.
const MAX_HEADER_SIZE = 8;
const headerPool = new http_buffer["a" /* BufferPool */](MAX_HEADER_SIZE);
const maskNumber = 0xAABBAABB;
const maskBuf = new Uint8Array(4);
const maskView = new DataView(maskBuf.buffer);
maskView.setUint32(0, maskNumber, true);
let payloadHeadersReceived = 0;
// TODO: Fulfill the RFCs requirement for masks.
// TODO: ws module may not allow us to use as simple one like this.
function generateMask() {
    return maskBuf;
}
function constructFrameHeader(buf, isFinished, opCode, payloadLength, mask) {
    let ptr = 0;
    let firstByte = 0x0;
    if (isFinished) {
        firstByte |= (0x1) << 7;
    }
    firstByte |= (opCode & 0xF);
    buf[ptr++] = firstByte;
    // payload encoding
    let secondByte = 0;
    if (mask !== undefined) {
        secondByte = 0x1 << 7;
    }
    ptr++;
    if (payloadLength <= 125) {
        secondByte |= (payloadLength & 0x7F);
    }
    else if (payloadLength < 0xFFFF) {
        secondByte |= (126 & 0x7F);
        // TODO: check my endiannes first.  This assumes LittleEndian to BigEndian.
        Object(lib["htons"])(buf, ptr, payloadLength);
        ptr += 2;
    }
    else {
        // NOTE: This should just never be an option.  It really is
        // insanity wolf to make a packet this big that would throttle the
        // whole ws pipeline.
        throw new Error('Bad implementation, Prime');
    }
    buf[1] = secondByte;
    if (mask !== undefined) {
        buf.set(mask, ptr);
        ptr += 4;
    }
    return ptr;
}
function createDefaultState(isControlFrame = false) {
    return {
        isFinished: false,
        opcode: 0,
        isControlFrame,
        isMasked: false,
        mask: new Uint8Array(4),
        payloadLength: 0,
        payloadPtr: 0,
        payloads: [],
        state: State.Waiting,
    };
}
class framer_WSFramer {
    constructor(pipe, maxFrameSize = 8096, maxPacketSize = 1024 * 1024 * 4) {
        this.callbacks = [];
        this.pipe = pipe;
        this.maxFrameSize = maxFrameSize;
        this.maxPacketSize = maxPacketSize;
        this.msgState = createDefaultState();
        this.controlState = createDefaultState(true);
        this.closed = false;
    }
    getActiveState() {
        return this.controlState.state > this.msgState.state ?
            this.controlState : this.msgState;
    }
    onFrame(cb) {
        this.callbacks.push(cb);
    }
    // TODO: Contiuation frames, spelt wrong
    send(buf, offset, length, frameType = Opcodes.BinaryFrame) {
        if (length > Math.pow(2, 32)) {
            throw new Error("You are dumb");
        }
        const endIdx = offset + length;
        let ptr = offset;
        let ptrLength = 0;
        let ft = frameType;
        let count = 0;
        const header = headerPool.malloc();
        header[0] = 0;
        do {
            const ptrStart = ptr;
            if (ptr > offset) {
                ft = Opcodes.ContinuationFrame;
            }
            const frameSize = Math.min(endIdx - ptr, this.maxFrameSize);
            const mask = generateMask();
            const headerEnd = constructFrameHeader(header, true, ft, frameSize, mask);
            const fullBuf = new Uint8Array(headerEnd + frameSize);
            fullBuf.set(header);
            const framedFrameSize = Math.min(frameSize, endIdx - ptr);
            const sub = new Uint8Array(buf.buffer, ptr, framedFrameSize);
            fullBuf.set(sub, headerEnd);
            ptr += sub.byteLength;
            mask_mask(fullBuf, headerEnd, frameSize, mask);
            // TODO if fullBuf is just to slow to send upgrade the socket
            // library to handle the same reference to the buf with different
            // offsets.
            this.pipe.write(fullBuf, 0, fullBuf.byteLength);
            ptrLength += ptr - ptrStart;
        } while (ptrLength < length);
        headerPool.free(header);
    }
    isControlFrame(packet) {
        const opCode = (packet[0] & 0x0F);
        return opCode === Opcodes.Ping ||
            opCode === Opcodes.Pong ||
            opCode === Opcodes.CloseConnection;
    }
    // TODO: Handle Continuation.
    processStreamData(packet, offset, endIdx) {
        if (this.closed) {
            throw new Error("Hey, closed for business bud.");
        }
        let ptr = offset;
        let state = this.getActiveState();
        do {
            if (state.state === State.Waiting ||
                state.state === State.WaitingForCompleteHeader) {
                // ITS GONNA DO IT.
                if (state.state === State.Waiting &&
                    this.isControlFrame(packet)) {
                    state = this.controlState;
                }
                let nextPtrOffset = 0;
                if (state.state === State.Waiting) {
                    nextPtrOffset = this.parseHeader(state, packet, ptr, endIdx);
                }
                else {
                    // TODO: Stitching control frames???
                    // CONFUSING, stitch the two headers together, and call it
                    // a day.
                    const headerBuf = headerPool.malloc();
                    const payloadByteLength = state.payload.byteLength;
                    headerBuf.set(state.payload);
                    headerBuf.set(packet.slice(0, headerBuf.length - payloadByteLength), payloadByteLength);
                    nextPtrOffset =
                        this.parseHeader(state, headerBuf, 0, MAX_HEADER_SIZE);
                    if (typeof nextPtrOffset === 'boolean') {
                        throw new Error("WHAT JUST HAPPENED HERE, DEBUG ME PLEASE");
                    }
                    nextPtrOffset -= payloadByteLength;
                    headerPool.free(headerBuf);
                }
                if (nextPtrOffset === false) {
                    state.state = State.WaitingForCompleteHeader;
                    state.payload = Object(utils["c" /* uint8ArraySlice */])(packet, ptr, endIdx);
                    break;
                }
                else {
                    // @ts-ignore
                    ptr = nextPtrOffset;
                }
            }
            state.state = State.ParsingBody;
            const remainingPacket = state.payloadLength - state.payloadPtr;
            const subEndIdx = Math.min(ptr + remainingPacket, endIdx);
            ptr += this.parseBody(state, packet, ptr, subEndIdx);
            const endOfPayload = state.payloadLength === state.payloadPtr;
            if (state.isFinished && endOfPayload) {
                state.isFinished = false;
                state.state = State.Waiting;
                this.pushFrame(state);
                if (state.opcode === Opcodes.CloseConnection) {
                    this.closed = true;
                }
            }
            // TODO: we about to go into contiuation mode, so get it baby!
            else if (!state.isFinished && endOfPayload) {
                state.payloads.push(state.payload);
                state.state = State.Waiting;
            }
        } while (ptr < endIdx);
    }
    /*
     * straight out of rfc:
     * https://tools.ietf.org/html/rfc6455
     *
      0                   1                   2                   3
      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
     +-+-+-+-+-------+-+-------------+-------------------------------+
     |F|R|R|R| opcode|M| Payload len |    Extended payload length    |
     |I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
     |N|V|V|V|       |S|             |   (if payload len==126/127)   |
     | |1|2|3|       |K|             |                               |
     +-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
     |     Extended payload length continued, if payload len == 127  |
     + - - - - - - - - - - - - - - - +-------------------------------+
     |                               |Masking-key, if MASK set to 1  |
     +-------------------------------+-------------------------------+
     | Masking-key (continued)       |          Payload Data         |
     +-------------------------------- - - - - - - - - - - - - - - - +
     :                     Payload Data continued ...                :
     + - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
     |                     Payload Data continued ...                |
     +---------------------------------------------------------------+
     */
    // TODO: Endianness????
    //
    // Send 126 bytes to find out how they order their bytes.
    parseHeader(state, packet, offset, endIdx) {
        if (endIdx - offset < MAX_HEADER_SIZE) {
            return false;
        }
        let ptr = offset;
        const byte1 = packet[ptr++];
        state.isFinished = (byte1 & (0x80)) >>> 7 === 1;
        state.rsv1 = (byte1 & 0x40) >> 6;
        state.rsv2 = (byte1 & 0x20) >> 5;
        state.rsv3 = (byte1 & 0x10) >> 4;
        const opcode = byte1 & 0xF;
        if (opcode != Opcodes.ContinuationFrame &&
            opcode != Opcodes.BinaryFrame) {
        }
        if (opcode != Opcodes.ContinuationFrame) {
            state.opcode = opcode;
        }
        const byte2 = packet[ptr++];
        state.isMasked = (byte2 & 0x80) >>> 7 === 1;
        state.payloadLength = (byte2 & 0x7F);
        if (state.payloadLength === 126) {
            state.payloadLength = Object(lib["ntohs"])(packet, ptr);
            ptr += 2;
        }
        else if (state.payloadLength === 127) {
            const pView = new DataView(packet.buffer);
            // big endian
            const payloadB = pView.getUint32(ptr + 4);
            state.payloadLength = Number(payloadB);
            ptr += 8;
        }
        if (state.isMasked) {
            state.mask = packet.slice(ptr, ptr + 4);
            ptr += 4;
        }
        state.payloadPtr = 0;
        state.payload = new Uint8Array(state.payloadLength);
        return ptr;
    }
    parseBody(state, packet, offset, endIdx) {
        // TODO: When the packet has multiple frames in it, i need to be able
        // to read what I need to read, not the whole thing, segfault incoming
        // TODO: is this ever needed?
        const remaining = state.payloadLength - state.payloadPtr;
        const sub = packet.slice(offset, endIdx);
        state.payload.set(sub, state.payloadPtr);
        const copyAmount = sub.byteLength;
        if (state.isMasked) {
            mask_mask(state.payload, state.payloadPtr, copyAmount, state.mask);
        }
        state.payloadPtr += copyAmount;
        return copyAmount;
    }
    // TODO: We make the assumption that anyone who wants to use that data
    // has to copy it, and not us.
    //
    // TODO: Obviously there is no copying here.
    pushFrame(state) {
        let buf = state.payload;
        // const fState = Object.
        //     keys(state).
        //     // @ts-ignore
        //     reduce((acc, k) => {
        //     // @ts-ignore
        //         if (state[k] instanceof Buffer) {
        //     // @ts-ignore
        //             acc[k] = `Buffer(${state[k].byteLength})`;
        //     // @ts-ignore
        //         }
        //     // @ts-ignore
        //         else {
        //     // @ts-ignore
        //             acc[k] = state[k];
        //         }
        //         return acc;
        //     }, {});
        //console.log("PushFrame", buf.byteLength, fState);
        if (state.payloads.length) {
            state.payloads.push(state.payload);
            // buf = Buffer.concat(state.payloads);
            buf = utils["b" /* uint8ArrayConcat */].apply(undefined, state.payloads);
            state.payloads = null;
        }
        // TODO: Continuation Frame
        // TODONE: *** YEAH
        this.callbacks.forEach(cb => cb(buf, state));
    }
}
;

// EXTERNAL MODULE: ./src/nrdp.ts
var nrdp = __webpack_require__(3);

// CONCATENATED MODULE: ./src/http/ws/index.ts
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ws_WS; });



const defaultOptions = {
    maxFrameSize: 8192
};
const readBuffer = new ArrayBuffer(4096);
const readView = new Uint8Array(readBuffer);
class ws_WS {
    constructor(pipe, opts = defaultOptions) {
        this.frame = new framer_WSFramer(pipe, opts.maxFrameSize);
        this.pipe = pipe;
        this.closeCBs = [];
        this.dataCBs = [];
        // The pipe is ready to read.
        pipe.ondata = () => {
            let bytesRead;
            while (1) {
                bytesRead = pipe.read(readBuffer, 0, readBuffer.byteLength);
                if (bytesRead <= 0) {
                    break;
                }
                this.frame.processStreamData(readView, 0, bytesRead);
            }
        };
        this.frame.onFrame((buffer, state) => {
            switch (state.opcode) {
                case Opcodes.CloseConnection:
                    this.closeCBs.forEach(cb => cb(buffer));
                    // attempt to close the sockfd.
                    this.pipe.close();
                    break;
                case Opcodes.Ping:
                    this.frame.send(buffer, 0, buffer.length, Opcodes.Pong);
                    break;
                case Opcodes.BinaryFrame:
                case Opcodes.TextFrame:
                    this.dataCBs.forEach(cb => cb(state, buffer));
                    break;
                default:
                    throw new Error("Can you handle this?");
            }
        });
    }
    send(obj) {
        let bufOut = null;
        let len;
        let opcode = Opcodes.BinaryFrame;
        if (obj instanceof Uint8Array) {
            opcode = Opcodes.BinaryFrame;
            bufOut = obj;
        }
        else if (typeof obj === 'object' || obj === null) {
            const str = JSON.stringify(obj);
            bufOut = nrdp["a" /* default */].atoutf8(str);
            opcode = Opcodes.TextFrame;
        }
        else {
            bufOut = nrdp["a" /* default */].atoutf8(obj);
            opcode = Opcodes.TextFrame;
        }
        this.frame.send(bufOut, 0, bufOut.length, opcode);
    }
    onClose(cb) {
        this.closeCBs.push(cb);
    }
    onData(cb) {
        this.dataCBs.push(cb);
    }
    handleControlFrame(buffer, state) {
        console.log("CONTROL FRAME", state);
    }
}


/***/ }),

/***/ 3:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export utils */
let exportObj;
if (true) {
    // @ts-ignore
    exportObj = nrdp;
}
if (false) {}
const utils = {
    copyUint8Array(from, to, targetStart = 0, sourceIdx = 0, sourceEndIdx) {
        if (true) {
            // @ts-ignore
            return from.copy(to, targetStart);
        }
        else {}
    }
};
/* harmony default export */ __webpack_exports__["a"] = (exportObj);


/***/ }),

/***/ 7:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* Copyright 2010 Membase, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */



/*jshint node:true*/


/**
 * Convert a 16-bit quantity (short integer) from host byte order to network byte order (Little-Endian to Big-Endian).
 *
 * @param {Array|Buffer} b Array of octets or a nodejs Buffer
 * @param {number} i Zero-based index at which to write into b
 * @param {number} v Value to convert
 */
exports.htons = function(b, i, v) {
	b[i] = (0xff & (v >> 8));
	b[i + 1] = (0xff & (v));
};


/**
 * Convert a 16-bit quantity (short integer) from network byte order to host byte order (Big-Endian to Little-Endian).
 *
 * @param {Array|Buffer} b Array of octets or a nodejs Buffer to read value from
 * @param {number} i Zero-based index at which to read from b
 * @returns {number}
 */
exports.ntohs = function(b, i) {
	return ((0xff & b[i]) << 8) | 
	       ((0xff & b[i + 1]));
};


/**
 * Convert a 16-bit quantity (short integer) from network byte order to host byte order (Big-Endian to Little-Endian).
 *
 * @param {string} s String to read value from
 * @param {number} i Zero-based index at which to read from s
 * @returns {number}
 */
exports.ntohsStr = function(s, i) {
	return ((0xff & s.charCodeAt(i)) << 8) |
	       ((0xff & s.charCodeAt(i + 1)));
};


/**
 * Convert a 32-bit quantity (long integer) from host byte order to network byte order (Little-Endian to Big-Endian).
 *
 * @param {Array|Buffer} b Array of octets or a nodejs Buffer
 * @param {number} i Zero-based index at which to write into b
 * @param {number} v Value to convert
 */
exports.htonl = function(b, i, v) {
	b[i] = (0xff & (v >> 24));
	b[i + 1] = (0xff & (v >> 16));
	b[i + 2] = (0xff & (v >> 8));
	b[i + 3] = (0xff & (v));
};


/**
 * Convert a 32-bit quantity (long integer) from network byte order to host byte order (Big-Endian to Little-Endian).
 *
 * @param {Array|Buffer} b Array of octets or a nodejs Buffer to read value from
 * @param {number} i Zero-based index at which to read from b
 * @returns {number}
 */
exports.ntohl = function(b, i) {
	return ((0xff & b[i]) << 24) |
	       ((0xff & b[i + 1]) << 16) |
	       ((0xff & b[i + 2]) << 8) |
	       ((0xff & b[i + 3]));
};


/**
 * Convert a 32-bit quantity (long integer) from network byte order to host byte order (Big-Endian to Little-Endian).
 *
 * @param {string} s String to read value from
 * @param {number} i Zero-based index at which to read from s
 * @returns {number}
 */
exports.ntohlStr = function(s, i) {
	return ((0xff & s.charCodeAt(i)) << 24) |
	       ((0xff & s.charCodeAt(i + 1)) << 16) |
	       ((0xff & s.charCodeAt(i + 2)) << 8) |
	       ((0xff & s.charCodeAt(i + 3)));
};


/***/ })

/******/ });