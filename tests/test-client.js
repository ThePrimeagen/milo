function runTests(server, loadFunc)
{
    var table = "ABCDEFGHIJKLMNOPQRSTUVWXYZ\n";

    var payloads = [];
    for (var s=1; s<16; ++s) {
        var size = Math.pow(2, s);
        var payload = "";
        for (var i=0; i<size; ++i) {
            payload += table[i % table.length];
        }
        payloads.push(payload);
        // sizes.push(Math.pow(2, s));
    }
    var chunked = [ false, true ];
    var compression = [ undefined, "gzip", "deflate" ];

    function createReq(payload, chunked, compression) {
        return new Promise(function(resolve, reject) {
            var url = server;
            url += "/?size=" + payload.length;
            if (chunked)
                url += "&chunked";
            if (compression)
                url += "&" + compression;

            var id = setTimeout(function() {
                reject(new Error("request " + url + " timed out"));
            }, 30000);
            loadFunc({url: url}, function(response) {
                clearTimeout(id);
                if (response.statusCode !== 200) {
                    nrdp.l.error(response);
                    reject(new Error("Bad status code " + response.statusCode));
                    return;
                }

                if (response.data !== payload) {
                    reject(new Error("Bad payload " + payload.length + " " + response.data.length));
                    return;
                }
                resolve();
            });
        });
    }

    var promise = Promise.resolve();
    payloads.forEach(function payloadFunc(payload) {
        chunked.forEach(function chunkedFunc(chunky) {
            compression.forEach(function compressionFunc(compressionType) {
                promise = promise.then(createReq.bind(undefined, payload, chunky, compressionType));
            });
        });
    });
    return promise;
}
