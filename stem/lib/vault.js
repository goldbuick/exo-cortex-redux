'use strict';

var _yargs = require('yargs');

var _HttpService = require('./_api/HttpService');

var _HttpService2 = _interopRequireDefault(_HttpService);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var server = new _HttpService2.default('vault');
server.ping(function () {
    return { active: true };
});

var host = _yargs.argv.dev ? '192.168.99.100' : 'rethinkdb';
server.register('rethinkdb', host, 28015, function () {
    server.register('rethinkdb-ui', host, 8080, function () {
        server.ready();
    });
});

server.start();