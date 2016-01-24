'use strict';

var _HttpService = require('./_api/HttpService');

var _HttpService2 = _interopRequireDefault(_HttpService);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var server = new _HttpService2.default('facade');

server.ping(function () {
    return { active: true };
});

server.start();
server.ready();