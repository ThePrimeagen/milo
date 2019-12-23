import ws from 'ws';

const wss = new ws.Server({
    port: 8080
});

wss.on('connection', function(ws) {
    ws.on('message', function(data) {
        const json = JSON.parse(data.toString());

        json.count++;
        ws.send(JSON.stringify(json));
    });
});


