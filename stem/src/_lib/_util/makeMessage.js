let uuid = require('node-uuid');

// standard message model
let makeMessage = (channel, type, data) => {
    return {
        id: uuid.v4(),
        when: new Date().toISOString(),
        channel: channel,
        type: type,
        meta: data
    };
};

makeMessage.sub = (channel, type) => {
    return [channel, type].join('/');
};

export default makeMessage;