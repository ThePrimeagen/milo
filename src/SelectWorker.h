#include <napi.h>
#include <vector>
#include "native-sockets.h"

using namespace Napi;

class SelectAsyncWorker : public AsyncProgressWorker<int>
{
    // TOOD: How to add?
    //
    // Adding another socket to listen too?
    public:
        SelectAsyncWorker(SOCKET socket, Function &callback);

        void Execute(const ExecutionProgress& progress);
        void OnOK();
        void addSocket(SOCKET socket);
        void OnProgress(const int* data, size_t count);

    private:

        std::vector<int> sockets;
        int maxSocket;
        fd_set reads;
};

