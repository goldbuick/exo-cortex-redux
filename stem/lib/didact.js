'use strict';

var _yargs = require('yargs');

var _log = require('./_lib/_util/log');

var _log2 = _interopRequireDefault(_log);

var _codexClient = require('./_api/codex-client');

var _codexClient2 = _interopRequireDefault(_codexClient);

var _stemLocal = require('./_lib/_didact/stem-local');

var _stemLocal2 = _interopRequireDefault(_stemLocal);

var _stemDocker = require('./_lib/_didact/stem-docker');

var _stemDocker2 = _interopRequireDefault(_stemDocker);

var _terraceClient = require('./_api/terrace-client');

var _terraceClient2 = _interopRequireDefault(_terraceClient);

var _preflightLocal = require('./_lib/_didact/preflight-local');

var _preflightLocal2 = _interopRequireDefault(_preflightLocal);

var _preflightDocker = require('./_lib/_didact/preflight-docker');

var _preflightDocker2 = _interopRequireDefault(_preflightDocker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isLocal = _yargs.argv.docker === undefined;

var stem = undefined;
if (isLocal) {
    stem = new _stemLocal2.default();
} else {
    stem = new _stemDocker2.default();
}

var preflight = undefined;
if (isLocal) {
    preflight = new _preflightLocal2.default();
} else {
    preflight = new _preflightDocker2.default();
}

preflight.ready(stem, function () {
    var store = (0, _codexClient2.default)('didact'),
        didact = (0, _terraceClient2.default)('didact');

    store.value('', function (type, value) {
        if (value.neuros === undefined) {
            value.neuros = [];
        }
    }, function (value) {
        _log2.default.server('didact', 'config', value);
    });

    didact.message('neuros', function (message) {
        stem.running(function (list) {
            didact.emit('running', { neuros: list });
        });
    });

    didact.message('start', function (message) {
        var name = message.meta.name;
        if (name === undefined) return;
        stem.start(name, function (result) {
            didact.emit('started', result);
        });
    });

    didact.message('kill', function (message) {
        var name = message.meta.name;
        if (name === undefined) return;
        stem.kill(name, function (result) {
            didact.emit('killed', result);
        });
    });

    didact.message('gaze', function (message) {
        var name = message.meta.name;
        if (name === undefined) return;
        stem.gaze(name, function (result) {
            didact.emit('logs', {
                neuro: name,
                logs: result
            });
        });
    });
});