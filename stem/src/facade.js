import Server from 'socket.io';
import log from './_lib/_util/log';
import CONFIG from './_api/_config';
import HttpJSON from './_lib/httpjson';
import TerraceListen from './_api/terrace-listen';

// connect to messaging net
let terrace = TerraceListen();
terrace.connect(() => log.server('facade', 'connected to terrace'));
terrace.message('api', message => {
    io.emit('api', message);
});
terrace.message('nodes', message => {
    io.emit('nodes', message);
});
terrace.watch('facade', message => {
    // upstream messages go out into client side
    if (message.channel) io.emit(message.channel, message);
});

// http interface (for webhooks)
let http = HttpJSON((req, json, finish) => {
    // include request url in json always
    json.url = req.url;
    // turn a get or a post into a message
    terrace.emit('webhook', 'json', json);
    // that is sent out on terrace
    finish();
});

// socket.io interface
let io = Server(http);
io.on('connection', function(socket) {
    // generate api list event
    terrace.api();
    // generate node list event
    terrace.nodes();
    // listen for messages to send into messaging net
    socket.on('message', e => {
        if (e.channel &&
            e.type &&
            e.data) {
            terrace.emit(e.channel, e.type, e.data);
        }
    });
});

// start server
http.listen(CONFIG.PORTS.FACADE, () => {
    log.server('facade', 'started');
});
