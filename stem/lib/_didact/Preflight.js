'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _yargs = require('yargs');

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

var _RethinkDb = require('../_api/RethinkDb');

var _RethinkDb2 = _interopRequireDefault(_RethinkDb);

var _PostMessage = require('../_api/PostMessage');

var _PostMessage2 = _interopRequireDefault(_PostMessage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// get the base exo-cortex stack up
// D@k1WJcpL

var Preflight = (function () {
    function Preflight(host, port) {
        var _this = this;

        _classCallCheck(this, Preflight);

        this.index = 1;
        this.host = host;
        this.port = port;
        this.address = {};

        this.steps = [];

        if (_yargs.argv.docker) {
            // this.steps = this.steps.concat([{
            // 'check docker api connection', // TODO
            // 'check data volume arg', // TODO
            // 'start rethinkdb', // TODO
            // }]);
        }

        this.steps = this.steps.concat([{
            'starting vault': this.start('vault')
        }, {
            'check rethinkdb connection': function checkRethinkdbConnection(next) {
                _this.find('rethinkdb', function (rethinkdb) {
                    var db = new _RethinkDb2.default('codex');
                    db.testConnect(rethinkdb.host, rethinkdb.port, function () {
                        next('connection to rethinkdb works');
                    }, function () {
                        console.log('failed to connect to rethinkdb');
                    });
                });
            }
        }, {
            'starting codex': this.start('codex')
        }, {
            'check barrier proxy domain': function checkBarrierProxyDomain(next) {
                var validate = function validate(json) {
                    var domain = json.domain;
                    if (domain && domain.length) {
                        next('domain is setup ' + domain);
                    } else {
                        _inquirer2.default.prompt([{
                            type: 'input',
                            name: 'domain',
                            message: 'please set the barrier domain'
                        }], function (answers) {
                            _this.message('codex', 'set', {
                                keys: ['ui-barrier', 'domain'],
                                value: answers.domain
                            }, fetch);
                        });
                    }
                };

                var fetch = function fetch(json) {
                    _this.message('codex', 'get', {
                        keys: ['ui-barrier']
                    }, validate);
                };
                fetch();
            }
        }, {
            'starting facade': this.start('facade')
        }, {
            'starting barrier': this.start('ui-barrier')
        }, {
            'display barrier config': function displayBarrierConfig(next) {
                _this.message('codex', 'get', {
                    keys: ['ui-barrier']
                }, function (json) {
                    next(json);
                });
            }
        }, {
            'check barrier password': function checkBarrierPassword(next) {
                var validate = function validate(json) {
                    var password = json.password;
                    if (password && password.length) {
                        next('password is setup ' + password);
                    } else {
                        _inquirer2.default.prompt([{
                            type: 'input',
                            name: 'password',
                            message: 'please set the barrier password'
                        }], function (answers) {
                            _this.message('codex', 'set', {
                                keys: ['ui-barrier', 'password'],
                                value: answers.password
                            }, fetch);
                        });
                    }
                };

                var fetch = function fetch(json) {
                    _this.message('codex', 'get', {
                        keys: ['ui-barrier']
                    }, validate);
                };
                fetch();
            }
        }, {
            'starting didact ui': this.start('ui-didact')
        }]);
    }

    _createClass(Preflight, [{
        key: 'invoke',
        value: function invoke(step) {
            var _this2 = this;

            var text = Object.keys(step)[0],
                op = step[text];

            console.log('preflight', this.index++ + '.', text);
            op(function (result) {
                console.log('preflight', '  ', result);
                console.log();
                _this2.steps.shift();
                _this2.next();
            });
        }
    }, {
        key: 'next',
        value: function next() {
            if (this.steps.length === 0) {
                console.log('preflight', '!. CHECKLIST COMPLETE');
                console.log();
                if (this.onReady) this.onReady();
            } else {
                this.invoke(this.steps[0]);
            }
        }
    }, {
        key: 'ready',
        value: function ready(callback) {
            this.onReady = callback;
            this.next();
        }
    }, {
        key: 'find',
        value: function find(service, success) {
            var _this3 = this;

            if (service === 'didact') {
                return success({
                    service: service,
                    host: this.host,
                    port: this.port
                });
            }

            if (this.address[service]) {
                return success(this.address[service]);
            }

            (0, _PostMessage2.default)('localhost', this.port, 'didact', 'find', {
                service: service
            }, function (json) {
                _this3.address[json.service] = json;
                success(_this3.address[json.service]);
            }, function (err) {
                console.log('find error', err);
            });
        }
    }, {
        key: 'message',
        value: function message(service, type, data, success) {
            this.find(service, function (address) {
                (0, _PostMessage2.default)(address.host, address.port, service, type, data, success, function (err) {
                    console.log('message error', err);
                });
            });
        }
    }, {
        key: 'start',
        value: function start(service) {
            var _this4 = this;

            return function (next) {
                return _this4.message('didact', 'add', { service: service }, next);
            };
        }
    }]);

    return Preflight;
})();

exports.default = Preflight;