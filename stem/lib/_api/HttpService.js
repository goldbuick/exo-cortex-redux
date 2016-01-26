'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _yargs = require('yargs');

var _HttpApi2 = require('./HttpApi');

var _HttpApi3 = _interopRequireDefault(_HttpApi2);

var _PostMessage = require('./PostMessage');

var _PostMessage2 = _interopRequireDefault(_PostMessage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// extended api to log & ping didact
// --dev or --docker
// --didact [host:port]
// --port [port]

var HttpService = (function (_HttpApi) {
    _inherits(HttpService, _HttpApi);

    function HttpService(name) {
        _classCallCheck(this, HttpService);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(HttpService).call(this));

        _this.name = name;
        _this.address = {};

        var args = _yargs.argv.didact.split(':');
        _this.didact = { host: args[0], port: args[1] };
        if (_yargs.argv.dev) _this.didact.dev = true;
        if (_yargs.argv.docker) _this.didact.docker = true;
        return _this;
    }

    _createClass(HttpService, [{
        key: 'ping',
        value: function ping(handler) {
            this.onPing = handler;
        }
    }, {
        key: 'ready',
        value: function ready() {
            var data = this.onPing && this.onPing() || {};
            data.service = this.name;
            (0, _PostMessage2.default)(this.didact.host, this.didact.port, 'didact', 'ping', data);
        }
    }, {
        key: 'log',
        value: function log(data) {
            var service = this.name;
            (0, _PostMessage2.default)(this.didact.host, this.didact.port, 'didact', 'log', {
                service: service, data: data
            });
        }
    }, {
        key: 'find',
        value: function find(service, success, fail) {
            var _this2 = this;

            if (this.address[service]) {
                return success(this.address[service]);
            }

            (0, _PostMessage2.default)(this.didact.host, this.didact.port, 'didact', 'find', {
                service: service
            }, function (json) {
                _this2.address[json.service] = json;
                success(_this2.address[json.service]);
            }, fail);
        }
    }, {
        key: 'register',
        value: function register(service, host, port, success, fail) {
            (0, _PostMessage2.default)(this.didact.host, this.didact.port, 'didact', 'register', {
                service: service, host: host, port: port
            }, success, fail);
        }
    }, {
        key: 'start',
        value: function start() {
            var _this3 = this;

            if (this.onPing === undefined) {
                console.log('HttpService requires ping handler');
            } else {
                _get(Object.getPrototypeOf(HttpService.prototype), 'start', this).call(this, _yargs.argv.port);

                // ping every minute
                setInterval(function () {
                    return _this3.ready();
                }, 1000 * 60);
            }
        }
    }]);

    return HttpService;
})(_HttpApi3.default);

exports.default = HttpService;