'use strict';

var _yargs = require('yargs');

var _HttpApi = require('./_api/HttpApi');

var _HttpApi2 = _interopRequireDefault(_HttpApi);

var _RunDev = require('./_didact/RunDev');

var _RunDev2 = _interopRequireDefault(_RunDev);

var _RunDocker = require('./_didact/RunDocker');

var _RunDocker2 = _interopRequireDefault(_RunDocker);

var _Preflight = require('./_didact/Preflight');

var _Preflight2 = _interopRequireDefault(_Preflight);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ghost = _yargs.argv.dev ? 'localhost' : 'didact',
    gport = 7154,
    glogs = {},
    gaddress = {},
    gservices = {};

var grun = undefined;
if (_yargs.argv.dev) {
    grun = new _RunDev2.default(ghost, gport);
} else {
    grun = new _RunDocker2.default(ghost, gport);
}

var server = new _HttpApi2.default(),
    channel = server.channel('didact');

// messages for neuros

channel.message('ping', {
    service: 'name of service that is pinging'
}, function (json, finish) {
    if (json.meta && json.meta.service) {
        grun.ping(json.meta.service, json.meta);
    }
    finish();
});

channel.message('log', {
    service: 'name of service this log is for',
    data: 'generic json data to log'
}, function (json, finish) {
    finish();
});

channel.message('register', {
    service: 'name of service address to register',
    host: 'host name of the address',
    port: 'port of the address'
}, function (json, finish) {
    if (json.meta && json.meta.service) {
        gaddress[json.meta.service] = {
            service: json.meta.service,
            host: json.meta.host,
            port: json.meta.port
        };
    }
    finish();
});

channel.message('find', {
    service: 'name of service to find address:port on'
}, function (json, finish) {
    if (json.meta && json.meta.service) {
        return finish(gaddress[json.meta.service || ''] || {});
    }
    finish();
});

// messages for service management

channel.message('list', {}, function (json, finish) {
    grun.list(finish);
});

channel.message('add', {
    service: 'name of service image to spin up'
}, function (json, finish) {
    if (json.meta && json.meta.service) {
        var port = grun.add(json.meta.service, finish);
        gaddress[json.meta.service] = {
            service: json.meta.service,
            host: _yargs.argv.dev ? 'localhost' : json.meta.service,
            port: port
        };
    } else {
        finish();
    }
});

channel.message('remove', {
    service: 'name of service to stop & remove'
}, function (json, finish) {
    if (json.meta && json.meta.service) {
        return grun.remove(json.meta.service, finish);
    }
    finish();
});

channel.message('restart', {
    service: 'name of service to restart'
}, function (json, finish) {
    if (json.meta && json.meta.service) {
        return grun.restart(json.meta.service, finish);
    }
    finish();
});

server.start(gport);

var preflight = new _Preflight2.default(ghost, gport);
preflight.ready(function () {
    return console.log('exo-cortex is READY!');
});