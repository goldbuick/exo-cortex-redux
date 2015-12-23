import Server from 'socket.io';
import log from './_lib/_util/log';
import CONFIG from './_api/_config';
import HttpJSON from './_lib/httpjson';
import TerraceListen from './terrace-listen';

function _sub (channel, type) {
    return [channel, type].join('/');
}

// terrace interface
let gforwarded = { },
    terrace = TerraceListen();

terrace.connect(() => {
    log.server('facade', 'connected to terrace');
});

function forward (channel) {
    if (gforwarded[channel] === undefined) {
        gforwarded[channel] = true;
        terrace.message(channel, data => {
            // emit message to given channel
            if (data && data.channel) {
                io.emit(data.channel, data);
                // emit message to given channel/type
                if (data.type) io.emit(_sub(data.channel, data.type), data);
            }
        });
    }
}

// http interface (for webhooks)
let http = HttpJSON((req, json, finish) => {
    // turn a get or a post into a message
    // that is sent out on terrace
    finish();
});

// socket.io interface
let io = Server(http);
io.on('connection', function(socket) {
    forward('list');
    socket.on('list', e => terrace.list());
    socket.on('listen', e => {
        if (e.channel) {
            if (e.type === undefined) {
                forward(e.channel);
            } else {
                forward(_sub(e.channel, e.type));
            }
        }
    });
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
