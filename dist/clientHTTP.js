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
/******/ 	return __webpack_require__(__webpack_require__.s = 33);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
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
/* 1 */
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
/* 2 */,
/* 3 */
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
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */
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


/***/ }),
/* 8 */,
/* 9 */,
/* 10 */,
/* 11 */,
/* 12 */,
/* 13 */,
/* 14 */,
/* 15 */,
/* 16 */,
/* 17 */
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
/* 18 */,
/* 19 */,
/* 20 */,
/* 21 */,
/* 22 */,
/* 23 */,
/* 24 */,
/* 25 */,
/* 26 */,
/* 27 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(__filename) {/**
 * Module dependencies.
 */

var fs = __webpack_require__(30),
  path = __webpack_require__(27),
  fileURLToPath = __webpack_require__(31),
  join = path.join,
  dirname = path.dirname,
  exists =
    (fs.accessSync &&
      function(path) {
        try {
          fs.accessSync(path);
        } catch (e) {
          return false;
        }
        return true;
      }) ||
    fs.existsSync ||
    path.existsSync,
  defaults = {
    arrow: process.env.NODE_BINDINGS_ARROW || ' → ',
    compiled: process.env.NODE_BINDINGS_COMPILED_DIR || 'compiled',
    platform: process.platform,
    arch: process.arch,
    nodePreGyp:
      'node-v' +
      process.versions.modules +
      '-' +
      process.platform +
      '-' +
      process.arch,
    version: process.versions.node,
    bindings: 'bindings.node',
    try: [
      // node-gyp's linked version in the "build" dir
      ['module_root', 'build', 'bindings'],
      // node-waf and gyp_addon (a.k.a node-gyp)
      ['module_root', 'build', 'Debug', 'bindings'],
      ['module_root', 'build', 'Release', 'bindings'],
      // Debug files, for development (legacy behavior, remove for node v0.9)
      ['module_root', 'out', 'Debug', 'bindings'],
      ['module_root', 'Debug', 'bindings'],
      // Release files, but manually compiled (legacy behavior, remove for node v0.9)
      ['module_root', 'out', 'Release', 'bindings'],
      ['module_root', 'Release', 'bindings'],
      // Legacy from node-waf, node <= 0.4.x
      ['module_root', 'build', 'default', 'bindings'],
      // Production "Release" buildtype binary (meh...)
      ['module_root', 'compiled', 'version', 'platform', 'arch', 'bindings'],
      // node-qbs builds
      ['module_root', 'addon-build', 'release', 'install-root', 'bindings'],
      ['module_root', 'addon-build', 'debug', 'install-root', 'bindings'],
      ['module_root', 'addon-build', 'default', 'install-root', 'bindings'],
      // node-pre-gyp path ./lib/binding/{node_abi}-{platform}-{arch}
      ['module_root', 'lib', 'binding', 'nodePreGyp', 'bindings']
    ]
  };

/**
 * The main `bindings()` function loads the compiled bindings for a given module.
 * It uses V8's Error API to determine the parent filename that this function is
 * being invoked from, which is then used to find the root directory.
 */

function bindings(opts) {
  // Argument surgery
  if (typeof opts == 'string') {
    opts = { bindings: opts };
  } else if (!opts) {
    opts = {};
  }

  // maps `defaults` onto `opts` object
  Object.keys(defaults).map(function(i) {
    if (!(i in opts)) opts[i] = defaults[i];
  });

  // Get the module root
  if (!opts.module_root) {
    opts.module_root = exports.getRoot(exports.getFileName());
  }

  // Ensure the given bindings name ends with .node
  if (path.extname(opts.bindings) != '.node') {
    opts.bindings += '.node';
  }

  // https://github.com/webpack/webpack/issues/4175#issuecomment-342931035
  var requireFunc =
     true
      ? require
      : undefined;

  var tries = [],
    i = 0,
    l = opts.try.length,
    n,
    b,
    err;

  for (; i < l; i++) {
    n = join.apply(
      null,
      opts.try[i].map(function(p) {
        return opts[p] || p;
      })
    );
    tries.push(n);
    try {
      b = opts.path ? requireFunc.resolve(n) : requireFunc(n);
      if (!opts.path) {
        b.path = n;
      }
      return b;
    } catch (e) {
      if (e.code !== 'MODULE_NOT_FOUND' &&
          e.code !== 'QUALIFIED_PATH_RESOLUTION_FAILED' &&
          !/not find/i.test(e.message)) {
        throw e;
      }
    }
  }

  err = new Error(
    'Could not locate the bindings file. Tried:\n' +
      tries
        .map(function(a) {
          return opts.arrow + a;
        })
        .join('\n')
  );
  err.tries = tries;
  throw err;
}
module.exports = exports = bindings;

/**
 * Gets the filename of the JavaScript file that invokes this function.
 * Used to help find the root directory of a module.
 * Optionally accepts an filename argument to skip when searching for the invoking filename
 */

exports.getFileName = function getFileName(calling_file) {
  var origPST = Error.prepareStackTrace,
    origSTL = Error.stackTraceLimit,
    dummy = {},
    fileName;

  Error.stackTraceLimit = 10;

  Error.prepareStackTrace = function(e, st) {
    for (var i = 0, l = st.length; i < l; i++) {
      fileName = st[i].getFileName();
      if (fileName !== __filename) {
        if (calling_file) {
          if (fileName !== calling_file) {
            return;
          }
        } else {
          return;
        }
      }
    }
  };

  // run the 'prepareStackTrace' function above
  Error.captureStackTrace(dummy);
  dummy.stack;

  // cleanup
  Error.prepareStackTrace = origPST;
  Error.stackTraceLimit = origSTL;

  // handle filename that starts with "file://"
  var fileSchema = 'file://';
  if (fileName.indexOf(fileSchema) === 0) {
    fileName = fileURLToPath(fileName);
  }

  return fileName;
};

/**
 * Gets the root directory of a module, given an arbitrary filename
 * somewhere in the module tree. The "root directory" is the directory
 * containing the `package.json` file.
 *
 *   In:  /home/nate/node-native-module/lib/index.js
 *   Out: /home/nate/node-native-module
 */

exports.getRoot = function getRoot(file) {
  var dir = dirname(file),
    prev;
  while (true) {
    if (dir === '.') {
      // Avoids an infinite loop in rare cases, like the REPL
      dir = process.cwd();
    }
    if (
      exists(join(dir, 'package.json')) ||
      exists(join(dir, 'node_modules'))
    ) {
      // Found the 'package.json' file or 'node_modules' dir; we're done
      return dir;
    }
    if (prev === dir) {
      // Got to the top
      throw new Error(
        'Could not find module root given file: "' +
          file +
          '". Do you have a `package.json` file? '
      );
    }
    // Try the parent dir next
    prev = dir;
    dir = join(dir, '..');
  }
};

/* WEBPACK VAR INJECTION */}.call(this, "/index.js"))

/***/ }),
/* 29 */,
/* 30 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {


/**
 * Module dependencies.
 */

var sep = __webpack_require__(27).sep || '/';

/**
 * Module exports.
 */

module.exports = fileUriToPath;

/**
 * File URI to Path function.
 *
 * @param {String} uri
 * @return {String} path
 * @api public
 */

function fileUriToPath (uri) {
  if ('string' != typeof uri ||
      uri.length <= 7 ||
      'file://' != uri.substring(0, 7)) {
    throw new TypeError('must pass in a file:// URI to convert to a file path');
  }

  var rest = decodeURI(uri.substring(7));
  var firstSlash = rest.indexOf('/');
  var host = rest.substring(0, firstSlash);
  var path = rest.substring(firstSlash + 1);

  // 2.  Scheme Definition
  // As a special case, <host> can be the string "localhost" or the empty
  // string; this is interpreted as "the machine from which the URL is
  // being interpreted".
  if ('localhost' == host) host = '';

  if (host) {
    host = sep + sep + host;
  }

  // 3.2  Drives, drive letters, mount points, file system root
  // Drive letters are mapped into the top of a file URI in various ways,
  // depending on the implementation; some applications substitute
  // vertical bar ("|") for the colon after the drive letter, yielding
  // "file:///c|/tmp/test.txt".  In some cases, the colon is left
  // unchanged, as in "file:///c:/tmp/test.txt".  In other cases, the
  // colon is simply omitted, as in "file:///c/tmp/test.txt".
  path = path.replace(/^(.+)\|/, '$1:');

  // for Windows, we need to invert the path separators from what a URI uses
  if (sep == '\\') {
    path = path.replace(/\//g, '\\');
  }

  if (/^.+\:/.test(path)) {
    // has Windows drive at beginning of path
  } else {
    // unix path…
    path = sep + path;
  }

  return host + path;
}


/***/ }),
/* 32 */,
/* 33 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

// EXTERNAL MODULE: ./node_modules/bindings/bindings.js
var bindings = __webpack_require__(28);
var bindings_default = /*#__PURE__*/__webpack_require__.n(bindings);

// CONCATENATED MODULE: ./src/bindings.ts

// Special case handling for node native layer.
// @ts-ignore
const b = bindings_default()('native-sockets');
/* harmony default export */ var src_bindings = (b);

// EXTERNAL MODULE: ./src/utils/index.ts
var utils = __webpack_require__(0);

// CONCATENATED MODULE: ./src/http/types.ts
;
var HeaderKey;
(function (HeaderKey) {
    HeaderKey["Upgrade"] = "Upgrade";
    HeaderKey["Connection"] = "Connection";
    HeaderKey["SecWebSocketKey"] = "Sec-WebSocket-Key";
    HeaderKey["SecWebSocketAccept"] = "Sec-WebSocket-Accept";
})(HeaderKey || (HeaderKey = {}));
;
var Protocol;
(function (Protocol) {
    Protocol["HTTP1_1"] = "HTTP/1.1";
})(Protocol || (Protocol = {}));
;
var RequestTypes;
(function (RequestTypes) {
    RequestTypes["GET"] = "GET";
    RequestTypes["POST"] = "POST";
})(RequestTypes || (RequestTypes = {}));
;

// EXTERNAL MODULE: ./src/http/buffer.ts
var http_buffer = __webpack_require__(1);

// CONCATENATED MODULE: ./src/http/ws.utils.ts
const WS_KEY = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
function switchProtocolResponse(key) {
    return [
        "HTTP/1.1 101 Switching Protocols",
        "Upgrade: websocket",
        "Connection: Upgrade",
        `Sec-WebSocket-Accept: ${key}`,
    ];
}
function getResponseWSKey(incomingKey) {
    let shadKey;
    if (true) {
        // @ts-ignore
        shadKey = nrdp.hash("sha1", incomingKey + WS_KEY);
        // @ts-ignore
        return nrdp.btoa(shadKey);
    }
    else {}
}
function validateUpgradeResponse(requestKey, responseKey) {
    return getResponseWSKey(requestKey) === responseKey;
}
;
function generateWSUpgradeKey() {
    return 'dGhlIHNhbXBsZSBub25jZQ==';
}

// CONCATENATED MODULE: ./src/http/index.ts
// TODO: Come back to the HTTP frame builder

// 1117 aabb aabb 7b22636f756e74223a307d
// 1117
// 0001 0001 0001 1110 1010 1010 1011 1011
//      rrrf
//      sssi
//      vvvn
//      123





const switchingProtocolsStr = "HTTP/1.1 101 Switching Protocols";
const switchingProtocolsBuf = new Uint8Array(switchingProtocolsStr.length);
Object(utils["d" /* uint8ArrayWriteString */])(switchingProtocolsBuf, switchingProtocolsStr);
class http_HTTP {
    static isWSUpgradeRequest(packet) {
        return packet.headers[HeaderKey.Upgrade] === 'websocket' &&
            !!packet.headers[HeaderKey.SecWebSocketKey];
    }
    getWsKeyGenerated() {
        return this.wsKeyGenerated;
    }
    upgradeToWS(socketId, host, path) {
        const wsUpgrade = Object(http_buffer["c" /* createBufferBuilder */])(1024);
        const key = this.wsKeyGenerated = generateWSUpgradeKey();
        wsUpgrade.addString("GET ");
        wsUpgrade.addString(path);
        wsUpgrade.addString(" HTTP/1.1");
        wsUpgrade.addNewLine();
        wsUpgrade.addString("Host: ");
        wsUpgrade.addString(host);
        wsUpgrade.addNewLine();
        wsUpgrade.addString("Upgrade: websocket");
        wsUpgrade.addNewLine();
        wsUpgrade.addString("Connection: Upgrade");
        wsUpgrade.addNewLine();
        wsUpgrade.addString("Sec-WebSocket-Key: ");
        wsUpgrade.addString(key);
        wsUpgrade.addNewLine();
        wsUpgrade.addString("Sec-WebSocket-Version: 13");
        wsUpgrade.addNewLine();
        wsUpgrade.addNewLine();
        const buf = wsUpgrade.getBuffer();
        const len = wsUpgrade.length();
        console.log("Sending", Object(utils["a" /* ab2str */])(Object(utils["c" /* uint8ArraySlice */])(buf, 0, len)));
        src_bindings.send(socketId, buf, len, 0);
    }
    respondToWSUpgrade(socketId, incoming) {
        const key = incoming.headers[HeaderKey.SecWebSocketKey];
        const base64Key = getResponseWSKey(key);
        const buffer = Object(http_buffer["c" /* createBufferBuilder */])(1024);
        switchProtocolResponse(base64Key).forEach(str => {
            buffer.addString(str);
            buffer.addNewLine();
        });
        src_bindings.send(socketId, buffer.getBuffer(), buffer.length(), 0);
    }
    validateUpgrade(httpRequest) {
        const base64Key = getResponseWSKey(this.wsKeyGenerated);
        return base64Key === httpRequest.headers[HeaderKey.SecWebSocketAccept];
    }
}
function isUpgradeToWebsockets(buf) {
    let isEqual = true;
    for (let i = 0; i < switchingProtocolsBuf.byteLength && isEqual; ++i) {
        isEqual = isEqual && buf[i] === switchingProtocolsBuf[i];
    }
    return isEqual;
}
function getSlowCasePath(buf, offset, maxLength) {
    const out = {};
    let ptr = offset;
    let spaceIdx = Object(http_buffer["f" /* getSpaceIdx */])(buf, ptr);
    const requestType = Object(utils["a" /* ab2str */])(Object(utils["c" /* uint8ArraySlice */])(buf, ptr, spaceIdx));
    if (requestType !== RequestTypes.GET &&
        requestType !== RequestTypes.POST) {
        throw new Error('Unsupported HTTP types');
    }
    out.requestType = requestType;
    ptr = spaceIdx + 1;
    spaceIdx = Object(http_buffer["f" /* getSpaceIdx */])(buf, ptr);
    out.uri = Object(utils["a" /* ab2str */])(Object(utils["c" /* uint8ArraySlice */])(buf, ptr, spaceIdx));
    ptr = spaceIdx + 1;
    const protocol = Object(utils["a" /* ab2str */])(Object(utils["c" /* uint8ArraySlice */])(buf, ptr, maxLength));
    if (protocol !== Protocol.HTTP1_1) {
        throw new Error(`Unsupported Protocol ${protocol}`);
    }
    out.protocol = protocol;
    return out;
}
function slowCaseParseHttp(buf, offset, maxLength) {
    let ptr = offset;
    const out = { headers: {} };
    const headers = out.headers;
    let endLineIdx = Object(http_buffer["e" /* getEndLineOffset */])(buf, ptr, maxLength);
    if (endLineIdx === http_buffer["b" /* NotFound */]) {
        throw new Error("Not valid HTTP");
    }
    if (!isUpgradeToWebsockets(Object(utils["c" /* uint8ArraySlice */])(buf, offset))) {
        const path = Object(utils["c" /* uint8ArraySlice */])(buf, offset, endLineIdx);
        out.path = getSlowCasePath(buf, offset, endLineIdx);
    }
    ptr += endLineIdx + 2;
    do {
        endLineIdx = Object(http_buffer["e" /* getEndLineOffset */])(buf, ptr, maxLength);
        // We just got the ol 2 in a row (\r\n\r\n)
        if (endLineIdx === ptr) {
            ptr += 2;
            // DONE WITH BODY, Baby
            break;
        }
        const colonIdx = Object(http_buffer["d" /* getColonIdx */])(buf, ptr, maxLength);
        const key = Object(utils["a" /* ab2str */])(Object(utils["c" /* uint8ArraySlice */])(buf, ptr, colonIdx));
        ptr = colonIdx + 1;
        let value = Object(utils["a" /* ab2str */])(Object(utils["c" /* uint8ArraySlice */])(buf, ptr, endLineIdx));
        if (value[0] === ' ') {
            value = value.substring(1);
        }
        ptr = endLineIdx + 2;
        headers[key] = value;
    } while (true);
    out.body = Object(utils["c" /* uint8ArraySlice */])(buf, ptr, maxLength);
    return out;
}
;

// EXTERNAL MODULE: ./src/http/ws/index.ts + 3 modules
var http_ws = __webpack_require__(17);

// CONCATENATED MODULE: ./src/utils/onSelect.ts
function onSelect(selectFn, sockfd, fdSet) {
    return new Promise((res, rej) => {
        selectFn(sockfd, fdSet, (err, value) => {
            if (err) {
                rej(err);
                return;
            }
            res(value);
            return;
        });
    });
}
;

// CONCATENATED MODULE: ./src/http/socket.utils.ts
// TODO: Error Handling?


const socket_utils_bindings = src_bindings;
const noop = () => { };
const queue = [];
let running = false;
// TODO: If buffer creation is making everything slow then we will split the
// header from the body, but ensure we can send that.
function sendWithQueue() {
    if (queue.length === 0) {
        return;
    }
    const item = queue[0];
    const buf = Object(utils["c" /* uint8ArraySlice */])(item.buffer, item.idx, item.buffer.byteLength);
    const len = item.buffer.byteLength - item.idx;
    const sentBytes = socket_utils_bindings.send(item.socketId, buf, len, item.flags);
    // TODO: write yourself a damn linked listn already.
    if (sentBytes === len) {
        const sf = queue.shift();
        sf.cb && sf.cb();
    }
    else {
        item.idx += sentBytes;
    }
    if (queue.length) {
        setImmediate(sendWithQueue);
    }
}
// uint8ArraySlice(buf, 0, length)
function send(socketId, buffer, flags = 0, cb = null) {
    const sF = {
        socketId,
        buffer,
        idx: 0,
        flags,
        cb
    };
    queue.push(sF);
    sendWithQueue();
}
;

// CONCATENATED MODULE: ./src/ws-server/client.ts
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};





const { SOCK_STREAM, AF_INET, AI_PASSIVE, socket, getaddrinfo, connect, send: client_send, recv, accept, select: client_select, close: client_close, FD_CLR, FD_SET, FD_ZERO, FD_ISSET, newAddrInfo, isValidSocket, getErrorString, gai_strerror, addrInfoToObject, } = src_bindings;
const addrHints = {
    ai_socktype: SOCK_STREAM,
    ai_family: AF_INET
};
const hintsId = newAddrInfo(addrHints);
const bindId = newAddrInfo();
console.log("XXXX - localhost", "8080");
const addrInfoResult = getaddrinfo(0, "8080", hintsId, bindId);
if (addrInfoResult) {
    console.error("Unable to getaddrinfo.  Also stop using this method you dingus");
    process.abort();
}
const bindData = addrInfoToObject(bindId);
const client_socketId = socket(bindData.ai_family, bindData.ai_socktype, bindData.ai_protocol);
console.log("Sacket id", client_socketId);
if (!isValidSocket(client_socketId)) {
    console.error("Unable to create the socket", getErrorString());
    process.abort();
}
console.log("about to connect");
const connectStatus = connect(client_socketId, bindId);
console.log("connectStatus", connectStatus);
if (connectStatus) {
    console.error("Unable to connect to the socket", getErrorString());
    process.abort();
}
// TODO: This interface kind of sucks...
/*
rl.on('line', function(line) {
    const len = buf.write(line);

    console.log("onLine", uint8ArraySlice(buf, 0, len), len);
    send(socketId, buf, len);
});
 */
const http = new http_HTTP();
const client_host = "localhost:8080";
const client_path = "/";
http.upgradeToWS(client_socketId, client_host, client_path);
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        // ~ 100K buffer
        const buf = new Uint8Array(4096 * 32);
        const fdSet = src_bindings.fd_set();
        let count = 0;
        let connected = false;
        do {
            FD_ZERO(fdSet);
            FD_SET(client_socketId, fdSet);
            yield onSelect(client_select, client_socketId, fdSet);
            connected = FD_ISSET(client_socketId, fdSet);
        } while (!connected && ++count < 5);
        if (!connected) {
            throw new Error("You are dumb");
        }
        let bytesRead = recv(client_socketId, buf, 4096);
        if (bytesRead === 0) {
            throw new Error("How did you get closed so fast?");
        }
        let parsedMsg = slowCaseParseHttp(buf, 0, bytesRead);
        if (!http.validateUpgrade(parsedMsg)) {
            throw new Error("Not a valid rvsp");
        }
        console.log("We actually really did it.  Like for real, ws are connected.");
        let bytesReadOffset = 0;
        const pipe = {
            read(dat, offset, length) {
                const amountToRead = Math.min(length, bytesRead);
                let readBuf = (dat instanceof ArrayBuffer ? new Uint8Array(dat) : dat);
                readBuf.set(buf.subarray(bytesReadOffset, bytesReadOffset + amountToRead), offset);
                // Adjust the bytes.
                bytesRead -= amountToRead;
                bytesReadOffset += amountToRead;
                return amountToRead;
            },
            write(dat, offset, length) {
                let buf;
                if (typeof dat === 'string') {
                    buf = null;
                }
                else if (dat instanceof ArrayBuffer) {
                    buf = new Uint8Array(dat).subarray(offset, offset + length);
                }
                else {
                    buf = dat.subarray(offset, offset + length);
                }
                send(client_socketId, buf, 0);
            },
            close() {
                client_close(client_socketId);
            }
        };
        const ws = new http_ws["default"](pipe);
        let dataCount = 0;
        let then = Date.now();
        let bytesReceived = 0;
        let packetBytesReceived = 0;
        ws.send("send");
        ws.onData(function parseWSData(state, buffer) {
            bytesReceived += buffer.byteLength;
            packetBytesReceived = 0;
            if (++dataCount === 1000) {
                const now = Date.now();
                console.log("Total Bytes Received:", bytesReceived);
                console.log("Time Spent:", now - then);
                console.log("Mbps:", (bytesReceived / (now - then)) * 1000);
                return;
            }
            else if (dataCount < 1000) {
                ws.send("send");
            }
        });
        while (true) {
            FD_ZERO(fdSet);
            FD_SET(client_socketId, fdSet);
            yield onSelect(client_select, client_socketId, fdSet);
            if (FD_ISSET(client_socketId, fdSet)) {
                bytesRead = recv(client_socketId, buf, 4096, 0);
                bytesReadOffset = 0;
                packetBytesReceived += bytesRead;
                // denoting pipe is ready to be read.
                pipe.ondata();
            }
        }
    });
}
run();


/***/ })
/******/ ]);