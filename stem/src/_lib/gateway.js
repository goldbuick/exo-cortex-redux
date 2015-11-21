import log from './log';
import makeMessage from './message';
import Server from 'socket.io';
import Client from 'socket.io-client';

export function server (name, port) {
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
                    var path = [chan, type].join('/');
                    messages[path] = true;
                });
            });

            // add paths
            Object.keys(messages).forEach(path => {
                log('adding', path);
                services[path] = true;
            });

            // list the supported paths
            socket.emit('list', Object.keys(services));
        });

        socket.on('message', data => {
            log('message', data);
            // emit message to given channel
            if (data && data.channel) io.emit(data.channel, data);
        });

        socket.on('disconnect', () => {
            // unregister api
            Object.keys(messages).forEach(path => {
                log('dropping', path);
                delete services[path];
            });
        });

    });
    log.server(name, port);
};

class GatewayClient {
    constructor (channel, port) {
        let self = this;
        self.types = { };
        self.channel = channel;
        self.socket = Client('http://localhost:' + port);
        self.socket.on('connect', () => {
            log.server(self.channel, port);
            self.start();
        });
    }

    start () {
        this.socket.emit('register', {
            [this.channel]: Object.keys(this.types)
        });
    }

    message (name, handler) {
        var path = [this.channel, name].join('/');
        this.types[name] = true;
        this.socket.on(path, handler);
    }

    emit (type, data) {
        let message = makeMessage(this.channel, type, data);
        this.socket.emit(message.channel, message);
    }
}

export function client (name, port) {
    return new GatewayClient(name, port);
};
