#include <napi.h>
#include "native-sockets.h"

class SelectWorker : public Napi::AsyncWorker {
    public:
        SelectWorker(Napi::Function& callback, SOCKET socket, fd_set* set, int maxSocket)
        : Napi::AsyncWorker(callback),
          socket(socket),
          set(set),
          maxSocket(maxSocket)
        { }

        ~SelectWorker() {}

        // This code will be executed on the worker thread
        void Execute() {
            printf("Awaiting select... %d \n", maxSocket);
            while (true) {
                selectResult = select(maxSocket + 1, set, 0, 0, 0);

                printf("select happened... %d \n", selectResult);
                if (selectResult < 0) {
                    SetError("Select failed.");
                    return;
                }

                if (FD_ISSET(STDIN_FILENO, set)) {
                    printf("STDIN\n");
                    FD_CLR(STDIN_FILENO, set);
                }
                else {
                    for (int i = 0; i < maxSocket + 1; ++i) {
                        if (FD_ISSET(i, set)) {
                            printf("Odd set item %d \n", i);
                            FD_CLR(i, set);
                        }
                    }
                }

            }

        }

        void OnError(const Napi::Error&) {
            Napi::HandleScope scope(Env());
            Callback().Call({Napi::Number::New(Env(), selectResult)});
        }

        void OnOK() {
            Napi::HandleScope scope(Env());
            Callback().Call({Env().Null()});
        }

    private:
        SOCKET socket;
        fd_set* set;
        int maxSocket;
        int selectResult;
};











