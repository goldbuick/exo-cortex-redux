import Server from 'socket.io';
import log from './_lib/_util/log';
import CONFIG from './_api/_config';
import HttpJSON from './_lib/httpjson';
import TerraceListen from './_api/terrace-listen';

let nodes = { },
    listen = { },
    ready = false,
    terrace = TerraceListen();

terrace.connect(() => log.server('facade', 'connected to terrace'));

terrace.message('api', e => {
    io.emit('api', e);
});

terrace.message('nodes', e => {
    ready = true;
    e.push('facade');
    io.emit('nodes', e);
    e.forEach(node => { nodes[node] = true; });
});

// upstream messages go out into client side
terrace.watch('facade', e => {
    if (e.channel) io.emit(e.channel, e);
});

// http interface (for webhooks)
let http = HttpJSON((req, json, finish) => {
    // will need to check an API key here yeah?
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
        if (ready) {
            if (e.channel &&
                e.type &&
                e.data) {
                terrace.emit(e.channel, e.type, e.data);
                // dynamically listen for api responses
                // nodes only have upstream path responses 
                if (!listen[e.channel] && !nodes[e.channel]) {
                    listen[e.channel] = true;
                    terrace.message(e.channel, message => io.emit(e.channel, message));
                }
            } else {
                socket.emit('error', 'message requires channel, type, data props');
            }
        } else {
            socket.emit('error', 'wait for nodes event before sending messages');
        }
    });
});

// start server
http.listen(CONFIG.PORTS.FACADE, () => {
    log.server('facade', 'started');
});
