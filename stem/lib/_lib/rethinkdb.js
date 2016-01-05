'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _rethinkdb = require('rethinkdb');

var _rethinkdb2 = _interopRequireDefault(_rethinkdb);

var _log = require('./_util/log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _check(err) {
    if (!err) return false;

    _log2.default.msg('rethinkdb', 'error', err);
    return true;
}

var RethinkDB = (function () {
    function RethinkDB(table) {
        _classCallCheck(this, RethinkDB);

        this.table = table;
        this.conn = undefined;
        this.db = '_exo_cortex_';
    }

    _createClass(RethinkDB, [{
        key: 'q',
        value: function q() {
            return _rethinkdb2.default.table(this.table);
        }
    }, {
        key: 'run',
        value: function run(qobj, callback) {
            qobj.run(this.conn, callback);
        }
    }, {
        key: 'ready',
        value: function ready(callback) {
            this.onReady = callback;
        }
    }, {
        key: 'check',
        value: function check(err) {
            return _check(err);
        }
    }, {
        key: 'testConnect',
        value: function testConnect(host, port, success, failure) {
            _rethinkdb2.default.connect({
                host: host,
                port: port,
                db: this.db
            }, function (err, conn) {
                if (_check(err)) {
                    failure();
                } else {
                    success();
                }
            });
        }
    }, {
        key: 'connect',
        value: function connect(host, port) {
            var self = this;
            this.conn = undefined;

            function createdb(next) {
                _rethinkdb2.default.dbCreate(self.db).run(self.conn, function (err) {
                    next();
                });
            }

            function createtable(next) {
                _rethinkdb2.default.tableCreate(self.table).run(self.conn, function (err) {
                    next();
                });
            }

            _log2.default.msg('rethinkdb', 'connect', host, port, self.db, self.table);
            _rethinkdb2.default.connect({
                host: host,
                port: port,
                db: self.db
            }, function (err, conn) {
                if (_check(err)) return;

                self.conn = conn;
                createdb(function () {
                    createtable(function () {
                        _log2.default.msg('rethinkdb', 'connected', self.db, self.table);
                        if (self.onReady) self.onReady();
                    });
                });
            });
        }
    }]);

    return RethinkDB;
})();

exports.default = RethinkDB;