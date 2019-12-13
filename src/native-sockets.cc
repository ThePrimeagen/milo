#include "native-sockets.h"
#include "ReadWorker.h"
#include <map>
#include <napi.h>
#include <vector>

std::map<int, struct addrinfo*> addrInfos;
//std::map<SOCKET, Napi::Function> readCallbacks;
//SelectAsyncWorker *worker = nullptr;

Napi::Value OnSelect(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    char *errMsg = strerror(GETSOCKETERRNO());

    return Napi::String::New(env, errMsg);
}

Napi::Value getErrorString(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    char *errMsg = strerror(GETSOCKETERRNO());

    return Napi::String::New(env, errMsg);
}

Napi::Value Gai_strerror(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    const char *errMsg = gai_strerror(toInt(info[0]));

    return Napi::String::New(env, errMsg);
}

Napi::Value Connect(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() != 2) {
        Napi::TypeError::New(env, "Wrong number of arguments")
            .ThrowAsJavaScriptException();
        return env.Null();
    }

    if (!info[0].IsNumber() || !info[1].IsNumber()) {
        Napi::TypeError::New(env, "Wrong type of arguments")
            .ThrowAsJavaScriptException();
        return env.Null();
    }

    struct addrinfo* bindAddress = addrInfos[toInt(info[1])];
    int status =
        connect(toInt(info[0]), bindAddress->ai_addr, bindAddress->ai_addrlen);

    return Napi::Number::New(env, status);
}

Napi::Value IsValidSocket(const Napi::CallbackInfo& info) {
    return Napi::Boolean::New(info.Env(), ISVALIDSOCKET((int)info[0].As<Napi::Number>().DoubleValue()));
}

Napi::Value OnRecv(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() != 4) {
        Napi::TypeError::New(env, "Wrong number of arguments")
            .ThrowAsJavaScriptException();
        return env.Undefined();
    }

    if (!info[0].IsNumber() ||
            !info[1].IsBuffer() ||
            !info[2].IsNumber() ||
            !info[3].IsFunction()) {
        Napi::TypeError::New(env, "Wrong type of arguments")
            .ThrowAsJavaScriptException();
        return env.Undefined();
    }


    Napi::Function fn = info[3].As<Napi::Function>();
    Napi::Buffer<unsigned char> buf = info[1].As<Napi::Buffer<unsigned char>>();
    SOCKET sock = toInt(info[0]);
    int offest = toInt(info[2]);

    ReadWorker* worker = new ReadWorker(fn, sock, buf, offest);
    worker->Queue();

    //Napi::Function& callback, SOCKET socket, Napi::Buffer<unsigned char*> buf, int offset
    return env.Undefined();
}

Napi::Value Send(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() != 3 && info.Length() != 4) {
        Napi::TypeError::New(env, "Wrong number of arguments")
            .ThrowAsJavaScriptException();
        return env.Null();
    }

    if (!info[0].IsNumber() || !info[1].IsArrayBuffer() || !info[2].IsNumber() ||
            (info.Length() == 4 && !info[3].IsNumber())) {
        Napi::TypeError::New(env, "Wrong type of arguments")
            .ThrowAsJavaScriptException();
        return env.Null();
    }

    int flags = 0;
    SOCKET sock = toInt(info[0]);
    Napi::Buffer<unsigned char> buf = info[1].As<Napi::Buffer<unsigned char>>();
    int len = toInt(info[2]);

    if (info.Length() == 4) {
        flags = toInt(info[3]);
    }

    printf("XXXX - %d\n", len);

    unsigned char* data = buf.TypedArrayOf<unsigned char>::Data();

    printf("data being sent %.*s\n", len, data);

    // TODO: interesting?  Partially sent packets due to overwhelmed network card.
    ssize_t sent = send(sock, data, len, flags);

    if (sent < len) {
        printf("XXXXX - Length is greater than size of sent bytes, you are in trouble sir. %d - %zu\n", len, sent);
    }

    return Napi::Number::New(env, sent);
}

Napi::Value GetAddrInfo(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if (info.Length() != 4 ||
            (!info[0].IsString() &&
            !info[0].IsNumber()) ||
            !info[1].IsString() ||
            !info[2].IsNumber() ||
            !info[3].IsNumber()) {

        Napi::TypeError::New(env, "Wrong arg count or type of args")
            .ThrowAsJavaScriptException();
        return env.Null();
    }

    std::string p = toString(info[1]);
    const char* port = p.c_str();

    struct addrinfo* hints = addrInfos[toInt(info[2])];
    struct addrinfo* baTemp;

    int out;

    if (info[0].IsString()) {
        std::string h = toString(info[0]);
        const char* host = h.c_str();
        out = getaddrinfo(host, port, hints, &baTemp);
    } else {
        out = getaddrinfo(0, port, hints, &baTemp);
    }

    addrInfos[toInt(info[3])] = baTemp;

    return Napi::Number::New(env, out);
}

Napi::Value NewAddrInfo(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if ((info.Length() == 1 && !info[0].IsObject()) || info.Length() > 1) {
        Napi::TypeError::New(env, "Wrong number of arguments")
            .ThrowAsJavaScriptException();
        return env.Null();
    }

    if (info.Length() == 0) {
        size_t size = addrInfos.size();
        addrInfos[size] = nullptr;

        return Napi::Number::New(env, size);
    }

    Napi::Object options = info[0].As<Napi::Object>();

    struct addrinfo *hints = (struct addrinfo*)malloc(sizeof(struct addrinfo));
    memset(hints, 0, sizeof(struct addrinfo));

    if (options.Get("ai_socktype").IsNumber()) {
        hints->ai_socktype = toInt(options.Get("ai_socktype"));
    }

    if (options.Get("ai_family").IsNumber()) {
        hints->ai_family = toInt(options.Get("ai_family"));
    }

    if (options.Get("ai_flags").IsNumber()) {
        hints->ai_flags = toInt(options.Get("ai_flags"));
    }

    size_t size = addrInfos.size();
    addrInfos[size] = hints;

    return Napi::Number::New(env, size);
}

Napi::Value AddrInfoToObject(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() != 1 && !info[0].IsNumber()) {
        Napi::TypeError::New(env, "Wrong number of arguments")
            .ThrowAsJavaScriptException();
        return env.Null();
    }

    Napi::Object addrInfo = Napi::Object::New(env);
    struct addrinfo* item = addrInfos[toInt(info[0])];

    addrInfo.Set("ai_socktype", Napi::Number::New(env, item->ai_socktype));
    addrInfo.Set("ai_family", Napi::Number::New(env, item->ai_family));
    addrInfo.Set("ai_protocol", Napi::Number::New(env, item->ai_protocol));

    return addrInfo;
}

Napi::Value Listen(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() != 2) {
        Napi::TypeError::New(env, "Wrong number of arguments")
            .ThrowAsJavaScriptException();
        return env.Null();
    }

    if (!info[0].IsNumber() || !info[1].IsNumber()) {
        Napi::TypeError::New(env, "Wrong type arguments").ThrowAsJavaScriptException();
        return env.Null();
    }

    return Napi::Number::New(env, listen(toInt(info[0]), toInt(info[1])));
}

Napi::Value Close(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() != 1) {
        Napi::TypeError::New(env, "Wrong number of arguments")
            .ThrowAsJavaScriptException();
        return env.Null();
    }

    if (!info[0].IsNumber()) {
        Napi::TypeError::New(env, "Wrong type arguments").ThrowAsJavaScriptException();
        return env.Null();
    }

    return Napi::Number::New(env, close(toInt(info[0])));
}

Napi::Value Bind(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() != 2) {
        Napi::TypeError::New(env, "Wrong number of arguments")
            .ThrowAsJavaScriptException();
        return env.Null();
    }

    if (!info[0].IsNumber() || !info[1].IsNumber()) {
        Napi::TypeError::New(env, "Wrong type arguments").ThrowAsJavaScriptException();
        return env.Null();
    }
    int addrId = toInt(info[1]);
    if (addrInfos.find(addrId) == addrInfos.end()) {
        Napi::TypeError::New(env, "AddrId is invalid.").ThrowAsJavaScriptException();
        return env.Null();
    }

    // TODO: AI_PASSIVE???? Socket server???
    struct addrinfo* ba = addrInfos[addrId];
    int bindRes = bind(toInt(info[0]), ba->ai_addr, ba->ai_addrlen);

    return Napi::Number::New(env, bindRes);
}

Napi::Value Socket(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() != 3 && info.Length() != 1) {
        Napi::TypeError::New(env, "Wrong number of arguments")
            .ThrowAsJavaScriptException();
        return env.Null();
    }


    if (!info[0].IsNumber() || (info.Length() == 3 && (
                !info[1].IsNumber() || !info[2].IsNumber()))) {

        Napi::TypeError::New(env, "Wrong arguments").ThrowAsJavaScriptException();
        return env.Null();
    }

    // TODO: AI_PASSIVE???? Socket server???
    SOCKET socket_listen = socket(
            toInt(info[0]),
            toInt(info[1]),
            toInt(info[2]));

    return Napi::Number::New(env, socket_listen);
}

Napi::Value FDSet(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    fd_set set;
    size_t s = 0;
    //size_t s = fdSets.size();
    //fdSets[s] = set;

    return Napi::Number::New(env, s);
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    // Socket constants
    exports.Set(Napi::String::New(env, "SOCK_STREAM"), Napi::Number::New(env, SOCK_STREAM));
    exports.Set(Napi::String::New(env, "AF_INET"), Napi::Number::New(env, AF_INET));
    exports.Set(Napi::String::New(env, "AI_PASSIVE"), Napi::Number::New(env, AI_PASSIVE));
    exports.Set(Napi::String::New(env, "INADDR_ANY"), Napi::Number::New(env, INADDR_ANY));

    // TODO: Errors???

    // Ackshual c functions
    exports.Set(Napi::String::New(env, "socket"), Napi::Function::New(env, Socket));
    exports.Set(Napi::String::New(env, "connect"), Napi::Function::New(env, Connect));
    exports.Set(Napi::String::New(env, "send"), Napi::Function::New(env, Send));
    exports.Set(Napi::String::New(env, "getaddrinfo"), Napi::Function::New(env, GetAddrInfo));
    exports.Set(Napi::String::New(env, "bind"), Napi::Function::New(env, Bind));
    exports.Set(Napi::String::New(env, "listen"), Napi::Function::New(env, Listen));
    exports.Set(Napi::String::New(env, "close"), Napi::Function::New(env, Close));
    exports.Set(Napi::String::New(env, "gai_strerror"), Napi::Function::New(env, Gai_strerror));
    exports.Set(Napi::String::New(env, "fdSet"), Napi::Function::New(env, FDSet));

    // Ackshually not c functions
    exports.Set(Napi::String::New(env, "getErrorString"), Napi::Function::New(env, getErrorString));
    exports.Set(Napi::String::New(env, "isValidSocket"), Napi::Function::New(env, IsValidSocket));
    exports.Set(Napi::String::New(env, "newAddrInfo"), Napi::Function::New(env, NewAddrInfo));
    exports.Set(Napi::String::New(env, "addrInfoToObject"), Napi::Function::New(env, AddrInfoToObject));
    exports.Set(Napi::String::New(env, "onRecv"), Napi::Function::New(env, OnRecv));

    return exports;
}

NODE_API_MODULE(addon, Init)

