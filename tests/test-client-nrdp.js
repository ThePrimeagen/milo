/* global runTests */
var root = nrdp.gibbon.location;
var idx = root.lastIndexOf("test-client-nrdp.js");
var testClient = root.substr(0, idx) + "test-client.js";
nrdp.gibbon.loadScript({url: testClient, async: false});

nrdp.l("loading", test, typeof runTests);

var http = nrdp.js_options.MILO_TEST_HTTP_SERVER || "http://localhost:60000";
var https = nrdp.js_options.MILO_TEST_HTTPS_SERVER || "https://milo.netflix.com:60001";

function fixReq(req, milo) {
    req.milo = milo;
    req.ipAddresses = [ "127.0.0.1" ];
    req.dnsType = 5;
    req.dnsName = "milo.netflix.com";
    return req;
}

function test()
{
    nrdp.gibbon.load({url: "http://localhost:60000/?size=16384&gzip", milo: true}, function(response) {
        nrdp.l("got response", response.data.length);
    });
}
test();

var names = [];
var times = [];

if (false) {
Promise.resolve().
    then(function() {
        names.push("Resource manager https");
        times.push(nrdp.mono());
        return undefined;
        return runTests(https, function(req, cb) {
            nrdp.gibbon.load(fixReq(req, false), cb);
        });
    }).
    then(function() {
        names.push("Resource manager http");
        var now = nrdp.mono();
        times[times.length - 1] = now - times[times.length - 1];
        times.push(now);
        return undefined;
        return runTests(http, function(req, cb) {
            nrdp.gibbon.load(fixReq(req, false), cb);
        });
    }).
    then(function() {
        names.push("Milo https");
        var now = nrdp.mono();
        times[times.length - 1] = now - times[times.length - 1];
        times.push(now);
        return undefined;
        return runTests(https, function(req, cb) {
            nrdp.gibbon.load(fixReq(req, true), cb);
        });
    }).
    then(function() {
        names.push("Milo http");
        var now = nrdp.mono();
        times[times.length - 1] = now - times[times.length - 1];
        times.push(now);
        return runTests(http, function(req, cb) {
            nrdp.gibbon.load(fixReq(req, true), cb);
        });
    }).
    then(function() {
        var now = nrdp.mono();
        times[times.length - 1] = now - times[times.length - 1];
        nrdp.l("All tests ran successfully");
        for (var i=0; i<times.length; ++i) {
            nrdp.l(names[i], "took", times[i] + "ms");
        }
        nrdp.exit();
    }).
    catch(function(err) {
        nrdp.l.error("Got an error", names[names.length - 1], err, err.originalStack || err.stack);
        for (var i=0; i<times.length; ++i) {
            nrdp.l.error(names[i], "took", times[i] + "ms");
        }

        nrdp.exit(1);
    });
}
