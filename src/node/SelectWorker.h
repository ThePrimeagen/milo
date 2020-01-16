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
            selectResult = select(maxSocket + 1, set, 0, 0, 0);

            if (selectResult < 0) {
                SetError("Select failed.");
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











