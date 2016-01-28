'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _Run2 = require('./Run');

var _Run3 = _interopRequireDefault(_Run2);

var _yargs = require('yargs');

var _child_process = require('child_process');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var RunDev = (function (_Run) {
    _inherits(RunDev, _Run);

    function RunDev(host, port) {
        _classCallCheck(this, RunDev);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(RunDev).call(this));

        _this.didact = host + ':' + port;
        return _this;
    }

    _createClass(RunDev, [{
        key: 'nodeScript',
        value: function nodeScript(image) {
            switch (image) {
                case 'barrier':
                    return image;
            }
            return 'tableau';
        }
    }, {
        key: 'address',
        value: function address(name, success, fail) {
            success({
                host: 'localhost',
                port: (this.services[name] || {}).port || 0
            });
        }
    }, {
        key: 'ping',
        value: function ping(name, data) {
            if (this.services[name] === undefined || this.services[name].success === undefined) return;

            var success = this.services[name].success;
            delete this.services[name].success;

            this.address(name, success);
        }
    }, {
        key: 'add',
        value: function add(name, success, fail) {
            var _this2 = this;

            if (this.services[name]) return success();

            var ui = this.ui(name),
                image = this.image(name),
                service = { port: this.findPort(image) };

            var params = [];
            if (this.ui(name)) {
                params.push('lib/' + this.nodeScript(image));
                params.push('--service');
                params.push(name);
                params.push('--path');
                params.push(_path2.default.join(__dirname, '/../../../ui/', image));
            } else {
                params.push('lib/' + image);
            }

            params.push('--port');
            params.push(service.port);

            params.push('--didact');
            params.push(this.didact);

            if (_yargs.argv.dev) params.push('--dev');
            if (_yargs.argv.docker) params.push('--docker');

            // so we can wait for legit ready signal
            service.success = success;

            // start child
            service.child = (0, _child_process.spawn)('node', params);

            // monitor child
            service.child.stdout.on('data', function (data) {
                var _data = data.toString('utf8');
                console.log(name, _data);
            });
            service.child.stderr.on('data', function (data) {
                var _data = data.toString('utf8');
                console.log(name, 'ERROR', _data);
            });
            service.child.on('exit', function (exitCode) {
                console.log(name, 'has exited with code', exitCode);
                _this2.releasePort(_this2.services[name].port);
                delete _this2.services[name];
            });

            // track so we can kill it later
            this.services[name] = service;

            // proxy ui
            // if (ui && image !== 'barrier') {
            //     this.proxyAuth(name, () => {
            //         console.log(name, 'auth proxied');
            //     });
            // }
        }
    }, {
        key: 'remove',
        value: function remove(name, success, fail) {
            var _this3 = this;

            if (this.services[name] === undefined) return success();
            this.services[name].child.kill();
            var wait = function wait() {
                if (_this3.services[name] === undefined) return success();
                setTimeout(wait, 512);
            };
            wait();
        }
    }, {
        key: 'restart',
        value: function restart(name, success, fail) {
            var _this4 = this;

            if (this.services[name] === undefined) return success();
            this.remove(name, function () {
                _this4.add(name, success, fail);
            }, fail);
        }
    }]);

    return RunDev;
})(_Run3.default);

exports.default = RunDev;