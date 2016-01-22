'use strict';

var _socket = require('socket.io');

var _socket2 = _interopRequireDefault(_socket);

var _log = require('./_lib/_util/log');

var _log2 = _interopRequireDefault(_log);

var _config = require('./_api/_config');

var _config2 = _interopRequireDefault(_config);

var _httpjson = require('./_lib/httpjson');

var _httpjson2 = _interopRequireDefault(_httpjson);

var _terraceListen = require('./_api/terrace-listen');

var _terraceListen2 = _interopRequireDefault(_terraceListen);

var _makeMessage = require('./_lib/_util/makeMessage');

var _makeMessage2 = _interopRequireDefault(_makeMessage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var nodes = {},
    listen = {},
    terrace = (0, _terraceListen2.default)();

terrace.connect(function () {
    return _log2.default.server('facade', 'connected to terrace');
});

terrace.message('api', function (e) {
    io.emit('api', e);
});

terrace.message('nodes', function (e) {
    e.push('facade');
    io.emit('nodes', e);
    e.forEach(function (node) {
        nodes[node] = true;
    });
});

// upstream messages go out into client side
terrace.watch('facade', function (message) {
    if (message) io.emit('message', message);
});

// http interface (for webhooks)
var http = (0, _httpjson2.default)(function (req, json, finish) {
    // will need to check an API key here yeah?
    // include request url in json always
    json.url = req.url;
    // turn a get or a post into a message
    terrace.emit('webhook', 'json', json);
    // that is sent out on terrace
    finish();
});

// socket.io interface
var io = (0, _socket2.default)(http);

io.on('connection', function (socket) {
    terrace.api();
    terrace.nodes();
    socket.on('error', function (e) {
        return _log2.default.error('facade', e);
    });
    socket.on('message', function (e) {
        if (e.channel && e.type) {
            terrace.emit(e.channel, e.type, e.data);
            if (!nodes[e.channel] && !listen[e.channel]) {
                listen[e.channel] = true;
                terrace.message(e.channel, function (message) {
                    io.emit('message', message);
                });
            }
        } else {
            _log2.default.error('facade', 'message requires channel & type data props');
        }
    });
});

// start server
http.listen(_config2.default.PORTS.FACADE, function () {
    _log2.default.server('facade', 'started');
});