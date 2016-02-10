'use strict';

var _socket = require('socket.io');

var _socket2 = _interopRequireDefault(_socket);

var _HttpService = require('./_api/HttpService');

var _HttpService2 = _interopRequireDefault(_HttpService);

var _Message = require('./_api/Message');

var _Message2 = _interopRequireDefault(_Message);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var server = new _HttpService2.default('ui-facade'),
    io = (0, _socket2.default)(server.http);

server.ping(function () {
    return { active: true };
});

server.upstream(function (json) {
    socket.emit('message', json);
});

io.on('connection', function (socket) {
    socket.on('api', function (json) {
        server.emit(json.channel, json.type, json.meta, function (result) {
            socket.emit('message', (0, _Message2.default)(json.channel, json.type, result));
        });
    });
});

server.start();
server.ready();