'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.GatewayServer = GatewayServer;
exports.GatewayListen = GatewayListen;
exports.GatewayClient = GatewayClient;

var _log = require('./_util/log');

var _log2 = _interopRequireDefault(_log);

var _socket = require('socket.io');

var _socket2 = _interopRequireDefault(_socket);

var _socket3 = require('socket.io-client');

var _socket4 = _interopRequireDefault(_socket3);

var _message = require('./_util/message');

var _message2 = _interopRequireDefault(_message);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _sub(channel, type) {
    return [channel, type].join('/');
}

var _GatewayServer = function _GatewayServer(name, port) {
    var _this = this;

    _classCallCheck(this, _GatewayServer);

    this.io = (0, _socket2.default)(port);
    this.nodes = {};
    this.services = {};
    this.io.on('connection', function (socket) {
        var _nodes = {},
            _services = {};

        socket.on('nodes', function (data) {
            // list the nodes to arrange
            socket.emit('nodes', Object.keys(_this.nodes));
        });

        socket.on('api', function (data) {
            // list the supported paths
            socket.emit('api', Object.keys(_this.services));
        });

        socket.on('register', function (data) {
            if (data.node) {
                _nodes[data.node] = true;
                _this.nodes[data.node] = true;
                // list the nodes to arrange
                socket.emit('nodes', Object.keys(_this.nodes));
            }

            if (data.channel && data.types) {
                data.types.forEach(function (type) {
                    var path = _sub(data.channel, type);
                    _services[path] = true;
                    _this.services[path] = true;
                });

                // list the supported paths
                socket.emit('api', Object.keys(_this.services));
            }
        });

        socket.on('message', function (data) {
            _log2.default.msg(name, 'message', data);
            if (data && data.channel) {
                // emit message to given channel
                _this.io.emit(data.channel, data);
                if (data.type) {
                    // emit message to given channel/type
                    _this.io.emit(_sub(data.channel, data.type), data);
                }
            }
        });

        socket.on('upstream', function (data) {
            _log2.default.msg(name, 'upstream', data);
            if (data && data.upstream) {
                // emit message to given upstream
                _this.io.emit(_sub('upstream', data.upstream), data);
            }
        });

        socket.on('disconnect', function () {
            // unregister watch
            Object.keys(_nodes).forEach(function (path) {
                delete _this.nodes[path];
            });
            // unregister api
            Object.keys(_services).forEach(function (path) {
                delete _this.services[path];
            });
        });
    });
    _log2.default.server(name, 'started on', port);
};

function GatewayServer(name, port) {
    return new _GatewayServer(name, port);
};

var gsockets = {};
function getSocket(port) {
    if (gsockets[port] === undefined) {
        gsockets[port] = (0, _socket4.default)('http://localhost:' + port);
    }
    return gsockets[port];
}

var _GatewayListen = (function () {
    function _GatewayListen(port) {
        _classCallCheck(this, _GatewayListen);

        this.socket = getSocket(port);
    }

    _createClass(_GatewayListen, [{
        key: 'connect',
        value: function connect(handler) {
            if (this.socket.id) {
                setTimeout(handler, 0);
            } else {
                this.socket.on('connect', handler);
            }
        }
    }, {
        key: 'message',
        value: function message(channel, handler) {
            this.socket.on(channel, handler);
        }
    }, {
        key: 'watch',
        value: function watch(channel, handler) {
            this.socket.on(_sub('upstream', channel), handler);
        }
    }, {
        key: 'api',
        value: function api() {
            this.socket.emit('api');
        }
    }, {
        key: 'nodes',
        value: function nodes() {
            this.socket.emit('nodes');
        }
    }, {
        key: 'emit',
        value: function emit(channel, type, data) {
            var message = (0, _message2.default)(channel, type, data);
            this.socket.emit('message', message);
        }
    }, {
        key: 'upstream',
        value: function upstream(message) {
            this.socket.emit('upstream', message);
        }
    }]);

    return _GatewayListen;
})();

function GatewayListen(port, handler) {
    return new _GatewayListen(port, handler);
};

var _GatewayClient = (function (_GatewayListen2) {
    _inherits(_GatewayClient, _GatewayListen2);

    function _GatewayClient(channel, port) {
        _classCallCheck(this, _GatewayClient);

        var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(_GatewayClient).call(this, port));

        _this2.types = {};
        _this2.channel = channel;
        _this2.connect(function () {
            _this2.socket.emit('register', {
                channel: _this2.channel,
                types: Object.keys(_this2.types)
            });
        });
        return _this2;
    }

    _createClass(_GatewayClient, [{
        key: 'message',
        value: function message(type, handler) {
            this.types[type] = true;
            this.socket.on(_sub(this.channel, type), handler);
        }
    }, {
        key: 'emit',
        value: function emit(type, data) {
            var message = (0, _message2.default)(this.channel, type, data);
            this.socket.emit('message', message);
        }
    }]);

    return _GatewayClient;
})(_GatewayListen);

function GatewayClient(channel, port) {
    return new _GatewayClient(channel, port);
};