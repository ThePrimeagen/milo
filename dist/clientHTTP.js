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
/******/ 	return __webpack_require__(__webpack_require__.s = 38);
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
    var b = _nrdp__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].atoutf8(str);
    buf.set(b);
    return b.byteLength;
}
function str2ab(str, buf) {
    // TODO: You are ackshually assuming that every character is 1 byte...
    var i, strLen;
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
function arrayBufferConcat() {
    var buffers = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        buffers[_i] = arguments[_i];
    }
    // @ts-ignore
    // TODO michael fix
    return ArrayBuffer.concat.apply(ArrayBuffer, buffers);
}
function uint8ArrayConcat() {
    var buffers = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        buffers[_i] = arguments[_i];
    }
    if (false) {}
    // TODO: Make this better, but for now.
    var buf = Buffer.concat(buffers.map(function (x) {
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

var r = "\r".charCodeAt(0);
var n = "\n".charCodeAt(0);
var newLine = [r, n];
var space = " ".charCodeAt(0);
var colon = ":".charCodeAt(0);
var contentLength = "content-length".split('').map(function (x) { return x.charCodeAt(0); });
var NotFound = -1;
function parse64BigInt(buffer, offset) {
    throw new Error('Cannot have a 4GB packet rook.');
    // @ts-ignore
    // TODO michael fix me
    return BigInt("0x" + Object(_utils_index__WEBPACK_IMPORTED_MODULE_0__[/* uint8ArraySlice */ "c"])(buffer, offset, offset + 8).toString('hex'));
}
;
var BufferPool = /** @class */ (function () {
    function BufferPool(size) {
        this.pool = [];
        this.size = size;
    }
    BufferPool.prototype.malloc = function () {
        if (this.pool.length === 0) {
            this.pool.push(new Uint8Array(this.size));
        }
        return this.pool.pop();
    };
    BufferPool.prototype.free = function (buffer) {
        this.pool.push(buffer);
    };
    return BufferPool;
}());

;
var BufferBuilder = /** @class */ (function () {
    function BufferBuilder(buf) {
        if (buf === void 0) { buf = 4096; }
        this.ptr = 0;
        if (typeof buf === 'number') {
            this.buffer = new Uint8Array(buf);
        }
        else {
            this.buffer = buf;
        }
    }
    BufferBuilder.prototype.length = function () {
        return this.ptr;
    };
    BufferBuilder.prototype.getBuffer = function () {
        return this.buffer;
    };
    BufferBuilder.prototype.addString = function (str) {
        for (var i = 0; i < str.length; ++i) {
            this.buffer[this.ptr++] = str.charCodeAt(i);
        }
    };
    BufferBuilder.prototype.addNewLine = function () {
        this.buffer[this.ptr++] = r;
        this.buffer[this.ptr++] = n;
    };
    BufferBuilder.prototype.clear = function () {
        this.ptr = 0;
    };
    return BufferBuilder;
}());
function createBufferBuilder(buf) {
    if (buf === void 0) { buf = 4096; }
    return new BufferBuilder(buf);
}
;
function getCharacterIdx(buf, needle, offset, maxLength) {
    var idx = NotFound;
    maxLength = maxLength || buf.length;
    for (var i = offset; idx === NotFound && i < maxLength; ++i) {
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
    var i = offset;
    var found = false;
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
    var i = offset;
    var found = false;
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
var exportObj;
if (false) {}
if (true) {
    var sha1_1 = __webpack_require__(18);
    var atob_1 = __webpack_require__(21);
    var btoa_1 = __webpack_require__(22);
    exportObj = {
        hash: function (type, data) {
            var outStr = sha1_1(data);
            return;
        },
        btoa: btoa_1,
        atob: atob_1,
        // TODO: Assuming ASICC, probably shouldn't
        atoutf8: function (str) {
            var buf = new Uint8Array(str.length);
            var i, strLen;
            for (i = 0, strLen = str.length; i < strLen; i++) {
                buf[i] = str.charCodeAt(i);
            }
            return buf;
        },
        // TODO: Assumes Ascii
        utf8toa: function (buffer) {
            if (buffer instanceof Uint8Array) {
                return String.fromCharCode.apply(null, buffer);
            }
            return String.fromCharCode.apply(null, new Uint8Array(buffer));
        }
    };
}
var utils = {
    copyUint8Array: function (from, to, targetStart, sourceIdx, sourceEndIdx) {
        if (targetStart === void 0) { targetStart = 0; }
        if (sourceIdx === void 0) { sourceIdx = 0; }
        if (false) {}
        else {
            // TODO: YOU NEED TO CHANGE THIS NOW.
            var fromBuf = Buffer.from(from.buffer);
            var toBuf = Buffer.from(to.buffer);
            return fromBuf.copy(toBuf, targetStart, sourceIdx, sourceEndIdx);
        }
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
/* 8 */
/***/ (function(module, exports) {

var charenc = {
  // UTF-8 encoding
  utf8: {
    // Convert a string to a byte array
    stringToBytes: function(str) {
      return charenc.bin.stringToBytes(unescape(encodeURIComponent(str)));
    },

    // Convert a byte array to a string
    bytesToString: function(bytes) {
      return decodeURIComponent(escape(charenc.bin.bytesToString(bytes)));
    }
  },

  // Binary encoding
  bin: {
    // Convert a string to a byte array
    stringToBytes: function(str) {
      for (var bytes = [], i = 0; i < str.length; i++)
        bytes.push(str.charCodeAt(i) & 0xFF);
      return bytes;
    },

    // Convert a byte array to a string
    bytesToString: function(bytes) {
      for (var str = [], i = 0; i < bytes.length; i++)
        str.push(String.fromCharCode(bytes[i]));
      return str.join('');
    }
  }
};

module.exports = charenc;


/***/ }),
/* 9 */,
/* 10 */,
/* 11 */,
/* 12 */,
/* 13 */,
/* 14 */,
/* 15 */,
/* 16 */,
/* 17 */,
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

(function() {
  var crypt = __webpack_require__(20),
      utf8 = __webpack_require__(8).utf8,
      bin = __webpack_require__(8).bin,

  // The core
  sha1 = function (message) {
    // Convert to byte array
    if (message.constructor == String)
      message = utf8.stringToBytes(message);
    else if (typeof Buffer !== 'undefined' && typeof Buffer.isBuffer == 'function' && Buffer.isBuffer(message))
      message = Array.prototype.slice.call(message, 0);
    else if (!Array.isArray(message))
      message = message.toString();

    // otherwise assume byte array

    var m  = crypt.bytesToWords(message),
        l  = message.length * 8,
        w  = [],
        H0 =  1732584193,
        H1 = -271733879,
        H2 = -1732584194,
        H3 =  271733878,
        H4 = -1009589776;

    // Padding
    m[l >> 5] |= 0x80 << (24 - l % 32);
    m[((l + 64 >>> 9) << 4) + 15] = l;

    for (var i = 0; i < m.length; i += 16) {
      var a = H0,
          b = H1,
          c = H2,
          d = H3,
          e = H4;

      for (var j = 0; j < 80; j++) {

        if (j < 16)
          w[j] = m[i + j];
        else {
          var n = w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16];
          w[j] = (n << 1) | (n >>> 31);
        }

        var t = ((H0 << 5) | (H0 >>> 27)) + H4 + (w[j] >>> 0) + (
                j < 20 ? (H1 & H2 | ~H1 & H3) + 1518500249 :
                j < 40 ? (H1 ^ H2 ^ H3) + 1859775393 :
                j < 60 ? (H1 & H2 | H1 & H3 | H2 & H3) - 1894007588 :
                         (H1 ^ H2 ^ H3) - 899497514);

        H4 = H3;
        H3 = H2;
        H2 = (H1 << 30) | (H1 >>> 2);
        H1 = H0;
        H0 = t;
      }

      H0 += a;
      H1 += b;
      H2 += c;
      H3 += d;
      H4 += e;
    }

    return [H0, H1, H2, H3, H4];
  },

  // Public API
  api = function (message, options) {
    var digestbytes = crypt.wordsToBytes(sha1(message));
    return options && options.asBytes ? digestbytes :
        options && options.asString ? bin.bytesToString(digestbytes) :
        crypt.bytesToHex(digestbytes);
  };

  api._blocksize = 16;
  api._digestsize = 20;

  module.exports = api;
})();


/***/ }),
/* 19 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

// EXTERNAL MODULE: ./src/http/buffer.ts
var http_buffer = __webpack_require__(1);

// CONCATENATED MODULE: ./src/http/ws/mask.ts
function mask_mask(buf, offset, length, mask) {
    for (var i = offset, j = 0; j < length; ++j, ++i) {
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
var MAX_HEADER_SIZE = 8;
var headerPool = new http_buffer["a" /* BufferPool */](MAX_HEADER_SIZE);
var maskNumber = 0xAABBAABB;
var maskBuf = new Uint8Array(4);
var maskView = new DataView(maskBuf.buffer);
maskView.setUint32(0, maskNumber, true);
var payloadHeadersReceived = 0;
// TODO: Fulfill the RFCs requirement for masks.
// TODO: ws module may not allow us to use as simple one like this.
function generateMask() {
    return maskBuf;
}
function constructFrameHeader(buf, isFinished, opCode, payloadLength, mask) {
    var ptr = 0;
    var firstByte = 0x0;
    if (isFinished) {
        firstByte |= (0x1) << 7;
    }
    firstByte |= (opCode & 0xF);
    buf[ptr++] = firstByte;
    // payload encoding
    var secondByte = 0;
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
function createDefaultState(isControlFrame) {
    if (isControlFrame === void 0) { isControlFrame = false; }
    return {
        isFinished: false,
        opcode: 0,
        isControlFrame: isControlFrame,
        isMasked: false,
        mask: new Uint8Array(4),
        payloadLength: 0,
        payloadPtr: 0,
        payloads: [],
        state: State.Waiting,
    };
}
var framer_WSFramer = /** @class */ (function () {
    function WSFramer(pipe, maxFrameSize, maxPacketSize) {
        if (maxFrameSize === void 0) { maxFrameSize = 8096; }
        if (maxPacketSize === void 0) { maxPacketSize = 1024 * 1024 * 4; }
        this.callbacks = [];
        this.pipe = pipe;
        this.maxFrameSize = maxFrameSize;
        this.maxPacketSize = maxPacketSize;
        this.msgState = createDefaultState();
        this.controlState = createDefaultState(true);
        this.closed = false;
    }
    WSFramer.prototype.getActiveState = function () {
        return this.controlState.state > this.msgState.state ?
            this.controlState : this.msgState;
    };
    WSFramer.prototype.onFrame = function (cb) {
        this.callbacks.push(cb);
    };
    // TODO: Contiuation frames, spelt wrong
    WSFramer.prototype.send = function (buf, offset, length, frameType) {
        if (frameType === void 0) { frameType = Opcodes.BinaryFrame; }
        if (length > Math.pow(2, 32)) {
            throw new Error("You are dumb");
        }
        var endIdx = offset + length;
        var ptr = offset;
        var ptrLength = 0;
        var ft = frameType;
        var count = 0;
        var header = headerPool.malloc();
        header[0] = 0;
        do {
            var ptrStart = ptr;
            if (ptr > offset) {
                ft = Opcodes.ContinuationFrame;
            }
            var frameSize = Math.min(endIdx - ptr, this.maxFrameSize);
            var mask = generateMask();
            var headerEnd = constructFrameHeader(header, true, ft, frameSize, mask);
            var fullBuf = new Uint8Array(headerEnd + frameSize);
            fullBuf.set(header);
            var framedFrameSize = Math.min(frameSize, endIdx - ptr);
            var sub = new Uint8Array(buf.buffer, ptr, framedFrameSize);
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
    };
    WSFramer.prototype.isControlFrame = function (packet) {
        var opCode = (packet[0] & 0x0F);
        return opCode === Opcodes.Ping ||
            opCode === Opcodes.Pong ||
            opCode === Opcodes.CloseConnection;
    };
    // TODO: Handle Continuation.
    WSFramer.prototype.processStreamData = function (packet, offset, endIdx) {
        if (this.closed) {
            throw new Error("Hey, closed for business bud.");
        }
        var ptr = offset;
        var state = this.getActiveState();
        do {
            if (state.state === State.Waiting ||
                state.state === State.WaitingForCompleteHeader) {
                // ITS GONNA DO IT.
                if (state.state === State.Waiting &&
                    this.isControlFrame(packet)) {
                    state = this.controlState;
                }
                var nextPtrOffset = 0;
                if (state.state === State.Waiting) {
                    nextPtrOffset = this.parseHeader(state, packet, ptr, endIdx);
                }
                else {
                    // TODO: Stitching control frames???
                    // CONFUSING, stitch the two headers together, and call it
                    // a day.
                    var headerBuf = headerPool.malloc();
                    var payloadByteLength = state.payload.byteLength;
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
            var remainingPacket = state.payloadLength - state.payloadPtr;
            var subEndIdx = Math.min(ptr + remainingPacket, endIdx);
            ptr += this.parseBody(state, packet, ptr, subEndIdx);
            var endOfPayload = state.payloadLength === state.payloadPtr;
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
    };
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
    WSFramer.prototype.parseHeader = function (state, packet, offset, endIdx) {
        if (endIdx - offset < MAX_HEADER_SIZE) {
            return false;
        }
        var ptr = offset;
        var byte1 = packet[ptr++];
        state.isFinished = (byte1 & (0x80)) >>> 7 === 1;
        state.rsv1 = (byte1 & 0x40) >> 6;
        state.rsv2 = (byte1 & 0x20) >> 5;
        state.rsv3 = (byte1 & 0x10) >> 4;
        var opcode = byte1 & 0xF;
        if (opcode != Opcodes.ContinuationFrame &&
            opcode != Opcodes.BinaryFrame) {
        }
        if (opcode != Opcodes.ContinuationFrame) {
            state.opcode = opcode;
        }
        var byte2 = packet[ptr++];
        state.isMasked = (byte2 & 0x80) >>> 7 === 1;
        state.payloadLength = (byte2 & 0x7F);
        if (state.payloadLength === 126) {
            state.payloadLength = Object(lib["ntohs"])(packet, ptr);
            ptr += 2;
        }
        else if (state.payloadLength === 127) {
            var pView = new DataView(packet.buffer);
            // big endian
            var payloadB = pView.getUint32(ptr + 4);
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
    };
    WSFramer.prototype.parseBody = function (state, packet, offset, endIdx) {
        // TODO: When the packet has multiple frames in it, i need to be able
        // to read what I need to read, not the whole thing, segfault incoming
        // TODO: is this ever needed?
        var remaining = state.payloadLength - state.payloadPtr;
        var sub = packet.slice(offset, endIdx);
        state.payload.set(sub, state.payloadPtr);
        var copyAmount = sub.byteLength;
        if (state.isMasked) {
            mask_mask(state.payload, state.payloadPtr, copyAmount, state.mask);
        }
        state.payloadPtr += copyAmount;
        return copyAmount;
    };
    // TODO: We make the assumption that anyone who wants to use that data
    // has to copy it, and not us.
    //
    // TODO: Obviously there is no copying here.
    WSFramer.prototype.pushFrame = function (state) {
        var buf = state.payload;
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
        this.callbacks.forEach(function (cb) { return cb(buf, state); });
    };
    return WSFramer;
}());
/* harmony default export */ var framer = (framer_WSFramer);
;

// EXTERNAL MODULE: ./src/nrdp.ts
var nrdp = __webpack_require__(3);

// CONCATENATED MODULE: ./src/http/ws/index.ts



var defaultOptions = {
    maxFrameSize: 8192
};
var readBuffer = new ArrayBuffer(4096);
var readView = new Uint8Array(readBuffer);
var ws_WS = /** @class */ (function () {
    function WS(pipe, opts) {
        var _this = this;
        if (opts === void 0) { opts = defaultOptions; }
        this.frame = new framer(pipe, opts.maxFrameSize);
        this.pipe = pipe;
        this.closeCBs = [];
        this.dataCBs = [];
        // The pipe is ready to read.
        pipe.ondata = function () {
            var bytesRead;
            while (1) {
                bytesRead = pipe.read(readBuffer, 0, readBuffer.byteLength);
                if (bytesRead <= 0) {
                    break;
                }
                _this.frame.processStreamData(readView, 0, bytesRead);
            }
        };
        this.frame.onFrame(function (buffer, state) {
            switch (state.opcode) {
                case Opcodes.CloseConnection:
                    _this.closeCBs.forEach(function (cb) { return cb(buffer); });
                    // attempt to close the sockfd.
                    _this.pipe.close();
                    break;
                case Opcodes.Ping:
                    _this.frame.send(buffer, 0, buffer.length, Opcodes.Pong);
                    break;
                case Opcodes.BinaryFrame:
                case Opcodes.TextFrame:
                    _this.dataCBs.forEach(function (cb) { return cb(state, buffer); });
                    break;
                default:
                    throw new Error("Can you handle this?");
            }
        });
    }
    WS.prototype.send = function (obj) {
        var bufOut = null;
        var len;
        var opcode = Opcodes.BinaryFrame;
        if (obj instanceof Uint8Array) {
            opcode = Opcodes.BinaryFrame;
            bufOut = obj;
        }
        else if (typeof obj === 'object' || obj === null) {
            var str = JSON.stringify(obj);
            bufOut = nrdp["a" /* default */].atoutf8(str);
            opcode = Opcodes.TextFrame;
        }
        else {
            bufOut = nrdp["a" /* default */].atoutf8(obj);
            opcode = Opcodes.TextFrame;
        }
        this.frame.send(bufOut, 0, bufOut.length, opcode);
    };
    WS.prototype.onClose = function (cb) {
        this.closeCBs.push(cb);
    };
    WS.prototype.onData = function (cb) {
        this.dataCBs.push(cb);
    };
    WS.prototype.handleControlFrame = function (buffer, state) {
        console.log("CONTROL FRAME", state);
    };
    return WS;
}());
/* harmony default export */ var ws = __webpack_exports__["default"] = (ws_WS);


/***/ }),
/* 20 */
/***/ (function(module, exports) {

(function() {
  var base64map
      = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',

  crypt = {
    // Bit-wise rotation left
    rotl: function(n, b) {
      return (n << b) | (n >>> (32 - b));
    },

    // Bit-wise rotation right
    rotr: function(n, b) {
      return (n << (32 - b)) | (n >>> b);
    },

    // Swap big-endian to little-endian and vice versa
    endian: function(n) {
      // If number given, swap endian
      if (n.constructor == Number) {
        return crypt.rotl(n, 8) & 0x00FF00FF | crypt.rotl(n, 24) & 0xFF00FF00;
      }

      // Else, assume array and swap all items
      for (var i = 0; i < n.length; i++)
        n[i] = crypt.endian(n[i]);
      return n;
    },

    // Generate an array of any length of random bytes
    randomBytes: function(n) {
      for (var bytes = []; n > 0; n--)
        bytes.push(Math.floor(Math.random() * 256));
      return bytes;
    },

    // Convert a byte array to big-endian 32-bit words
    bytesToWords: function(bytes) {
      for (var words = [], i = 0, b = 0; i < bytes.length; i++, b += 8)
        words[b >>> 5] |= bytes[i] << (24 - b % 32);
      return words;
    },

    // Convert big-endian 32-bit words to a byte array
    wordsToBytes: function(words) {
      for (var bytes = [], b = 0; b < words.length * 32; b += 8)
        bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF);
      return bytes;
    },

    // Convert a byte array to a hex string
    bytesToHex: function(bytes) {
      for (var hex = [], i = 0; i < bytes.length; i++) {
        hex.push((bytes[i] >>> 4).toString(16));
        hex.push((bytes[i] & 0xF).toString(16));
      }
      return hex.join('');
    },

    // Convert a hex string to a byte array
    hexToBytes: function(hex) {
      for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
      return bytes;
    },

    // Convert a byte array to a base-64 string
    bytesToBase64: function(bytes) {
      for (var base64 = [], i = 0; i < bytes.length; i += 3) {
        var triplet = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
        for (var j = 0; j < 4; j++)
          if (i * 8 + j * 6 <= bytes.length * 8)
            base64.push(base64map.charAt((triplet >>> 6 * (3 - j)) & 0x3F));
          else
            base64.push('=');
      }
      return base64.join('');
    },

    // Convert a base-64 string to a byte array
    base64ToBytes: function(base64) {
      // Remove non-base-64 characters
      base64 = base64.replace(/[^A-Z0-9+\/]/ig, '');

      for (var bytes = [], i = 0, imod4 = 0; i < base64.length;
          imod4 = ++i % 4) {
        if (imod4 == 0) continue;
        bytes.push(((base64map.indexOf(base64.charAt(i - 1))
            & (Math.pow(2, -2 * imod4 + 8) - 1)) << (imod4 * 2))
            | (base64map.indexOf(base64.charAt(i)) >>> (6 - imod4 * 2)));
      }
      return bytes;
    }
  };

  module.exports = crypt;
})();


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function atob(str) {
  return Buffer.from(str, 'base64').toString('binary');
}

module.exports = atob.atob = atob;


/***/ }),
/* 22 */
/***/ (function(module, exports) {

(function () {
  "use strict";

  function btoa(str) {
    var buffer;

    if (str instanceof Buffer) {
      buffer = str;
    } else {
      buffer = Buffer.from(str.toString(), 'binary');
    }

    return buffer.toString('base64');
  }

  module.exports = btoa;
}());


/***/ }),
/* 23 */,
/* 24 */,
/* 25 */,
/* 26 */,
/* 27 */,
/* 28 */,
/* 29 */,
/* 30 */,
/* 31 */,
/* 32 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(__filename) {/**
 * Module dependencies.
 */

var fs = __webpack_require__(35),
  path = __webpack_require__(32),
  fileURLToPath = __webpack_require__(36),
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
/* 34 */,
/* 35 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {


/**
 * Module dependencies.
 */

var sep = __webpack_require__(32).sep || '/';

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
/* 37 */,
/* 38 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

// EXTERNAL MODULE: ./node_modules/bindings/bindings.js
var bindings = __webpack_require__(33);
var bindings_default = /*#__PURE__*/__webpack_require__.n(bindings);

// CONCATENATED MODULE: ./src/bindings.ts

// Special case handling for node native layer.
// @ts-ignore
var b = bindings_default()('native-sockets');
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
var WS_KEY = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
function switchProtocolResponse(key) {
    return [
        "HTTP/1.1 101 Switching Protocols",
        "Upgrade: websocket",
        "Connection: Upgrade",
        "Sec-WebSocket-Accept: " + key,
    ];
}
function getResponseWSKey(incomingKey) {
    var shadKey;
    if (false) {}
    else {
        var sha1 = __webpack_require__(18);
        shadKey = sha1(incomingKey + WS_KEY);
        return Buffer.from(shadKey, 'hex').toString('base64');
    }
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





var switchingProtocolsStr = "HTTP/1.1 101 Switching Protocols";
var switchingProtocolsBuf = new Uint8Array(switchingProtocolsStr.length);
Object(utils["d" /* uint8ArrayWriteString */])(switchingProtocolsBuf, switchingProtocolsStr);
var http_HTTP = /** @class */ (function () {
    function HTTP() {
    }
    HTTP.isWSUpgradeRequest = function (packet) {
        return packet.headers[HeaderKey.Upgrade] === 'websocket' &&
            !!packet.headers[HeaderKey.SecWebSocketKey];
    };
    HTTP.prototype.getWsKeyGenerated = function () {
        return this.wsKeyGenerated;
    };
    HTTP.prototype.upgradeToWS = function (socketId, host, path) {
        var wsUpgrade = Object(http_buffer["c" /* createBufferBuilder */])(1024);
        var key = this.wsKeyGenerated = generateWSUpgradeKey();
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
        var buf = wsUpgrade.getBuffer();
        var len = wsUpgrade.length();
        console.log("Sending", Object(utils["a" /* ab2str */])(Object(utils["c" /* uint8ArraySlice */])(buf, 0, len)));
        src_bindings.send(socketId, buf, len, 0);
    };
    HTTP.prototype.respondToWSUpgrade = function (socketId, incoming) {
        var key = incoming.headers[HeaderKey.SecWebSocketKey];
        var base64Key = getResponseWSKey(key);
        var buffer = Object(http_buffer["c" /* createBufferBuilder */])(1024);
        switchProtocolResponse(base64Key).forEach(function (str) {
            buffer.addString(str);
            buffer.addNewLine();
        });
        src_bindings.send(socketId, buffer.getBuffer(), buffer.length(), 0);
    };
    HTTP.prototype.validateUpgrade = function (httpRequest) {
        var base64Key = getResponseWSKey(this.wsKeyGenerated);
        return base64Key === httpRequest.headers[HeaderKey.SecWebSocketAccept];
    };
    return HTTP;
}());
/* harmony default export */ var http = (http_HTTP);
function isUpgradeToWebsockets(buf) {
    var isEqual = true;
    for (var i = 0; i < switchingProtocolsBuf.byteLength && isEqual; ++i) {
        isEqual = isEqual && buf[i] === switchingProtocolsBuf[i];
    }
    return isEqual;
}
function getSlowCasePath(buf, offset, maxLength) {
    var out = {};
    var ptr = offset;
    var spaceIdx = Object(http_buffer["f" /* getSpaceIdx */])(buf, ptr);
    var requestType = Object(utils["a" /* ab2str */])(Object(utils["c" /* uint8ArraySlice */])(buf, ptr, spaceIdx));
    if (requestType !== RequestTypes.GET &&
        requestType !== RequestTypes.POST) {
        throw new Error('Unsupported HTTP types');
    }
    out.requestType = requestType;
    ptr = spaceIdx + 1;
    spaceIdx = Object(http_buffer["f" /* getSpaceIdx */])(buf, ptr);
    out.uri = Object(utils["a" /* ab2str */])(Object(utils["c" /* uint8ArraySlice */])(buf, ptr, spaceIdx));
    ptr = spaceIdx + 1;
    var protocol = Object(utils["a" /* ab2str */])(Object(utils["c" /* uint8ArraySlice */])(buf, ptr, maxLength));
    if (protocol !== Protocol.HTTP1_1) {
        throw new Error("Unsupported Protocol " + protocol);
    }
    out.protocol = protocol;
    return out;
}
function slowCaseParseHttp(buf, offset, maxLength) {
    var ptr = offset;
    var out = { headers: {} };
    var headers = out.headers;
    var endLineIdx = Object(http_buffer["e" /* getEndLineOffset */])(buf, ptr, maxLength);
    if (endLineIdx === http_buffer["b" /* NotFound */]) {
        throw new Error("Not valid HTTP");
    }
    if (!isUpgradeToWebsockets(Object(utils["c" /* uint8ArraySlice */])(buf, offset))) {
        var path = Object(utils["c" /* uint8ArraySlice */])(buf, offset, endLineIdx);
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
        var colonIdx = Object(http_buffer["d" /* getColonIdx */])(buf, ptr, maxLength);
        var key = Object(utils["a" /* ab2str */])(Object(utils["c" /* uint8ArraySlice */])(buf, ptr, colonIdx));
        ptr = colonIdx + 1;
        var value = Object(utils["a" /* ab2str */])(Object(utils["c" /* uint8ArraySlice */])(buf, ptr, endLineIdx));
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
var http_ws = __webpack_require__(19);

// CONCATENATED MODULE: ./src/utils/onSelect.ts
function onSelect(selectFn, sockfd, fdSet) {
    return new Promise(function (res, rej) {
        selectFn(sockfd, fdSet, function (err, value) {
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


var socket_utils_bindings = src_bindings;
var noop = function () { };
var queue = [];
var running = false;
// TODO: If buffer creation is making everything slow then we will split the
// header from the body, but ensure we can send that.
function sendWithQueue() {
    if (queue.length === 0) {
        return;
    }
    var item = queue[0];
    var buf = Object(utils["c" /* uint8ArraySlice */])(item.buffer, item.idx, item.buffer.byteLength);
    var len = item.buffer.byteLength - item.idx;
    var sentBytes = socket_utils_bindings.send(item.socketId, buf, len, item.flags);
    // TODO: write yourself a damn linked listn already.
    if (sentBytes === len) {
        var sf = queue.shift();
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
function send(socketId, buffer, flags, cb) {
    if (flags === void 0) { flags = 0; }
    if (cb === void 0) { cb = null; }
    var sF = {
        socketId: socketId,
        buffer: buffer,
        idx: 0,
        flags: flags,
        cb: cb
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
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};





var SOCK_STREAM = src_bindings.SOCK_STREAM, AF_INET = src_bindings.AF_INET, AI_PASSIVE = src_bindings.AI_PASSIVE, socket = src_bindings.socket, getaddrinfo = src_bindings.getaddrinfo, connect = src_bindings.connect, client_send = src_bindings.send, recv = src_bindings.recv, accept = src_bindings.accept, client_select = src_bindings.select, client_close = src_bindings.close, FD_CLR = src_bindings.FD_CLR, FD_SET = src_bindings.FD_SET, FD_ZERO = src_bindings.FD_ZERO, FD_ISSET = src_bindings.FD_ISSET, newAddrInfo = src_bindings.newAddrInfo, isValidSocket = src_bindings.isValidSocket, getErrorString = src_bindings.getErrorString, gai_strerror = src_bindings.gai_strerror, addrInfoToObject = src_bindings.addrInfoToObject;
var addrHints = {
    ai_socktype: SOCK_STREAM,
    ai_family: AF_INET
};
var hintsId = newAddrInfo(addrHints);
var bindId = newAddrInfo();
console.log("XXXX - localhost", "8080");
var addrInfoResult = getaddrinfo(0, "8080", hintsId, bindId);
if (addrInfoResult) {
    console.error("Unable to getaddrinfo.  Also stop using this method you dingus");
    process.abort();
}
var bindData = addrInfoToObject(bindId);
var client_socketId = socket(bindData.ai_family, bindData.ai_socktype, bindData.ai_protocol);
console.log("Sacket id", client_socketId);
if (!isValidSocket(client_socketId)) {
    console.error("Unable to create the socket", getErrorString());
    process.abort();
}
console.log("about to connect");
var connectStatus = connect(client_socketId, bindId);
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
var client_http = new http();
var client_host = "localhost:8080";
var client_path = "/";
client_http.upgradeToWS(client_socketId, client_host, client_path);
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var buf, fdSet, count, connected, bytesRead, parsedMsg, bytesReadOffset, pipe, ws, dataCount, then, bytesReceived, packetBytesReceived;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    buf = new Uint8Array(4096 * 32);
                    fdSet = src_bindings.fd_set();
                    count = 0;
                    connected = false;
                    _a.label = 1;
                case 1:
                    FD_ZERO(fdSet);
                    FD_SET(client_socketId, fdSet);
                    return [4 /*yield*/, onSelect(client_select, client_socketId, fdSet)];
                case 2:
                    _a.sent();
                    connected = FD_ISSET(client_socketId, fdSet);
                    _a.label = 3;
                case 3:
                    if (!connected && ++count < 5) return [3 /*break*/, 1];
                    _a.label = 4;
                case 4:
                    if (!connected) {
                        throw new Error("You are dumb");
                    }
                    bytesRead = recv(client_socketId, buf, 4096);
                    if (bytesRead === 0) {
                        throw new Error("How did you get closed so fast?");
                    }
                    parsedMsg = slowCaseParseHttp(buf, 0, bytesRead);
                    if (!client_http.validateUpgrade(parsedMsg)) {
                        throw new Error("Not a valid rvsp");
                    }
                    console.log("We actually really did it.  Like for real, ws are connected.");
                    bytesReadOffset = 0;
                    pipe = {
                        read: function (dat, offset, length) {
                            var amountToRead = Math.min(length, bytesRead);
                            var readBuf = (dat instanceof ArrayBuffer ? new Uint8Array(dat) : dat);
                            readBuf.set(buf.subarray(bytesReadOffset, bytesReadOffset + amountToRead), offset);
                            // Adjust the bytes.
                            bytesRead -= amountToRead;
                            bytesReadOffset += amountToRead;
                            return amountToRead;
                        },
                        write: function (dat, offset, length) {
                            var buf;
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
                        close: function () {
                            client_close(client_socketId);
                        }
                    };
                    ws = new http_ws["default"](pipe);
                    dataCount = 0;
                    then = Date.now();
                    bytesReceived = 0;
                    packetBytesReceived = 0;
                    ws.send("send");
                    ws.onData(function parseWSData(state, buffer) {
                        bytesReceived += buffer.byteLength;
                        packetBytesReceived = 0;
                        if (++dataCount === 1000) {
                            var now = Date.now();
                            console.log("Total Bytes Received:", bytesReceived);
                            console.log("Time Spent:", now - then);
                            console.log("Mbps:", (bytesReceived / (now - then)) * 1000);
                            return;
                        }
                        else if (dataCount < 1000) {
                            ws.send("send");
                        }
                    });
                    _a.label = 5;
                case 5:
                    if (false) {}
                    FD_ZERO(fdSet);
                    FD_SET(client_socketId, fdSet);
                    return [4 /*yield*/, onSelect(client_select, client_socketId, fdSet)];
                case 6:
                    _a.sent();
                    if (FD_ISSET(client_socketId, fdSet)) {
                        bytesRead = recv(client_socketId, buf, 4096, 0);
                        bytesReadOffset = 0;
                        packetBytesReceived += bytesRead;
                        // denoting pipe is ready to be read.
                        pipe.ondata();
                    }
                    return [3 /*break*/, 5];
                case 7: return [2 /*return*/];
            }
        });
    });
}
run();


/***/ })
/******/ ]);