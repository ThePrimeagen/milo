import WebSocket from 'ws';

const ws = new WebSocket("ws://mpaulson.netflix.com:8080");

ws.on('message', function(data) {
    const json = JSON.parse(data.toString());

    json.count++;
    ws.send(JSON.stringify(json));
});

ws.on('close', function() {
    console.log("Close");
});

ws.on('error', function(e) {
    console.error("Look its an erro, suck it hiredguns", e);
});

ws.send({count: 0}, function(err) {
    console.log("send#ERRR", err);
});



