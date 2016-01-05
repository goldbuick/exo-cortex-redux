'use strict';

var _config = require('./_api/_config');

var _config2 = _interopRequireDefault(_config);

var _gateway = require('./_lib/gateway');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _gateway.GatewayServer)('terrace', _config2.default.PORTS.TERRACE);