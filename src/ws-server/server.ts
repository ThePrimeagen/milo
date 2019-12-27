import ws from 'ws';

const wss = new ws.Server({
    port: 8080
});

wss.on('connection', function(ws) {
    console.log("OHHHH MY WE ARE CONNECTED.");

    ws.on('message', function(data) {
        const json = JSON.parse(data.toString());

        json.count++;
        ws.send(JSON.stringify(json));
    });
});


