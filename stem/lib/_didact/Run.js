'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _ApiClient2 = require('../_api/ApiClient');

var _ApiClient3 = _interopRequireDefault(_ApiClient2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Run = (function (_ApiClient) {
    _inherits(Run, _ApiClient);

    function Run(host, port) {
        _classCallCheck(this, Run);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Run).call(this, host, port));

        _this.services = {};

        _this.PORTS = {
            FACADE: 7156,
            NEURO: 7200,
            BARRIER: 8888
        };

        _this.slots = {};
        var begin = _this.PORTS.NEURO,
            end = begin + 1000;
        for (var p = begin; p < end; ++p) {
            _this.slots[p] = false;
        }
        return _this;
    }

    _createClass(Run, [{
        key: 'findPort',
        value: function findPort(image) {
            switch (image) {
                case 'facade':
                    return this.PORTS.FACADE;
                case 'barrier':
                    return this.PORTS.BARRIER;
            }

            var begin = this.PORTS.NEURO,
                end = begin + 1000;
            for (var p = begin; p < end; ++p) {
                if (this.slots[p] === false) {
                    this.slots[p] = true;
                    return p;
                }
            }

            return 9999;
        }
    }, {
        key: 'releasePort',
        value: function releasePort(port) {
            this.slots[port] = false;
        }
    }, {
        key: 'image',
        value: function image(name) {
            var config = name.split('-');
            if (config[0] === 'ui' && config.length > 1) {
                return config[1];
            }
            return name;
        }
    }, {
        key: 'ui',
        value: function ui(name) {
            var config = name.split('-');
            return config[0] === 'ui' && config.length > 1;
        }
    }, {
        key: 'list',
        value: function list(success) {
            success({ services: Object.keys(this.services) });
        }
    }, {
        key: 'proxyPub',
        value: function proxyPub(name, success, fail) {
            var _this2 = this;

            this.address(name, function (address) {
                _this2.emit('codex', 'get', {
                    keys: ['ui-barrier']
                }, function (json) {
                    var barrierUrl = _this2.image(name) + '.' + json.domain,
                        serviceUrl = address.host + ':' + address.port;
                    _this2.emit('codex', 'set', {
                        keys: ['ui-barrier', 'pub', barrierUrl],
                        value: serviceUrl
                    }, success);
                });
            }, fail);
        }
    }, {
        key: 'proxyAuth',
        value: function proxyAuth(name, success, fail) {
            var _this3 = this;

            this.findAddress(name, function (address) {
                _this3.emit('codex', 'get', {
                    keys: ['ui-barrier']
                }, function (json) {
                    var barrierUrl = _this3.image(name) + '.' + json.domain,
                        serviceUrl = address.host + ':' + address.port;
                    _this3.emit('codex', 'set', {
                        keys: ['ui-barrier', 'auth', barrierUrl],
                        value: serviceUrl
                    }, success);
                });
            }, fail);
        }
    }, {
        key: 'findAddress',
        value: function findAddress(name, success, fail) {}
    }, {
        key: 'ping',
        value: function ping(name, data) {}
    }, {
        key: 'add',
        value: function add(name, success, fail) {}
    }, {
        key: 'remove',
        value: function remove(name, success, fail) {}
    }, {
        key: 'restart',
        value: function restart(name, success, fail) {}
    }]);

    return Run;
})(_ApiClient3.default);

exports.default = Run;