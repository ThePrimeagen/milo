(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global['milo-sockets'] = {}));
}(this, (function (exports) { 'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function unwrapExports (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var nrdp_1 = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	var exportObj;
	{
	    // @ts-ignore
	    exportObj = nrdp;
	}
	exports.utils = {
	    copyUint8Array: function (from, to, targetStart, sourceIdx, sourceEndIdx) {
	        if (targetStart === void 0) { targetStart = 0; }
	        {
	            // @ts-ignore
	            return from.copy(to, targetStart);
	        }
	    }
	};
	exports.default = exportObj;

	});

	unwrapExports(nrdp_1);
	var nrdp_2 = nrdp_1.utils;

	var utils = createCommonjsModule(function (module, exports) {
	var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	var nrdp_1$1 = __importDefault(nrdp_1);
	function ab2str(buf) {
	    return nrdp_1$1.default.utf8toa(buf);
	}
	exports.ab2str = ab2str;
	function uint8ArrayWriteString(buf, str) {
	    var b = nrdp_1$1.default.atoutf8(str);
	    buf.set(b);
	    return b.byteLength;
	}
	exports.uint8ArrayWriteString = uint8ArrayWriteString;
	function str2ab(str, buf) {
	    // TODO: You are ackshually assuming that every character is 1 byte...
	    var i, strLen;
	    for (i = 0, strLen = str.length; i < strLen; i++) {
	        buf[i] = str.charCodeAt(i);
	    }
	    return i;
	}
	exports.str2ab = str2ab;
	function arrayBufferSlice(buf, start, end) {
	    if (buf instanceof ArrayBuffer) {
	        return buf.slice(start, end);
	    }
	    else {
	        return buf.buffer.slice(start + buf.byteOffset, end);
	    }
	}
	exports.arrayBufferSlice = arrayBufferSlice;
	function uint8ArraySlice(buf, start, end) {
	    if (buf instanceof ArrayBuffer) {
	        return new Uint8Array(buf).subarray(start, end);
	    }
	    return buf.subarray(start, end);
	}
	exports.uint8ArraySlice = uint8ArraySlice;
	function arrayBufferConcat() {
	    var buffers = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        buffers[_i] = arguments[_i];
	    }
	    // @ts-ignore
	    // TODO michael fix
	    return ArrayBuffer.concat.apply(ArrayBuffer, buffers);
	}
	exports.arrayBufferConcat = arrayBufferConcat;
	function uint8ArrayConcat() {
	    var buffers = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        buffers[_i] = arguments[_i];
	    }
	    {
	        // @ts-ignore
	        return new Uint8Array(ArrayBuffer.concat.apply(ArrayBuffer, buffers));
	    }
	}
	exports.uint8ArrayConcat = uint8ArrayConcat;

	});

	unwrapExports(utils);
	var utils_1 = utils.ab2str;
	var utils_2 = utils.uint8ArrayWriteString;
	var utils_3 = utils.str2ab;
	var utils_4 = utils.arrayBufferSlice;
	var utils_5 = utils.uint8ArraySlice;
	var utils_6 = utils.arrayBufferConcat;
	var utils_7 = utils.uint8ArrayConcat;

	var buffer = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });

	var r = "\r".charCodeAt(0);
	exports.r = r;
	var n = "\n".charCodeAt(0);
	exports.n = n;
	var space = " ".charCodeAt(0);
	var colon = ":".charCodeAt(0);
	var contentLength = "content-length".split('').map(function (x) { return x.charCodeAt(0); });
	var NotFound = -1;
	exports.NotFound = NotFound;
	function parse64BigInt(buffer, offset) {
	    throw new Error('Cannot have a 4GB packet rook.');
	}
	exports.parse64BigInt = parse64BigInt;
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
	exports.BufferPool = BufferPool;
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
	exports.createBufferBuilder = createBufferBuilder;
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
	exports.getCharacterIdx = getCharacterIdx;
	function getColonIdx(buf, offset, maxLength) {
	    return getCharacterIdx(buf, colon, offset, maxLength);
	}
	exports.getColonIdx = getColonIdx;
	function getSpaceIdx(buf, offset) {
	    return getCharacterIdx(buf, space, offset);
	}
	exports.getSpaceIdx = getSpaceIdx;
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
	exports.getEndLineOffset = getEndLineOffset;
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
	exports.getHTTPHeaderEndOffset = getHTTPHeaderEndOffset;

	});

	unwrapExports(buffer);
	var buffer_1 = buffer.r;
	var buffer_2 = buffer.n;
	var buffer_3 = buffer.NotFound;
	var buffer_4 = buffer.parse64BigInt;
	var buffer_5 = buffer.BufferPool;
	var buffer_6 = buffer.createBufferBuilder;
	var buffer_7 = buffer.getCharacterIdx;
	var buffer_8 = buffer.getColonIdx;
	var buffer_9 = buffer.getSpaceIdx;
	var buffer_10 = buffer.getEndLineOffset;
	var buffer_11 = buffer.getHTTPHeaderEndOffset;

	var mask_1 = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	function mask(buf, offset, length, mask) {
	    for (var i = offset, j = 0; j < length; ++j, ++i) {
	        buf[i] = buf[i] ^ ((mask[j % 4]) & 0xFF);
	    }
	}
	exports.default = mask;

	});

	unwrapExports(mask_1);

	var types = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	// TODO: Continuation Frame
	var Opcodes;
	(function (Opcodes) {
	    Opcodes[Opcodes["ContinuationFrame"] = 0] = "ContinuationFrame";
	    Opcodes[Opcodes["TextFrame"] = 1] = "TextFrame";
	    Opcodes[Opcodes["BinaryFrame"] = 2] = "BinaryFrame";
	    Opcodes[Opcodes["CloseConnection"] = 8] = "CloseConnection";
	    Opcodes[Opcodes["Ping"] = 9] = "Ping";
	    Opcodes[Opcodes["Pong"] = 10] = "Pong";
	})(Opcodes = exports.Opcodes || (exports.Opcodes = {}));

	});

	unwrapExports(types);
	var types_1 = types.Opcodes;

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
	var htons = function(b, i, v) {
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
	var ntohs = function(b, i) {
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
	var ntohsStr = function(s, i) {
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
	var htonl = function(b, i, v) {
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
	var ntohl = function(b, i) {
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
	var ntohlStr = function(s, i) {
		return ((0xff & s.charCodeAt(i)) << 24) |
		       ((0xff & s.charCodeAt(i + 1)) << 16) |
		       ((0xff & s.charCodeAt(i + 2)) << 8) |
		       ((0xff & s.charCodeAt(i + 3)));
	};

	var lib = {
		htons: htons,
		ntohs: ntohs,
		ntohsStr: ntohsStr,
		htonl: htonl,
		ntohl: ntohl,
		ntohlStr: ntohlStr
	};

	var framer = createCommonjsModule(function (module, exports) {
	var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });

	var mask_1$1 = __importDefault(mask_1);


	// @ts-ignore

	var State;
	(function (State) {
	    State[State["Waiting"] = 1] = "Waiting";
	    State[State["ParsingHeader"] = 2] = "ParsingHeader";
	    State[State["WaitingForCompleteHeader"] = 3] = "WaitingForCompleteHeader";
	    State[State["ParsingBody"] = 4] = "ParsingBody";
	})(State || (State = {}));
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
	var headerPool = new buffer.BufferPool(MAX_HEADER_SIZE);
	var maskNumber = 0xAABBAABB;
	var maskBuf = new Uint8Array(4);
	var maskView = new DataView(maskBuf.buffer);
	maskView.setUint32(0, maskNumber, true);
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
	        lib.htons(buf, ptr, payloadLength);
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
	exports.constructFrameHeader = constructFrameHeader;
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
	var WSFramer = /** @class */ (function () {
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
	        if (frameType === void 0) { frameType = types.Opcodes.BinaryFrame; }
	        if (length > Math.pow(2, 32)) {
	            throw new Error("You are dumb");
	        }
	        var endIdx = offset + length;
	        var ptr = offset;
	        var ptrLength = 0;
	        var ft = frameType;
	        var header = headerPool.malloc();
	        header[0] = 0;
	        do {
	            var ptrStart = ptr;
	            if (ptr > offset) {
	                ft = types.Opcodes.ContinuationFrame;
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
	            mask_1$1.default(fullBuf, headerEnd, frameSize, mask);
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
	        return opCode === types.Opcodes.Ping ||
	            opCode === types.Opcodes.Pong ||
	            opCode === types.Opcodes.CloseConnection;
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
	                    headerBuf.set(packet.subarray(0, headerBuf.length - payloadByteLength), payloadByteLength);
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
	                    state.payload = utils.uint8ArraySlice(packet, ptr, endIdx);
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
	                if (state.opcode === types.Opcodes.CloseConnection) {
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
	        if (opcode != types.Opcodes.ContinuationFrame &&
	            opcode != types.Opcodes.BinaryFrame) ;
	        if (opcode != types.Opcodes.ContinuationFrame) {
	            state.opcode = opcode;
	        }
	        var byte2 = packet[ptr++];
	        state.isMasked = (byte2 & 0x80) >>> 7 === 1;
	        state.payloadLength = (byte2 & 0x7F);
	        if (state.payloadLength === 126) {
	            state.payloadLength = lib.ntohs(packet, ptr);
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
	            state.mask = new Uint8Array(4);
	            var maskInView = new DataView(packet.subarray(ptr, ptr + 4).buffer);
	            var stateMaskView = new DataView(state.mask.buffer);
	            stateMaskView.setUint32(0, maskView.getUint32(0));
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
	        var sub = packet.subarray(offset, endIdx);
	        state.payload.set(sub, state.payloadPtr);
	        var copyAmount = sub.byteLength;
	        if (state.isMasked) {
	            mask_1$1.default(state.payload, state.payloadPtr, copyAmount, state.mask);
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
	            buf = utils.uint8ArrayConcat.apply(undefined, state.payloads);
	            state.payloads = null;
	        }
	        // TODO: Continuation Frame
	        // TODONE: *** YEAH
	        this.callbacks.forEach(function (cb) { return cb(buf, state); });
	    };
	    return WSFramer;
	}());
	exports.default = WSFramer;

	});

	unwrapExports(framer);
	var framer_1 = framer.constructFrameHeader;

	var ws = createCommonjsModule(function (module, exports) {
	var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	var framer_1 = __importDefault(framer);
	var nrdp_1$1 = __importDefault(nrdp_1);

	var defaultOptions = {
	    maxFrameSize: 8192
	};
	var readBuffer = new ArrayBuffer(4096);
	var readView = new Uint8Array(readBuffer);
	var WS = /** @class */ (function () {
	    function WS(pipe, opts) {
	        var _this = this;
	        if (opts === void 0) { opts = defaultOptions; }
	        this.frame = new framer_1.default(pipe, opts.maxFrameSize);
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
	                case types.Opcodes.CloseConnection:
	                    _this.closeCBs.forEach(function (cb) { return cb(buffer); });
	                    // attempt to close the sockfd.
	                    _this.pipe.close();
	                    break;
	                case types.Opcodes.Ping:
	                    _this.frame.send(buffer, 0, buffer.length, types.Opcodes.Pong);
	                    break;
	                case types.Opcodes.BinaryFrame:
	                case types.Opcodes.TextFrame:
	                    _this.dataCBs.forEach(function (cb) { return cb(state, buffer); });
	                    break;
	                default:
	                    throw new Error("Can you handle this?");
	            }
	        });
	    }
	    WS.prototype.send = function (obj) {
	        var bufOut = null;
	        var opcode = types.Opcodes.BinaryFrame;
	        if (obj instanceof Uint8Array) {
	            opcode = types.Opcodes.BinaryFrame;
	            bufOut = obj;
	        }
	        else if (typeof obj === 'object' || obj === null) {
	            var str = JSON.stringify(obj);
	            bufOut = nrdp_1$1.default.atoutf8(str);
	            opcode = types.Opcodes.TextFrame;
	        }
	        else {
	            bufOut = nrdp_1$1.default.atoutf8(obj);
	            opcode = types.Opcodes.TextFrame;
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
	exports.default = WS;

	});

	var index = unwrapExports(ws);

	exports.default = index;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
