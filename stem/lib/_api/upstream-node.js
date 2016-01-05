'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (channel) {
    return new UpstreamNode(channel);
};

var _log = require('../_lib/_util/log');

var _log2 = _interopRequireDefault(_log);

var _codexClient = require('./codex-client');

var _codexClient2 = _interopRequireDefault(_codexClient);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var UpstreamNode = (function (_CodexClient) {
    _inherits(UpstreamNode, _CodexClient);

    function UpstreamNode(channel) {
        _classCallCheck(this, UpstreamNode);

        // register as an upstream node

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(UpstreamNode).call(this, channel));

        _this.api.connect(function () {
            _this.api.socket.emit('register', {
                node: _this.channel
            });
        });

        // watch for our upstream target config
        _this.changed(function (json) {
            if (typeof json.upstream === 'string') {
                _this.target = json.upstream;
            }
        });

        // watch for incoming upstream data
        _this.api.watch(_this.channel, function (message) {
            if (_this.target) {
                var _message = message;
                if (_this.onUpstream) _message = _this.onUpstream(message) || message;
                _message.upstream = _this.target;
                _this.api.upstream(_message);
            }
        });
        return _this;
    }

    // handle incoming upstream data

    _createClass(UpstreamNode, [{
        key: 'upstream',
        value: function upstream(handler) {
            this.onUpstream = handler;
        }

        // send data upstream

    }, {
        key: 'emit',
        value: function emit(type, data) {
            if (this.target) {
                var _message = makeMessage(this.channel, type, data);
                _message.upstream = this.target;
                this.api.upstream(_message);
            }
        }
    }]);

    return UpstreamNode;
})(_codexClient2.default);