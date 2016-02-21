'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

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
                _this.update({
                    keys: [_this.name],
                    value: json
                });
            }
            finish();
        });

        _this.upstream(function (url, json, finish) {
            console.log(url, json, finish);
            finish();
        });
        return _this;
    }

    _createClass(HttpNeuro, [{
        key: 'update',
        value: function update(json) {
            var _this2 = this;

            _get(Object.getPrototypeOf(HttpNeuro.prototype), 'update', this).call(this, json);
            if (this.config().upstream === undefined) return;
            this.find('codex', function (codex) {
                (0, _PostMessage2.default)(codex.host, codex.port, 'codex', 'set', {
                    keys: [_this2.name, 'upstream'],
                    value: ''
                });
            });
        }
    }]);

    return HttpNeuro;
})(_HttpConfig3.default);

exports.default = HttpNeuro;