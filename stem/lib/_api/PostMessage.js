'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (host, port, channel, type, data, success, fail) {
    var path = '/' + [channel, type].join('/');
    (0, _PostJson2.default)(host, port, path, (0, _Message2.default)(channel, type, data), success, fail);
};

var _Message = require('./Message');

var _Message2 = _interopRequireDefault(_Message);

var _PostJson = require('./PostJson');

var _PostJson2 = _interopRequireDefault(_PostJson);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }