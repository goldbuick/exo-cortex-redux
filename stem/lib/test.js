'use strict';

var _yargs = require('yargs');

var _HttpNeuro = require('./_api/HttpNeuro');

var _HttpNeuro2 = _interopRequireDefault(_HttpNeuro);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var server = new _HttpNeuro2.default('test');
server.ping(function () {
    return { active: true };
});

server.start();
server.ready();