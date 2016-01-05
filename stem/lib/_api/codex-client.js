'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (channel) {
    return new CodexClient(channel);
};

var _log = require('../_lib/_util/log');

var _log2 = _interopRequireDefault(_log);

var _objMod = require('../_lib/_util/obj-mod');

var _objMod2 = _interopRequireDefault(_objMod);

var _terraceListen = require('./terrace-listen');

var _terraceListen2 = _interopRequireDefault(_terraceListen);

var _message = require('../_lib/_util/message');

var _message2 = _interopRequireDefault(_message);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _sub(channel, type) {
    return [channel, type].join('/');
}

var CodexClient = (function () {
    function CodexClient(channel) {
        var _this = this;

        _classCallCheck(this, CodexClient);

        this.channel = channel;
        this.store = {};
        this.rules = {};
        this.before = {};
        this.triggers = {};
        this.api = (0, _terraceListen2.default)();
        this.api.connect(function () {
            _this.api.emit('codex', 'get', { keys: [_this.channel] });
        });
        this.api.message('codex/value', function (message) {
            var keys = message.meta.keys,
                value = message.meta.value;
            if (keys === undefined || value === undefined || keys[0] !== _this.channel) return;

            // write update
            _objMod2.default.set(_this.store, keys, value);

            // run rules
            var json = JSON.parse(JSON.stringify(_this.store[_this.channel])),
                changed = _this.checkJson(json);

            // signal update value
            if (changed) {
                if (_this.onChanged) _this.onChanged(json);
                _this.api.emit('codex', 'set', { keys: [_this.channel], value: json });
            }
        });
    }

    _createClass(CodexClient, [{
        key: 'changed',
        value: function changed(handler) {
            this.onChanged = handler;
        }
    }, {
        key: 'value',
        value: function value(pathRegex, rule, trigger) {
            this.rules[pathRegex] = rule;
            this.triggers[pathRegex] = trigger;
        }
    }, {
        key: 'typeOf',
        value: function typeOf(value) {
            var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);
            if (type === 'object') {
                if (Array.isArray(value)) type = 'array';
            } else if (type !== 'undefined') {
                type = 'value';
            }
            return type;
        }
    }, {
        key: 'flatten',
        value: function flatten(result, parent, key, path, cursor) {
            var _this2 = this;

            var type = this.typeOf(cursor);

            result[path] = {
                parent: parent,
                key: key,
                value: cursor
            };

            if (type === 'array') {
                cursor.forEach(function (value, index) {
                    _this2.flatten(result, cursor, index, path + '/' + index, value);
                });
            } else if (type === 'object') {
                Object.keys(cursor).forEach(function (key) {
                    _this2.flatten(result, cursor, key, path + '/' + key, cursor[key]);
                });
            }
        }
    }, {
        key: 'checkPatterns',
        value: function checkPatterns(lookup, fn) {
            var patterns = Object.keys(this.rules);

            Object.keys(lookup).forEach(function (path) {
                patterns.forEach(function (pattern) {
                    var result = path.match(pattern);
                    if (result && result[0].length === path.length) {
                        fn(path, pattern);
                    }
                });
            });
        }
    }, {
        key: 'checkMatch',
        value: function checkMatch(value, rule) {
            var type = this.typeOf(value.value),
                start = JSON.stringify(value.value);

            var changed = false,
                result = rule(type, value.value);

            if (type === 'value') {
                if (result !== undefined) {
                    changed = true;
                    value.parent[value.key] = result;
                }
            } else {
                if (result !== undefined) {
                    changed = true;
                    value.parent[value.key] = result;
                } else {
                    changed = start !== JSON.stringify(value.value);
                }
            }

            return changed;
        }
    }, {
        key: 'checkJson',
        value: function checkJson(json) {
            var _this3 = this;

            var changed = false;

            var lookup = [];
            this.flatten(lookup, undefined, '', '', json);
            this.checkPatterns(lookup, function (path, pattern) {
                try {
                    if (_this3.checkMatch(lookup[path], _this3.rules[pattern])) {
                        changed = true;
                    }
                } catch (e) {
                    _log2.default.event('codex', 'rule', pattern, e);
                }
            });

            lookup = [];
            this.flatten(lookup, undefined, '', '', json);
            this.checkPatterns(lookup, function (path, pattern) {
                var before;

                if (_this3.triggers[pattern] !== undefined) {
                    try {
                        if (_this3.before[path] === undefined) {
                            _this3.triggers[pattern](lookup[path].value, undefined);
                        } else if (_this3.before[path] !== JSON.stringify(lookup[path].value)) {
                            _this3.triggers[pattern](lookup[path].value, JSON.parse(_this3.before[path]));
                        }
                    } catch (e) {
                        _log2.default.event('codex', 'trigger', pattern, e);
                    }
                }
            });

            this.before = {};
            Object.keys(lookup).forEach(function (path) {
                _this3.before[path] = JSON.stringify(lookup[path].value);
            });

            return changed;
        }
    }]);

    return CodexClient;
})();