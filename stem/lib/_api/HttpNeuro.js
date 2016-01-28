'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _yargs = require('yargs');

var _ObjMod = require('./ObjMod');

var _ObjMod2 = _interopRequireDefault(_ObjMod);

var _HttpConfig2 = require('./HttpConfig');

var _HttpConfig3 = _interopRequireDefault(_HttpConfig2);

var _PostMessage = require('./PostMessage');

var _PostMessage2 = _interopRequireDefault(_PostMessage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// extended service to use codex for configuration

var HttpNeuro = (function (_HttpConfig) {
    _inherits(HttpNeuro, _HttpConfig);

    function HttpNeuro(name) {
        _classCallCheck(this, HttpNeuro);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(HttpNeuro).call(this, name));

        _this.channel('codex').message('update', {
            keys: 'which part of the config store to update',
            value: 'value to change'
        }, function (json, finish) {
            if (json.meta) {
                _this.config.update(json.meta);
            }
            finish();
        });
        return _this;
    }

    return HttpNeuro;
})(_HttpConfig3.default);

exports.default = HttpNeuro;