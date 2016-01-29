'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _PostMessage = require('../_api/PostMessage');

var _PostMessage2 = _interopRequireDefault(_PostMessage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ApiClient = (function () {
    function ApiClient(host, port) {
        _classCallCheck(this, ApiClient);

        this.host = host;
        this.port = port;
        this.addressCache = {};
    }

    _createClass(ApiClient, [{
        key: 'find',
        value: function find(service, success) {
            var _this = this;

            if (service === 'didact') {
                return success({
                    service: service,
                    host: this.host,
                    port: this.port
                });
            }

            if (this.addressCache[service]) {
                return success(this.addressCache[service]);
            }

            (0, _PostMessage2.default)(this.host, this.port, 'didact', 'find', {
                service: service
            }, function (json) {
                _this.addressCache[json.service] = json;
                success(_this.addressCache[json.service]);
            }, function (err) {
                console.log('find error', err);
            });
        }
    }, {
        key: 'message',
        value: function message(service, type, data, success) {
            this.find(service, function (target) {
                (0, _PostMessage2.default)(target.host, target.port, service, type, data, success, function (err) {
                    console.log('message error', err);
                });
            });
        }
    }]);

    return ApiClient;
})();

exports.default = ApiClient;