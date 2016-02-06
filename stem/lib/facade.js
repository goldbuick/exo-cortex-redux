'use strict';

var _socket = require('socket.io');

var _socket2 = _interopRequireDefault(_socket);

var _HttpService = require('./_api/HttpService');

var _HttpService2 = _interopRequireDefault(_HttpService);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var server = new _HttpService2.default('ui-facade'),
    io = (0, _socket2.default)(server.http);

server.ping(function () {
    return { active: true };
});

server.upstream(function (json) {
    console.log('upstream', json);
});

io.on('connection', function (socket) {
    // do cool shit here ...
    // console.log('we have a connection!');
    socket.on('api', function (json) {});
});

server.start();
server.ready();