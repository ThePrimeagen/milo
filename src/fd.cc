#include "native-sockets.h"

#include <napi.h>
#include <map>

std::map<int, fd_set> fdSets;

bool isFDCall(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if (info.Length() != 1) {
        Napi::TypeError::New(env, "Wrong number of arguments")
            .ThrowAsJavaScriptException();
        return false;
    }

    if (!info[0].IsNumber()) {
        Napi::TypeError::New(env, "Wrong type of arguments")
            .ThrowAsJavaScriptException();
        return false;
    }

    int id = toInt(info[0]);
    if (fdSets.find(id) == fdSets.end()) {
        Napi::TypeError::New(env, "Cannot find the fdset")
            .ThrowAsJavaScriptException();
        return false;
    }

    return true;
}

Napi::Value FDSet(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    fd_set set;
    size_t s = fdSets.size();
    fdSets[s] = set;

    return Napi::Number::New(env, s);
}

Napi::Value FDClr(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if (!isFDCall(info)) {
        return env.Undefined();
    }

    //fd_set set = fdSets[toInt(info[0])];
    //FD_CLR(&set);

    return env.Undefined();
}

Napi::Value FDZero(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (!isFDCall(info)) {
        return env.Undefined();
    }

    fd_set set = fdSets[toInt(info[0])];
    FD_ZERO(&set);

    return env.Undefined();
}
