'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Stem = (function () {
    function Stem() {
        _classCallCheck(this, Stem);

        this.logs = {};
        this.neuros = {};
    }

    _createClass(Stem, [{
        key: 'sourceImage',
        value: function sourceImage(neuro) {
            return neuro.image;
        }
    }, {
        key: 'log',
        value: function log() {
            var args = Array.prototype.slice.call(arguments),
                name = args.shift();

            if (this.logs[name] === undefined) {
                this.logs[name] = [];
            }

            this.logs[name].unshift(args.join(' '));
            if (this.logs[name].length > 100) {
                this.logs[name].pop();
            }

            // args.unshift('--------' + name);
            // console.log.apply(console, args);
        }
    }, {
        key: 'start',
        value: function start(name, callback) {
            callback();
        }
    }, {
        key: 'kill',
        value: function kill(name, callback) {
            callback();
        }
    }, {
        key: 'running',
        value: function running(callback) {
            callback(Object.keys(this.neuros));
        }
    }, {
        key: 'gaze',
        value: function gaze(name, callback) {
            var list = this.logs[name] || [];
            callback(list);
        }
    }, {
        key: 'neuro',
        value: function neuro(name) {
            if (this.neuros[name]) {
                return this.neuros[name];
            }
        }
    }]);

    return Stem;
})();

exports.default = Stem;