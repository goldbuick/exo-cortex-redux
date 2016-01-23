'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (channel, type, data) {
    return {
        id: _nodeUuid2.default.v4(),
        when: new Date().toISOString(),
        channel: channel,
        type: type,
        meta: data
    };
};

var _nodeUuid = require('node-uuid');

var _nodeUuid2 = _interopRequireDefault(_nodeUuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }