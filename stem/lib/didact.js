'use strict';

var _CONFIG = require('./_api/CONFIG');

var _CONFIG2 = _interopRequireDefault(_CONFIG);

var _HttpApi = require('./_api/HttpApi');

var _HttpApi2 = _interopRequireDefault(_HttpApi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
I want to boil didact down to a simple process manager
that can collect logs from the processes it runs.

dev mode is without docker
release mode is with docker containers

in order to be run by didact you have to run a nuero client
which allows you to dump logs to didact and signal didact you're ready & alive
*/

var server = new _HttpApi2.default(),
    channel = server.channel('didact');

channel.message('list', {}, function (json, finish) {
    finish();
});

channel.message('add', {
    image: 'name of app image to spin up'
}, function (json, finish) {
    finish();
});

channel.message('remove', {
    image: 'name of app to stop & remove'
}, function (json, finish) {
    finish();
});

channel.message('restart', {
    image: 'name of app to restart'
}, function (json, finish) {
    finish();
});

server.start(_CONFIG2.default.PORTS.DIDACT);