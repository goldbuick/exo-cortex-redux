import Server from 'socket.io';
import log from './_lib/_util/log';
import CONFIG from './_api/_config';
import HttpJSON from './_lib/httpjson';
import { GatewayListen } from './_lib/gateway';

// http interface (for webhooks)
let http = HttpJSON((req, json, finish) => {
    finish();
});

// start server
http.listen(CONFIG.PORTS.FACADE, () => {
    log.server('facade', 'started');

    // socket.io interface
    let io = Server(http);
    io.on('connection', function(socket) {
    });
});

