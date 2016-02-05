'use strict';

var _yargs = require('yargs');

var _ObjMod = require('./_api/ObjMod');

var _ObjMod2 = _interopRequireDefault(_ObjMod);

var _Debounce = require('./_api/Debounce');

var _Debounce2 = _interopRequireDefault(_Debounce);

var _RethinkDb = require('./_api/RethinkDb');

var _RethinkDb2 = _interopRequireDefault(_RethinkDb);

var _HttpService = require('./_api/HttpService');

var _HttpService2 = _interopRequireDefault(_HttpService);

var _PostMessage = require('./_api/PostMessage');

var _PostMessage2 = _interopRequireDefault(_PostMessage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// simple key / value store api

var server = new _HttpService2.default('codex');
server.find('rethinkdb', function (rethinkdb) {
    server.ping(function () {
        return { active: true };
    });

    var gstore = {},
        gchanged = {},
        db = new _RethinkDb2.default('codex');

    var writeValue = function writeValue(key) {
        var json = {
            id: key,
            value: gstore[key]
        };

        json = JSON.parse(JSON.stringify(json));

        // insert value
        db.run(db.q().insert(json, { conflict: 'replace' }), function (err) {
            if (db.check(err)) return;
            // console.log('codex', 'wrote', JSON.stringify(json));
        });

        // signal value change to neuro
        server.find(key, function (neuro) {
            (0, _PostMessage2.default)(neuro.host, neuro.port, 'codex', 'update', {
                keys: [key],
                value: gstore[key]
            });
        });
    };

    var writeChangedValues = (0, _Debounce2.default)(function () {
        Object.keys(gchanged).forEach(writeValue);
        gchanged = {};
    }, 1000);

    db.ready(function () {
        // query for config values
        db.run(db.q(), function (err, cursor) {
            if (db.check(err)) return;

            cursor.each(function (err, record) {
                if (db.check(err)) return;
                if (record.value === undefined) return;

                gstore[record.id] = record.value;
                // console.log('codex', 'read', record.id, JSON.stringify(record.value));
            }, function () {
                // console.log('codex', 'finished reading');
                server.ready();
            });
        });
    });

    db.connect(rethinkdb.host, rethinkdb.port);

    var channel = server.channel('codex');
    channel.message('set', {
        keys: 'key path to fetch',
        value: 'what value to set the key path to'
    }, function (json, finish) {
        var keys = json.meta.keys,
            value = json.meta.value;
        if (keys === undefined || value === undefined) return;

        _ObjMod2.default.set(gstore, keys, value);
        finish({ keys: keys, value: value });

        gchanged[keys[0]] = true;
        writeChangedValues();
    });

    channel.message('get', {
        keys: 'key path to fetch'
    }, function (json, finish) {
        var keys = json.meta.keys;
        if (keys === undefined) return finish();
        var value = _ObjMod2.default.get(gstore, keys);
        finish(value);
    });

    server.start();
});