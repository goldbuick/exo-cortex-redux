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

var _ApiClient2 = require('../_api/ApiClient');

var _ApiClient3 = _interopRequireDefault(_ApiClient2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// get the base exo-cortex stack up

var Preflight = (function (_ApiClient) {
    _inherits(Preflight, _ApiClient);

    function Preflight(host, port) {
        _classCallCheck(this, Preflight);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Preflight).call(this, host, port));

        _this.index = 1;
        _this.steps = [];

        if (_yargs.argv.docker) {
            // this.steps = this.steps.concat([{
            // 'check docker api connection', // TODO
            // 'check data volume arg', // TODO
            // 'start rethinkdb', // TODO
            // }]);
        }

        var rethinkdbHost = _yargs.argv.dev ? '192.168.99.100' : 'rethinkdb';
        _this.steps = _this.steps.concat([{
            'registering rethinkdb': _this.register('rethinkdb', rethinkdbHost, 28015)
        }, {
            'registering ui-rethinkdb': _this.register('ui-rethinkdb', rethinkdbHost, 8080)
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
            'starting codex': _this.start('codex')
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
                            _this.emit('codex', 'set', {
                                keys: ['ui-barrier', 'domain'],
                                value: answers.domain
                            }, fetch);
                        });
                    }
                };

                var fetch = function fetch(json) {
                    _this.emit('codex', 'get', {
                        keys: ['ui-barrier']
                    }, validate);
                };
                fetch();
            }
        }, {
            'starting facade': _this.start('ui-facade')
        }, {
            'starting barrier': _this.start('ui-barrier')
        }, {
            'check barrier password': function checkBarrierPassword(next) {
                // D@k1WJcpL
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
                            _this.emit('codex', 'set', {
                                keys: ['ui-barrier', 'password'],
                                value: answers.password
                            }, fetch);
                        });
                    }
                };

                var fetch = function fetch(json) {
                    _this.emit('codex', 'get', {
                        keys: ['ui-barrier']
                    }, validate);
                };
                fetch();
            }
        }, {
            'starting didact ui': _this.start('ui-didact')
        }, {
            'display barrier config': function displayBarrierConfig(next) {
                _this.emit('codex', 'get', {
                    keys: ['ui-barrier']
                }, function (json) {
                    next(json);
                });
            }
        }, {
            'starting test': _this.start('test')
        }]);
        return _this;
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
        key: 'start',
        value: function start(service) {
            var _this3 = this;

            return function (next) {
                return _this3.emit('didact', 'add', { service: service }, next);
            };
        }
    }, {
        key: 'register',
        value: function register(service, host, port) {
            var _this4 = this;

            return function (next) {
                return _this4.emit('didact', 'register', { service: service, host: host, port: port }, next);
            };
        }
    }]);

    return Preflight;
})(_ApiClient3.default);

exports.default = Preflight;