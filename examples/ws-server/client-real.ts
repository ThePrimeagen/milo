import WebSocket from "ws";

const ws = new WebSocket("ws://mpaulson.netflix.com:8080");

ws.on('message', (data) => {
    const json = JSON.parse(data.toString());

    json.count++;
    ws.send(JSON.stringify(json));
});

ws.on('close', () => {
    console.log("Close");
});

ws.on('error', (e) => {
    console.error("Look its an erro, suck it hiredguns", e);
});

ws.send({ count: 0 }, (err) => {
    console.log("send#ERRR", err);
});



