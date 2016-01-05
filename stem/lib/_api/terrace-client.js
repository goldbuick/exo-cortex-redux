'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (name) {
    return new _gateway.GatewayClient(name, _config2.default.PORTS.TERRACE);
};

var _config = require('./_config');

var _config2 = _interopRequireDefault(_config);

var _gateway = require('../_lib/gateway');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

;