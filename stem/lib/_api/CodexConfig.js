'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _ObjMod = require('./ObjMod');

var _ObjMod2 = _interopRequireDefault(_ObjMod);

var _PostMessage = require('./PostMessage');

var _PostMessage2 = _interopRequireDefault(_PostMessage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

// use codex for applicaiton configuration

var typeOf = function typeOf(value) {
    var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);
    if (type === 'object') {
        if (Array.isArray(value)) type = 'array';
    } else if (type !== 'undefined') {
        type = 'value';
    }
    return type;
};

var checkMatch = function checkMatch(value, rule) {
    var type = typeOf(value.value),
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
};

var flatten = function flatten(result, parent, key, path, cursor) {
    var type = typeOf(cursor);

    result[path] = {
        parent: parent,
        key: key,
        value: cursor
    };

    if (type === 'array') {
        cursor.forEach(function (value, index) {
            flatten(result, cursor, index, path + '/' + index, value);
        });
    } else if (type === 'object') {
        Object.keys(cursor).forEach(function (key) {
            flatten(result, cursor, key, path + '/' + key, cursor[key]);
        });
    }
};

var CodexConfig = (function () {
    function CodexConfig(name) {
        _classCallCheck(this, CodexConfig);

        this.name = name;
        this.store = {};
        this.rules = {};
        this.before = {};
        this.triggers = {};
    }

    _createClass(CodexConfig, [{
        key: 'update',
        value: function update(json) {
            var _this = this;

            var keys = json.keys,
                value = json.value;

            if (keys === undefined || value === undefined || keys[0] !== this.name) return;

            // write update
            _ObjMod2.default.set(this.store, keys, value);

            // run rules
            var config = JSON.parse(JSON.stringify(this.store[this.name])),
                changed = this.checkJson(config);

            if (changed) {
                this.find('codex', function (codex) {
                    (0, _PostMessage2.default)(codex.host, codex.port, 'codex', 'set', {
                        keys: [_this.name],
                        value: config
                    });
                });
            }
        }
    }, {
        key: 'value',
        value: function value(pathRegex, rule, trigger) {
            this.rules[pathRegex] = rule;
            this.triggers[pathRegex] = trigger;
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
        key: 'checkJson',
        value: function checkJson(json) {
            var _this2 = this;

            var changed = false;

            var lookup = [];
            flatten(lookup, undefined, '', '', json);
            this.checkPatterns(lookup, function (path, pattern) {
                try {
                    if (checkMatch(lookup[path], _this2.rules[pattern])) {
                        changed = true;
                    }
                } catch (e) {
                    console.log('config', 'rule', pattern, e);
                }
            });

            lookup = [];
            flatten(lookup, undefined, '', '', json);
            this.checkPatterns(lookup, function (path, pattern) {
                var before = undefined;

                if (_this2.triggers[pattern] !== undefined) {
                    try {
                        if (_this2.before[path] === undefined) {
                            _this2.triggers[pattern](lookup[path].value, undefined);
                        } else if (_this2.before[path] !== JSON.stringify(lookup[path].value)) {
                            _this2.triggers[pattern](lookup[path].value, JSON.parse(_this2.before[path]));
                        }
                    } catch (e) {
                        console.log('config', 'trigger', pattern, e);
                    }
                }
            });

            this.before = {};
            Object.keys(lookup).forEach(function (path) {
                _this2.before[path] = JSON.stringify(lookup[path].value);
            });

            return changed;
        }
    }]);

    return CodexConfig;
})();

exports.default = CodexConfig;