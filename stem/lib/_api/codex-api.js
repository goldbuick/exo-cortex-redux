'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (key, onValue) {
    return new CodexAPI(key, onValue);
};

var _log = require('../_lib/_util/log');

var _log2 = _interopRequireDefault(_log);

var _objMod = require('../_lib/_util/obj-mod');

var _objMod2 = _interopRequireDefault(_objMod);

var _terraceListen = require('./terrace-listen');

var _terraceListen2 = _interopRequireDefault(_terraceListen);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CodexAPI = (function () {
    function CodexAPI(key, onValue) {
        var _this = this;

        _classCallCheck(this, CodexAPI);

        this.key = key;
        this.store = {};
        this.api = (0, _terraceListen2.default)();
        this.api.connect(function () {
            _this.api.emit('codex', 'get', { keys: [_this.key] });
        });
        this.api.message('codex/value', function (message) {
            var keys = message.meta.keys,
                value = message.meta.value;
            if (keys === undefined || value === undefined || keys[0] !== _this.key) return;

            // write update
            _objMod2.default.set(_this.store, keys, value);

            // callback for updated value
            if (onValue) {
                onValue(_this.store[_this.key]);
            }

            // waiting for the next updated value
            if (_this.onCheck) {
                var _check = _this.onCheck;
                delete _this.onCheck;
                _check(_this.store[_this.key]);
            }
        });
    }

    _createClass(CodexAPI, [{
        key: 'check',
        value: function check(onCheck) {
            this.onCheck = onCheck;
            this.api.emit('codex', 'get', { keys: [this.key] });
        }
    }, {
        key: 'get',
        value: function get(keys, onCheck) {
            var _keys = [this.key].concat(keys);
            if (onCheck) {
                this.onCheck = onCheck;
                this.api.emit('codex', 'get', { keys: _keys });
            }
            return _objMod2.default.get(this.store, _keys);
        }
    }, {
        key: 'set',
        value: function set(keys, value, onCheck) {
            var _keys = [this.key].concat(keys);
            _objMod2.default.set(this.store, _keys, value);
            if (onCheck) {
                this.onCheck = onCheck;
            }
            this.api.emit('codex', 'set', { keys: _keys, value: value });
        }
    }]);

    return CodexAPI;
})();