
#include <napi.h>
#include <vector>
#include "SelectWorker.h"
#include "native-sockets.h"

SelectAsyncWorker::SelectAsyncWorker(SOCKET socket, Function &callback): AsyncProgressWorker(callback) {
    addSocket(socket);
}

void SelectAsyncWorker::Execute(const ExecutionProgress& progress) {
    while (1) {

        // TODO: MUTUX???? How do I add sockets
        // Adding sockets seems complicated
        FD_ZERO(&reads);
        for (SOCKET s : sockets) {
            FD_SET(s, &reads);
        }

        if (select(maxSocket + 1, &reads, 0, 0, 0) < 0) {
            char buffer[200];

            snprintf(buffer, 200, "select() failed. (%d) - %s\n", GETSOCKETERRNO(), strerror(GETSOCKETERRNO()));
            SetError(buffer);
            return;
        }

        for (SOCKET s : sockets) {
            if (FD_ISSET(s, &reads)) {
                progress.Send(&s, 1);
            }
        }
    }
}

void SelectAsyncWorker::OnProgress(const int* data, size_t count) {
    (void)count;

    HandleScope scope(Env());
    Callback().Call({
            Env().Null(),
            Env().Null(),
            Number::New(Env(), *data)});
}


void SelectAsyncWorker::addSocket(SOCKET socket) {
    sockets.push_back(socket);

    if (maxSocket < socket) {
        maxSocket = socket;
    }
}

void SelectAsyncWorker::OnOK() {
}
