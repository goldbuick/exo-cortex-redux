import Server from 'socket.io';
import log from './_lib/_util/log';
import CONFIG from './_api/_config';
import HttpJSON from './_lib/httpjson';
import TerraceListen from './_api/terrace-listen';

function _sub (channel, type) {
    return [channel, type].join('/');
}

let nodes = { },
    listen = { },
    terrace = TerraceListen();

terrace.connect(() => log.server('facade', 'connected to terrace'));

terrace.message('api', e => {
    io.emit('api', e);
});

terrace.message('nodes', e => {
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
    terrace.api();
    terrace.nodes();
    socket.on('error', e => log.error('facade', e));
    socket.on('message', e => {
        if (e.channel && e.type) {
            terrace.emit(e.channel, e.type, e.data);
            // dynamically listen for api responses
            // nodes only have upstream path responses 
            [ e.channel, _sub(e.channel, e.type) ].forEach(channel => {
                if (!listen[channel] && !nodes[channel]) {
                    listen[channel] = true;
                    terrace.message(channel, message => {
                        io.emit(channel, message);
                    });
                }
            });
        } else {
            log.error('facade', 'message requires channel & type data props');
        }
    });
});

// start server
http.listen(CONFIG.PORTS.FACADE, () => {
    log.server('facade', 'started');
});
