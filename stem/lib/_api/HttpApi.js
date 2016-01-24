'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _HttpJson = require('./HttpJson');

var _HttpJson2 = _interopRequireDefault(_HttpJson);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// handle messages on channels with ability to describe supported messages

var Channel = (function () {
    function Channel(httpApi, name) {
        _classCallCheck(this, Channel);

        this.name = name;
        this.messages = {};
    }

    _createClass(Channel, [{
        key: 'message',
        value: function message(type, spec, handler) {
            this.messages[type] = { spec: spec, handler: handler };
        }
    }]);

    return Channel;
})();

var HttpApi = (function () {
    function HttpApi() {
        var _this = this;

        _classCallCheck(this, HttpApi);

        this.channels = {};
        this.http = (0, _HttpJson2.default)(function (req, json, finish) {
            var url = req.url;
            // console.log(url, json);

            var channel = undefined,
                message = undefined,
                route = url.split('/');

            route.shift();
            var _channel = route[0],
                _message = route[1];

            // validate channel
            if (_channel) {
                channel = _this.channels[_channel];
            }

            // validate message
            if (channel && _message) {
                message = channel.messages[_message];
            }

            if (json) {
                // handler op
                if (message) {
                    return message.handler(json, finish);
                } else if (_this.onUpstream) {
                    // we don't know what to do with this message
                    return _this.onUpstream(url, json, finish);
                }
            } else {
                // list op
                if (!channel) {
                    // list channels
                    return finish({ channels: Object.keys(_this.channels) });
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

    _createClass(HttpApi, [{
        key: 'channel',
        value: function channel(name) {
            this.channels[name] = new Channel(this, name);
            return this.channels[name];
        }
    }, {
        key: 'upstream',
        value: function upstream(handler) {
            this.onUpstream = handler;
        }
    }, {
        key: 'start',
        value: function start(port) {
            this.http.listen(port);
            console.log('starting on port', port);
        }
    }]);

    return HttpApi;
})();

exports.default = HttpApi;