/* global runTests */
var root = nrdp.gibbon.location;
var idx = root.lastIndexOf("test-client-nrdp.js");
var testClient = root.substr(0, idx) + "test-client.js";
nrdp.gibbon.loadScript({url: testClient, async: false});

nrdp.l(nrdp.js_options);
var http = nrdp.js_options.MILO_TEST_HTTP_SERVER || "http://localhost:60000";
var https = nrdp.js_options.MILO_TEST_HTTPS_SERVER || "https://milo.netflix.com:60001";
if (http === "0")
    http = undefined;
if (https === "0")
    https = undefined;

var testNrdp = nrdp.js_options.MILO_TEST_NRDP !== "0";
var testMilo = nrdp.js_options.MILO_TEST_MILO !== "0";

function fixReq(req, milo) {
    req.milo = milo;
    req.ipAddresses = [ "127.0.0.1" ];
    req.cache = "no-cache";
    req.dnsType = 5;
    req.dnsName = "milo.netflix.com";
    return req;
}

var names = [];
var times = [];

Promise.resolve().
    then(function() {
        if (!testNrdp || !https)
            return undefined;
        names.push("Resource manager https");
        times.push(nrdp.mono());
        // return undefined;
        return runTests({
            name: names[names.length - 1],
            server: https,
            load: function(req, cb) {
                nrdp.gibbon.load(fixReq(req, false), cb);
            },
            log: nrdp.l.bind(nrdp)
        });
    }).
    then(function() {
        if (!testNrdp || !http)
            return undefined;

        names.push("Resource manager http");
        var now = nrdp.mono();
        if (times.length)
            times[times.length - 1] = now - times[times.length - 1];
        times.push(now);
        // return undefined;
        return runTests({
            name: names[names.length - 1],
            server: http,
            load: function(req, cb) {
                nrdp.gibbon.load(fixReq(req, false), cb);
            },
            log: nrdp.l.bind(nrdp)
        });
    }).
    then(function() {
        if (!testMilo || !https)
            return undefined;

        names.push("Milo https");
        var now = nrdp.mono();
        if (times.length)
            times[times.length - 1] = now - times[times.length - 1];
        times.push(now);
        // return undefined;
        return runTests({
            name: names[names.length - 1],
            server: https,
            load: function(req, cb) {
                nrdp.gibbon.load(fixReq(req, true), cb);
            },
            log: nrdp.l.bind(nrdp)
        });
    }).
    then(function() {
        if (!testMilo || !http)
            return undefined;

        names.push("Milo http");
        var now = nrdp.mono();
        if (times.length)
            times[times.length - 1] = now - times[times.length - 1];
        times.push(now);
        return runTests({
            name: names[names.length - 1],
            server: http,
            load: function(req, cb) {
                nrdp.gibbon.load(fixReq(req, true), cb);
            },
            log: nrdp.l.bind(nrdp)
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
