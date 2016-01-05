'use strict';

var _log = require('./_lib/_util/log');

var _log2 = _interopRequireDefault(_log);

var _config = require('./_api/_config');

var _config2 = _interopRequireDefault(_config);

var _rethinkdb = require('./_lib/rethinkdb');

var _rethinkdb2 = _interopRequireDefault(_rethinkdb);

var _objMod = require('./_lib/_util/obj-mod');

var _objMod2 = _interopRequireDefault(_objMod);

var _debounce = require('./_lib/_util/debounce');

var _debounce2 = _interopRequireDefault(_debounce);

var _terraceClient = require('./_api/terrace-client');

var _terraceClient2 = _interopRequireDefault(_terraceClient);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var gstore = {},
    gchanged = {},
    db = new _rethinkdb2.default('codex'),
    codex = (0, _terraceClient2.default)('codex');

// STORAGE

db.ready(function () {
    // query for config values
    db.run(db.q(), function (err, cursor) {
        if (db.check(err)) return;

        cursor.each(function (err, record) {
            if (db.check(err)) return;
            if (record.value === undefined) return;

            gstore[record.id] = record.value;
            _log2.default.msg('codex', 'read', record.id, JSON.stringify(record.value));
        }, function () {
            _log2.default.msg('codex', 'finished reading');
        });
    });
});

db.connect(_config2.default.HOSTS.VAULT, _config2.default.PORTS.VAULT);

function writeValue(key) {
    var json = {
        id: key,
        value: gstore[key]
    };

    json = JSON.parse(JSON.stringify(json));

    // insert value
    db.run(db.q().insert(json, { conflict: 'replace' }), function (err) {
        if (db.check(err)) return;
        _log2.default.msg('codex', 'wrote', JSON.stringify(json));
    });
}

var writeChangedValues = (0, _debounce2.default)(function () {
    Object.keys(gchanged).forEach(writeValue);
    gchanged = {};
}, 1000);

// MESSAGE HANDLERS

codex.message('get', function (message) {
    _log2.default.msg('codex', 'get', message);
    var keys = message.meta.keys;
    if (keys === undefined) return;

    var value = _objMod2.default.get(gstore, keys);
    codex.emit('value', { keys: keys, value: value });
});

codex.message('set', function (message) {
    _log2.default.msg('codex', 'set', message);
    var keys = message.meta.keys,
        value = message.meta.value;
    if (keys === undefined || value === undefined) return;

    _objMod2.default.set(gstore, keys, value);
    codex.emit('value', { keys: keys, value: value });

    gchanged[keys[0]] = true;
    writeChangedValues();
});