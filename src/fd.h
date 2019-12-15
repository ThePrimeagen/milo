#ifndef	_FD_H
#define	_FD_H 1

#include "native-sockets.h"

#include <napi.h>
#include <map>

std::map<int, fd_set*> fdSets;
int maxFd;

fd_set* getFdSet(int id) {
    return fdSets[id];
}

int getMaxFd() {
    return maxFd;
}

bool isFDCall(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    int id;
    if (info.Length() == 1) {
        if (!info[0].IsNumber()) {
            Napi::TypeError::New(env, "Wrong type of arguments")
                .ThrowAsJavaScriptException();
            return false;
        }
        id = toInt(info[0]);
    } else if (info.Length() == 2) {
        if (!info[0].IsNumber() || !info[1].IsNumber()) {
            Napi::TypeError::New(env, "Wrong type of arguments")
                .ThrowAsJavaScriptException();
            return false;
        }
        id = toInt(info[1]);
    }
    else {
        Napi::TypeError::New(env, "Wrong number of arguments.")
            .ThrowAsJavaScriptException();
        return false;
    }

    if (fdSets.find(id) == fdSets.end()) {
        Napi::TypeError::New(env, "Cannot find the fdset")
            .ThrowAsJavaScriptException();
        return false;
    }

    return true;
}

Napi::Value FDIsSet(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if (!isFDCall(info)) {
        return env.Undefined();
    }

    int fd = toInt(info[0]);
    fd_set* set = fdSets[toInt(info[1])];
    return Napi::Boolean::New(env, FD_ISSET(fd, set));
}

Napi::Value FDSet(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    int fd = toInt(info[0]);
    fd_set* set = fdSets[toInt(info[1])];

    if (fd > maxFd) {
        maxFd = fd;
    }

    printf("What is going on here? %d %d\n", fd, toInt(info[1]));
    FD_SET(fd, set);

    return env.Undefined();
}

Napi::Value CreateFDSet(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    //TODO: Not possible I bet
    fd_set *set = (fd_set*)malloc(sizeof(fd_set));
    size_t s = fdSets.size();
    fdSets[s] = set;

    return Napi::Number::New(env, s);
}

Napi::Value FDClr(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if (!isFDCall(info)) {
        return env.Undefined();
    }

    int fd = toInt(info[0]);
    fd_set* set = fdSets[toInt(info[1])];
    FD_CLR(fd, set);

    return env.Undefined();
}

Napi::Value FDZero(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (!isFDCall(info)) {
        printf("Unable to call Zero");
        return env.Undefined();
    }

    fd_set* set = fdSets[toInt(info[0])];
    FD_ZERO(set);
    printf("zero'ing the set");

    return env.Undefined();
}

#endif
