import WebSocket from "ws";
import Platform from "../../src/Platform";

const ws = new WebSocket("ws://mpaulson.netflix.com:8080");

ws.on('message', (data) => {
    const json = JSON.parse(data.toString());

    json.count++;
    ws.send(JSON.stringify(json));
});

ws.on('close', () => {
    Platform.log("Close");
});

ws.on('error', (e) => {
    Platform.error("Look its an erro, suck it hiredguns", e);
});

ws.send({ count: 0 }, (err) => {
    Platform.log("send#ERRR", err);
});



