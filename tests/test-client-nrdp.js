/* global runTests */
var root = nrdp.gibbon.location;
var idx = root.lastIndexOf("test-client-nrdp.js");
var test = root.substr(0, idx) + "test-client.js";
nrdp.gibbon.loadScript({url: test, async: false});

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

runTests(https, function(req, cb) {
    nrdp.gibbon.load(fixReq(req, false), cb);
}).then(function() {
    return runTests(http, function(req, cb) {
        nrdp.gibbon.load(fixReq(req, false), cb);
    });
}).then(function() {
    return runTests(https, function(req, cb) {
        nrdp.gibbon.load(fixReq(req, true), cb);
    });
}).then(function() {
    return runTests(https, function(req, cb) {
        nrdp.gibbon.load(fixReq(req, true), cb);
    });
}).then(function() {
    nrdp.l("All tests ran successfully");
    nrdp.exit();
}).catch(function(err) {
    nrdp.l.error("Got an error", err);
    nrdp.exit(1);
});
