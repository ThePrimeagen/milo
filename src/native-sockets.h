#ifndef	_MACROS_H
#define	_MACROS_H 1
#include <sys/socket.h>
#include <sys/types.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <netdb.h>
#include <unistd.h>
#include <errno.h>

#define ISVALIDSOCKET(s) ((s) >= 0)
#define CLOSESOCKET(s) close(s)
#define SOCKET int
#define GETSOCKETERRNO() (errno)

#include <napi.h>

std::string toString(Napi::Value value) {
    return value.As<Napi::String>();
}

int toInt(Napi::Value value) {
    return (int)value.As<Napi::Number>().DoubleValue();
}

#endif
