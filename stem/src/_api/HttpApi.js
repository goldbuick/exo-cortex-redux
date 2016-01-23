import HttpJson from './HttpJson';

// handle messages on channels with ability to describe supported messages

class Channel {

    constructor (httpApi, name) {
        this.name = name;
        this.messages = { };
    }

    message (type, spec, handler) {
        this.messages[type] = { spec, handler };
    }

}

class HttpApi {

    constructor () {
        this.channels = { };
        this.http = HttpJson((req, json, finish) => {
            let url = req.url;
            // console.log(url, json);

            let channel,
                message,
                route = url.split('/');

            route.shift();
            let _channel = route[0],
                _message = route[1];

            // validate channel
            if (_channel) {
                channel = this.channels[_channel];
            }

            // validate message
            if (channel && _message) {
                message = channel.messages[_message];
            }

            if (json) {
                // handler op
                if (message) {
                    return message.handler(json, finish);

                } else if (this.onUpstream) {
                    // we don't know what to do with this message
                    return this.onUpstream(url, json, finish);
                }

            } else {
                // list op
                if (!channel) {
                    // list channels
                    return finish({ channels: Object.keys(this.channels) });

                } else if (!message) {
                    // list messages
                    return finish({ messages: Object.keys(channel.messages) });

                } else {
                    // describe handler
                    return finish(message.spec);

                }
            }

            finish();
        });
    }

    channel (name) {
        this.channels[name] = new Channel(this, name);
        return this.channels[name];
    }

    upstream (handler) {
        this.onUpstream = handler;
    }

    start (port) {
        this.http.listen(port);
        console.log('starting on port', port);
    }

}

export default HttpApi;
