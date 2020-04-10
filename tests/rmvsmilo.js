/*global nrdp*/

var concurrentReqs = 10;
var totalReqs = 10;
var url = "https://secure.netflix.com/us/tvui/ql/patch/20200403_13751/2/release/darwinBootstrap.js?dh=720&q=&dw=1280&dar=16_9&reg=true&getMainUrlFromCodex=true&taskDefaultTimeoutV2=120000&bootloader_trace=apiusernotnull__false&nq=true&nq_control_tag=tvui-main";

function doIt(milo)
{
    return new Promise(function(resolve, reject) {
        var startStart = Date.now();
        var urlidx = 0;
        var active = 0;
        var results = {
            responses: [],
            totalTotal: 0,
            bytes: 0,
            sslSessionResumed: 0,
            socketReused: 0
        };

        function send() {
            var start = Date.now();
            var opts = {
                milo: milo,
                cache: "no-cache",
                url: url + "&foobar=" + ++urlidx,
                tlsv13: true,
                // headers: {
                //     "Accept-Encoding": "identity"
                // }
            };
            var idx = results.responses.length;
            results.responses.push(undefined);

            // nrdp.l("calling it", arg.milo ? "milo" : "rm", totalReqs * concurrentReqs, results.length);
            // arg.url = url + "&foobar=" + ++urlidx;
            ++active;
            nrdp.gibbon.load(opts, function(response) {
                var end = Date.now();
                if (response.statusCode !== 200) {
                    reject(new Error("Bad status " + response.statusCode));
                    return;
                }
                results.responses[idx] = end - start;
                results.bytes += response.data.length;
                if (response.sslSessionResumed)
                    ++results.resumptions;
                if (response.socketReused)
                    ++results.socketReused;
                --active;
                if (results.responses.length < totalReqs * concurrentReqs) {
                    send();
                } else if (!active) {
                    var endEnd = Date.now();
                    results.totalTotal = endEnd - startStart;
                    resolve(results);
                }
            });
        }
        for (var i=0; i<concurrentReqs; ++i) {
            send();
        }
    });
}


function main() {
    var rmResults, miloResults;
    doIt(true).then(function(results) {
        miloResults = results;
        return doIt(false);
    }).then(function(results) {
        rmResults = results;
        if (miloResults.responses.length !== rmResults.responses.length) {
            throw new Error("Bad response lengths");
        }
        if (miloResults.bytes !== rmResults.bytes) {
            nrdp.l("bytes", miloResults.bytes, rmResults.bytes);
            throw new Error("Bad bytes");
        }

        function print(name, res) {
            var tots = 0;
            for (var i=0; i<res.responses.length; ++i) {
                tots += res.responses[i];
            }

            nrdp.l(name, "end to end total", res.totalTotal, "\naverage", (tots / res.responses.length).toFixed(2),
                   "\nsslresumed", res.sslSessionResumed,
                   "\nsocket reused", res.socketReused);
        }
        print("milo", miloResults);
        print("rm", rmResults);
        nrdp.exit(0);
    }).catch(function(err) {
        nrdp.l("got err", err);
        nrdp.exit(1);
    });

}
nrdp.gibbon.init(main);
