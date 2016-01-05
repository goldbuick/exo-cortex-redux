'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (channel, type, data) {
    return {
        id: uuid.v4(),
        when: new Date().toISOString(),
        channel: channel,
        type: type,
        meta: data
    };
};

// standard message model
var uuid = require('node-uuid');
;