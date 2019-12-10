#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "native-sockets.h"

void printError(const char* location) {
    const char *errMsg = strerror(GETSOCKETERRNO());
    fprintf(stderr, "%s(%d) - %s\n", location, GETSOCKETERRNO(), errMsg);
}

int main(int argc, char** argv) {
    if (argc < 2) {
        printf("F U J U D O\n");
        return 1;
    }

    struct addrinfo hints;
    memset(&hints, 0, sizeof(hints));

    hints.ai_socktype = SOCK_STREAM;
    hints.ai_family = AF_INET;

    struct addrinfo *bindAddress;

    // BRB, pee pee
    printf("Attempting to get addrinfo...\n");
    if (getaddrinfo(argv[1], argv[2], &hints, &bindAddress)) {
        printError("failed#getaddrinfo");
        return 1;
    }

    char addrInfo[200];
    getnameinfo(bindAddress->ai_addr, bindAddress->ai_addrlen,
            addrInfo, sizeof(char) * 100, addrInfo + 100,
            sizeof(char) * 100, NI_NUMERICHOST);
    printf("Addr: %s\n", addrInfo);
    printf("Serv: %s\n", addrInfo + 100);

    return 0;
}
