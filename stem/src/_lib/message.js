// standard message model
var uuid = require('node-uuid');
export default function (channel, type, data) {
    return {
        id: uuid.v4(),
        when: new Date().toISOString(),
        channel: channel,
        type: type,
        meta: data
    };
};