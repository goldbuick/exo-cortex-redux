'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _log = require('../_util/log');

var _log2 = _interopRequireDefault(_log);

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

var _rethinkdb = require('../rethinkdb');

var _rethinkdb2 = _interopRequireDefault(_rethinkdb);

var _config = require('../../_api/_config');

var _config2 = _interopRequireDefault(_config);

var _codexApi = require('../../_api/codex-api');

var _codexApi2 = _interopRequireDefault(_codexApi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PreFlight = (function () {
    function PreFlight() {
        _classCallCheck(this, PreFlight);

        this.index = 1;
        this.barrier = new _codexApi2.default('barrier');
        this.steps = [];
        var _steps = this.checklist().concat(['check rethinkdb connection', this.checkRethinkDb.bind(this), 'start terrace', this.runNeuro('terrace'), 'start codex', this.runNeuro('codex'), 'check barrier proxy domain', this.checkDomain.bind(this), 'start facade', this.runNeuro('facade'), 'start barrier', this.runNeuro('ui-barrier'), 'display barrier config', this.checkBarrier.bind(this), 'check barrier password', this.checkPassword.bind(this), 'start didact ui', this.runNeuro('ui-didact')]);
        for (var i = 0; i < _steps.length; i += 2) {
            this.steps.push({
                text: _steps[i],
                op: _steps[i + 1]
            });
        }
    }

    _createClass(PreFlight, [{
        key: 'invoke',
        value: function invoke(step) {
            var _this = this;

            _log2.default.msg('preflight', this.index++ + '.', step.text);
            step.op(function (result) {
                _log2.default.msg('preflight', '  ', result);
                _log2.default.blank(1);
                _this.steps.shift();
                _this.next();
            });
        }
    }, {
        key: 'next',
        value: function next() {
            if (this.steps.length === 0) {
                _log2.default.msg('preflight', '!. CHECKLIST COMPLETE');
                _log2.default.blank(1);
                if (this.onReady) this.onReady();
            } else {
                this.invoke(this.steps[0]);
            }
        }
    }, {
        key: 'ready',
        value: function ready(stem, callback) {
            this.stem = stem;
            this.onReady = callback;
            this.next();
        }
    }, {
        key: 'runNeuro',
        value: function runNeuro(name) {
            var self = this;
            return function (next) {
                self.stem.start(name, function (result) {
                    if (name === 'facade' || name !== 'ui-barrier' && name.indexOf('ui-') === 0) {
                        self.proxyNeuro(name, next);
                    } else {
                        next(name + ' started');
                    }
                });
            };
        }
    }, {
        key: 'proxyNeuro',
        value: function proxyNeuro(name, next) {
            var barrier = this.barrier,
                neuro = this.stem.neuro(name),
                barrierUrl = neuro.image + '.' + barrier.get(['domain']),
                neuroUrl = 'localhost:' + neuro.port;

            // log.msg('preflight', barrierUrl, neuroUrl);
            barrier.set(['auth', barrierUrl], neuroUrl, function () {
                next(name + ' started & proxied');
            });
        }
    }, {
        key: 'checkRethinkDb',
        value: function checkRethinkDb(next) {
            var db = new _rethinkdb2.default();
            function validate() {
                db.testConnect(_config2.default.HOSTS.VAULT, _config2.default.PORTS.VAULT, function () {
                    next('connected to RethinkDB');
                }, function () {
                    _inquirer2.default.prompt([{
                        type: 'input',
                        name: 'ready',
                        message: 'have you started RethinkDB?'
                    }], function () {
                        validate();
                    });
                });
            }
            validate();
        }
    }, {
        key: 'checkDomain',
        value: function checkDomain(next) {
            var self = this;
            function validate(value) {
                var domain = value.domain;
                if (domain && domain.length) {
                    next('domain is setup ' + domain);
                } else {
                    _inquirer2.default.prompt([{
                        type: 'input',
                        name: 'domain',
                        message: 'please set the barrier domain'
                    }], function (answers) {
                        self.barrier.set(['domain'], answers.domain, validate);
                    });
                }
            }
            this.barrier.get(['domain'], validate);
        }
    }, {
        key: 'checkBarrier',
        value: function checkBarrier(next) {
            this.barrier.check(function (value) {
                next('barrier config is ' + JSON.stringify(value));
            });
        }
    }, {
        key: 'checkPassword',
        value: function checkPassword(next) {
            var self = this;
            function validate(value) {
                var password = value.password;
                if (password && password.length) {
                    next('password is setup ' + password);
                } else {
                    _inquirer2.default.prompt([{
                        type: 'input',
                        name: 'password',
                        message: 'please set the barrier password'
                    }], function (answers) {
                        self.barrier.set(['password'], answers.password, validate);
                    });
                }
            }
            this.barrier.get(['password'], validate);
        }
    }]);

    return PreFlight;
})();

exports.default = PreFlight;