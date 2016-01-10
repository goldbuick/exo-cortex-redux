'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var uuid = require('node-uuid');

// standard message model
var makeMessage = function makeMessage(channel, type, data) {
    return {
        id: uuid.v4(),
        when: new Date().toISOString(),
        channel: channel,
        type: type,
        meta: data
    };
};

makeMessage.sub = function (channel, type) {
    return [channel, type].join('/');
};

exports.default = makeMessage;