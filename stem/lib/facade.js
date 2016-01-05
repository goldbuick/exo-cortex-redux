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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var nodes = {},
    listen = {},
    ready = false,
    terrace = (0, _terraceListen2.default)();

terrace.connect(function () {
    return _log2.default.server('facade', 'connected to terrace');
});

terrace.message('api', function (e) {
    io.emit('api', e);
});

terrace.message('nodes', function (e) {
    ready = true;
    e.push('facade');
    io.emit('nodes', e);
    e.forEach(function (node) {
        nodes[node] = true;
    });
});

// upstream messages go out into client side
terrace.watch('facade', function (e) {
    if (e.channel) io.emit(e.channel, e);
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
    // generate api list event
    terrace.api();
    // generate node list event
    terrace.nodes();
    // listen for messages to send into messaging net
    socket.on('message', function (e) {
        if (ready) {
            if (e.channel && e.type && e.data) {
                terrace.emit(e.channel, e.type, e.data);
                // dynamically listen for api responses
                // nodes only have upstream path responses
                if (!listen[e.channel] && !nodes[e.channel]) {
                    listen[e.channel] = true;
                    terrace.message(e.channel, function (message) {
                        return io.emit(e.channel, message);
                    });
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
http.listen(_config2.default.PORTS.FACADE, function () {
    _log2.default.server('facade', 'started');
});