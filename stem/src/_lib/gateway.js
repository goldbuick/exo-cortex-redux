import log from './_util/log';
import Server from 'socket.io';
import Client from 'socket.io-client';
import makeMessage from './_util/message';

function _sub (channel, type) {
    return [channel, type].join('/');
}

class _GatewayServer {
    constructor (name, port) {
        this.io = Server(port);
        this.services = { };
        this.io.on('connection', socket => {
            let messages = { };

            socket.on('list', data => {
                // list the supported paths
                socket.emit('list', Object.keys(this.services));
            });

            socket.on('register', data => {
                if (data.channel === undefined ||
                    data.types === undefined) return;

                socket.join(_sub('upstream', data.channel));
                data.types.forEach(type => {
                    let path = _sub(data.channel, type);
                    messages[path] = true;                    
                    this.services[path] = true;
                    log.server(name, 'adding', path);
                });

                // list the supported paths
                socket.emit('list', Object.keys(this.services));
            });

            socket.on('message', data => {
                log.msg(name, 'message', data);
                if (data && data.channel) {
                    // emit message to given channel
                    this.io.emit(data.channel, data);
                    if (data.type) {
                        // emit message to given channel/type
                        this.io.emit(_sub(data.channel, data.type), data);
                    }
                }
            });

            socket.on('upstream', data => {
                log.msg(name, 'upstream', data);
                if (data && data.upstream) {
                    // emit message to given upstream
                    this.io.emit(_sub('upstream', data.upstream), data);
                }
            });

            socket.on('disconnect', () => {
                // unregister api
                Object.keys(messages).forEach(path => {
                    delete this.services[path];
                    log.server(name, 'dropping', path);
                });
            });

        });
        log.server(name, 'started on', port);        
    }
}

export function GatewayServer (name, port) {
    return new _GatewayServer(name, port);
};

let gsockets = { };
function getSocket (port) {
    if (gsockets[port] === undefined) {
        gsockets[port] = Client('http://localhost:' + port);
    }
    return gsockets[port];
}

class _GatewayClient {
    constructor (channel, port) {
        this.types = { };
        this.channel = channel;
        this.socket = getSocket(port);
        this.socket.on('connect', () => {
            this.socket.emit('register', {
                channel: this.channel,
                types: Object.keys(this.types)
            });
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

    upstream (message) {
        this.socket.emit('upstream', message);
    }
}

export function GatewayClient (channel, port) {
    return new _GatewayClient(channel, port);
};

class _GatewayListen {
    constructor (port) {
        let self = this;
        self.socket = getSocket(port);
    }

    connect (handler) {
        this.socket.on('connect', handler);
    }

    message (channel, handler) {
        this.socket.on(channel, handler);
    }

    list () {
        this.socket.emit('list');
    }
    
    emit (channel, type, data) {
        let message = makeMessage(channel, type, data);
        this.socket.emit('message', message);
    }

    upstream (message) {
        this.socket.emit('upstream', message);
    }
}

export function GatewayListen (port, handler) {
    return new _GatewayListen(port, handler);
};

