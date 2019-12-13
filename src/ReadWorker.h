#include <napi.h>
#include "native-sockets.h"

class ReadWorker : public Napi::AsyncWorker {
    public:
        ReadWorker(Napi::Function& callback, SOCKET socket, Napi::Buffer<unsigned char> &buf, int offset)
        : Napi::AsyncWorker(callback),
          socket(socket),
          offset(offset)
        {
            len = buf.Length();
            this->buf = buf.TypedArrayOf<unsigned char>::Data();
        }

        ~ReadWorker() {}

        // This code will be executed on the worker thread
        void Execute() {
            printf("one more test!!!!\n");
            printf("Executing the read worker!!!! %d - %zu %.*s\n", offset, len, 4, buf);
            bytesReceived = recv(socket, buf + offset, len - offset, 0);
            printf("Done executing the read worker%d \n", bytesReceived);
        }

        void OnOK() {
            Napi::HandleScope scope(Env());
            Callback().Call({
                    Env().Null(),
                    Napi::Number::New(Env(), bytesReceived)});
        }

    private:
        SOCKET socket;
        int offset;
        int bytesReceived;
        unsigned char* buf;
        size_t len;
};











