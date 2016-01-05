'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _stem = require('./stem');

var _stem2 = _interopRequireDefault(_stem);

var _neuro = require('./neuro');

var _neuro2 = _interopRequireDefault(_neuro);

var _child_process = require('child_process');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var StemLocal = (function (_Stem) {
    _inherits(StemLocal, _Stem);

    function StemLocal() {
        _classCallCheck(this, StemLocal);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(StemLocal).apply(this, arguments));
    }

    _createClass(StemLocal, [{
        key: 'sourceImage',
        value: function sourceImage(neuro) {
            if (neuro.ui === false || neuro.image === 'barrier') return neuro.image;
            return 'tableau';
        }
    }, {
        key: 'start',
        value: function start(name, callback) {
            var _this2 = this;

            if (this.neuros[name]) {
                // this.log(name, 'restarting');
                this.neuros[name].child.kill();
            } else {
                // this.log(name, 'creating');
                this.neuros[name] = new _neuro2.default(name);
            }

            var neuro = this.neuros[name],
                params = [];

            if (neuro.ui) {
                var codePath = this.sourceImage(neuro),
                    sourcePath = _path2.default.join(__dirname, '/../../../../ui/', neuro.image);
                params = ['src/' + codePath, '--port', neuro.port, '--path', sourcePath];
            } else {
                params = ['src/' + neuro.image];
            }

            // start server
            // this.log(name, 'spawning', params.join(' '));
            neuro.child = (0, _child_process.spawn)('babel-node', params);

            // signal start
            function start(data) {
                if (callback && data.trim().length) {
                    (function () {
                        var _callback = callback;
                        setTimeout(function () {
                            _callback({ neuro: name });
                        }, 500);
                        callback = undefined;
                    })();
                }
            }

            // monitor child
            neuro.child.stdout.on('data', function (data) {
                var _data = data.toString('utf8');
                _this2.log(name, _data);
                start(_data);
            });
            neuro.child.stderr.on('data', function (data) {
                var _data = data.toString('utf8');
                _this2.log(name, 'ERROR', _data);
                start(_data);
            });
            neuro.child.on('exit', function (exitCode) {
                _this2.log(name, 'has exited with code', exitCode);
                _this2.neuros[name].freePort();
                delete _this2.neuros[name];
            });
        }
    }, {
        key: 'kill',
        value: function kill(name, callback) {
            if (this.neuros[name] === undefined) {
                this.log(name, 'is not running');
                return callback();
            }
            this.neuros[name].child.kill();
            callback({ neuro: name });
        }
    }]);

    return StemLocal;
})(_stem2.default);

exports.default = StemLocal;