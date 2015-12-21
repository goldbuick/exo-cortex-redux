import log from './log';
import makeMessage from './message';
import Server from 'socket.io';
import Client from 'socket.io-client';

function _sub (channel, type) {
    return [channel, type].join('/');
}

export function GatewayServer (name, port) {
    let io = new Server(port),
        services = { };

    io.on('connection', socket => {
        let messages = { };

        socket.on('list', data => {
            // list the supported paths
            socket.emit('list', Object.keys(services));
        });

        socket.on('register', data => {
            // build paths
            messages = { };
            Object.keys(data).forEach(chan => {
                data[chan].forEach(type => {
                    messages[_sub(chan, type)] = true;
                });
            });

            // add paths
            Object.keys(messages).forEach(path => {
                services[path] = true;
                log.server(name, 'adding', path);
            });

            // list the supported paths
            socket.emit('list', Object.keys(services));
        });

        socket.on('message', data => {
            log.msg(name, 'message', data);
            if (data && data.channel) {
                // emit message to given channel
                io.emit(data.channel, data);
                if (data.type) {
                    // emit message to given channel/type
                    io.emit(_sub(data.channel, data.type), data);
                }
            }
        });

        socket.on('disconnect', () => {
            // unregister api
            Object.keys(messages).forEach(path => {
                delete services[path];
                log.server(name, 'dropping', path);
            });
        });

    });
    log.server(name, 'started on', port);
};

class _GatewayClient {
    constructor (channel, port) {
        let self = this;
        self.types = { };
        self.channel = channel;
        self.socket = Client('http://localhost:' + port);
        self.socket.on('connect', () => {
            self.socket.emit('register', {
                [self.channel]: Object.keys(self.types)
            });
            log.client('gateway', 'connected');
        });
    }

    message (type, handler) {
        this.types[type] = true;
        this.socket.on(_sub(this.channel, type), handler);
    }

    emit (type, data) {
        let message = makeMessage(this.channel, type, data);
        this.socket.emit('message', message);
    }
}

export function GatewayClient (channel, port) {
    return new _GatewayClient(channel, port);
};

class _GatewayListen {
    constructor (port, handler) {
        let self = this;
        self.socket = Client('http://localhost:' + port);
        self.socket.on('connect', () => {
            log.client('listen', 'connected');
            handler();
        });
    }

    message (channel, handler) {
        this.socket.on(channel, handler);
        log.client('listen', 'to', channel);
    }
    
    emit (channel, type, data) {
        let message = makeMessage(channel, type, data);
        this.socket.emit('message', message);
        log.client('listen', 'sent', message);
    }
}

export function GatewayListen (port, handler) {
    return new _GatewayListen(port, handler);
};

