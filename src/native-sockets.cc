#include "native-sockets.h"
#include <napi.h>
#include <map>

std::map<int, struct addrinfo*> addrInfos;

std::string toString(Napi::Value value) {
    return value.As<Napi::String>();
}

int toInt(Napi::Value value) {
    return (int)value.As<Napi::Number>().DoubleValue();
}

Napi::Value getErrorString(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    char *errMsg = strerror(GETSOCKETERRNO());

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
    char addrInfo[200];
    getnameinfo(bindAddress->ai_addr, bindAddress->ai_addrlen,
            addrInfo, sizeof(char) * 100, addrInfo + 100,
            sizeof(char) * 100, NI_NUMERICHOST);
    printf("AddrInfo %s --- %s \n", addrInfo, addrInfo + 100);

    int status =
        connect(toInt(info[0]), bindAddress->ai_addr, bindAddress->ai_addrlen);

    return Napi::Number::New(env, status);
}

Napi::Value IsValidSocket(const Napi::CallbackInfo& info) {
    return Napi::Boolean::New(info.Env(), ISVALIDSOCKET((int)info[0].As<Napi::Number>().DoubleValue()));
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
            !info[0].IsString() ||
            !info[1].IsString() ||
            !info[2].IsNumber() ||
            !info[3].IsNumber()) {

        Napi::TypeError::New(env, "Wrong arg count or type of args")
            .ThrowAsJavaScriptException();
        return env.Null();
    }

    std::string h = toString(info[0]);
    const char* host = h.c_str();

    std::string p = toString(info[1]);
    const char* port = p.c_str();

    struct addrinfo* hints = addrInfos[toInt(info[2])];
    struct addrinfo* bindAddress = addrInfos[toInt(info[3])];

    printf("host and port %s --- %s \n", host, port);

    bool isNullBind = bindAddress == nullptr;

    int out = getaddrinfo(host, port, hints, &bindAddress);

    // TODO: Yep, argument 5 is the one with the information.
    if (isNullBind) {
        addrInfos[toInt(info[3])] = bindAddress;
        char addrInfo[200];
        getnameinfo(bindAddress->ai_addr, bindAddress->ai_addrlen,
                addrInfo, sizeof(char) * 100, addrInfo + 100,
                sizeof(char) * 100, NI_NUMERICHOST);
        printf("AddrInfo %s --- %s \n", addrInfo, addrInfo + 100);
    }

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

    if (options.Get("ai_protocol").IsNumber()) {
        hints->ai_protocol = toInt(options.Get("ai_protocol"));
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

    printf("XXXX - #socket#socket %d\n", socket_listen);

    return Napi::Number::New(env, socket_listen);
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    // Socket constants
    exports.Set(Napi::String::New(env, "SOCK_STREAM"), Napi::Number::New(env, SOCK_STREAM));
    exports.Set(Napi::String::New(env, "AF_INET"), Napi::Number::New(env, AF_INET));
    exports.Set(Napi::String::New(env, "AI_PASSIVE"), Napi::Number::New(env, AI_PASSIVE));

    // TODO: Errors???

    // Ackshual c functions
    exports.Set(Napi::String::New(env, "socket"), Napi::Function::New(env, Socket));
    exports.Set(Napi::String::New(env, "connect"), Napi::Function::New(env, Connect));
    exports.Set(Napi::String::New(env, "send"), Napi::Function::New(env, Send));
    exports.Set(Napi::String::New(env, "getaddrinfo"), Napi::Function::New(env, GetAddrInfo));

    // Ackshually not c functions
    exports.Set(Napi::String::New(env, "getErrorString"), Napi::Function::New(env, getErrorString));
    exports.Set(Napi::String::New(env, "isValidSocket"), Napi::Function::New(env, IsValidSocket));
    exports.Set(Napi::String::New(env, "newAddrInfo"), Napi::Function::New(env, NewAddrInfo));
    exports.Set(Napi::String::New(env, "addrInfoToObject"), Napi::Function::New(env, AddrInfoToObject));

    return exports;
}

NODE_API_MODULE(addon, Init)

