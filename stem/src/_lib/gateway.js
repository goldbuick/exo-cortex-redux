import log from './_util/log';
import Server from 'socket.io';
import Client from 'socket.io-client';
import makeMessage from './_util/message';

function _sub (channel, type) {
    return [channel, type].join('/');
}

class _GatewayServer {

    registry (socket) {
        socket.emit('nodes', Object.keys(this.nodes));
        socket.emit('api', Object.keys(this.services));
    }
    
    constructor (name, port) {
        this.io = Server(port);
        this.nodes = { };
        this.services = { };
        this.io.on('connection', socket => {
            let _nodes = { },
                _services = { };

            this.registry(socket);

            // list the nodes to arrange
            socket.on('nodes', data => {
                socket.emit('nodes', Object.keys(this.nodes));
            });

            // list the supported paths
            socket.on('api', data => {
                socket.emit('api', Object.keys(this.services));
            });

            socket.on('register', data => {
                if (data.node) {
                    _nodes[data.node] = true;
                    this.nodes[data.node] = true;
                }

                if (data.channel &&
                    data.types) {
                    data.types.forEach(type => {
                        let path = _sub(data.channel, type);
                        _services[path] = true;                    
                        this.services[path] = true;
                    });
                }

                this.registry(socket);
            });

            socket.on('message', data => {
                log.msg(name, 'message', data);
                if (data && data.channel) {
                    this.io.emit(data.channel, data);
                    if (data.type) {
                        this.io.emit(_sub(data.channel, data.type), data);
                    }
                }
            });

            socket.on('upstream', data => {
                log.msg(name, 'upstream', data);
                if (data && data.upstream) {
                    this.io.emit(_sub('upstream', data.upstream), data);
                }
            });

            socket.on('disconnect', () => {
                // unregister watch
                Object.keys(_nodes).forEach(path => {
                    delete this.nodes[path];
                });
                // unregister api
                Object.keys(_services).forEach(path => {
                    delete this.services[path];
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

class _GatewayListen {

    constructor (port) {
        this.socket = getSocket(port);
    }

    connect (handler) {
        if (this.socket.id) {
            setTimeout(handler, 0);
        } else {
            this.socket.on('connect', handler);
        }
    }

    message (channel, handler) {
        this.socket.on(channel, handler);
    }

    watch (channel, handler) {
        this.socket.on(_sub('upstream', channel), handler);
    }

    api () {
        this.socket.emit('api');
    }

    nodes () {
        this.socket.emit('nodes');
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

class _GatewayClient extends _GatewayListen {

    constructor (channel, port) {
        super(port);
        this.types = { };
        this.channel = channel;
        this.connect(() => {
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

}

export function GatewayClient (channel, port) {
    return new _GatewayClient(channel, port);
};

