"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// singleton for modifying key => value pair tree

var ObjMod = (function () {
    function ObjMod() {
        _classCallCheck(this, ObjMod);
    }

    _createClass(ObjMod, [{
        key: "fetch",
        value: function fetch(cursor, keys) {
            var prevObj = undefined,
                lastKey = undefined;

            keys = [].concat(keys);
            while (keys.length && cursor) {
                lastKey = keys.shift();
                prevObj = cursor;
                if (cursor[lastKey] === undefined) {
                    cursor[lastKey] = {};
                }
                cursor = cursor[lastKey];
            }

            return {
                obj: prevObj,
                key: lastKey
            };
        }
    }, {
        key: "set",
        value: function set(obj, keys, value) {
            var cursor = this.fetch(obj, keys);
            // set a value
            cursor.obj[cursor.key] = value;
        }
    }, {
        key: "get",
        value: function get(obj, keys) {
            var cursor = this.fetch(obj, keys);
            // get a value
            return cursor.obj[cursor.key];
        }
    }]);

    return ObjMod;
})();

exports.default = new ObjMod();