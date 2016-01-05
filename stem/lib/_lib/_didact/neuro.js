'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _config = require('../../_api/_config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PortManager = (function () {
    function PortManager() {
        _classCallCheck(this, PortManager);

        this.ports = {};
        var begin = _config2.default.PORTS.BASE_NEURO,
            end = begin + 1000;
        for (var p = begin; p < end; ++p) {
            this.ports[p] = false;
        }
    }

    _createClass(PortManager, [{
        key: 'find',
        value: function find() {
            var begin = _config2.default.PORTS.BASE_NEURO,
                end = begin + 1000;
            for (var p = begin; p < end; ++p) {
                if (this.ports[p] === false) {
                    this.ports[p] = true;
                    return p;
                }
            }
            return 9999;
        }
    }, {
        key: 'free',
        value: function free(port) {
            if (this.ports[port] === undefined) return;
            this.ports[port] = false;
        }
    }]);

    return PortManager;
})();

var portManager = new PortManager();

var Neuro = (function () {
    function Neuro(name) {
        _classCallCheck(this, Neuro);

        this.name = name;
        var config = name.split('-');
        if (config[0] === 'ui' && config.length > 1) {
            this.ui = true;
            this.image = config[1];
        } else {
            this.ui = false;
            this.image = name;
        }
        this.port = this.findPort(this.image);
    }

    _createClass(Neuro, [{
        key: 'findPort',
        value: function findPort(image) {
            switch (image) {
                case 'facade':
                    return _config2.default.PORTS.FACADE;
                case 'barrier':
                    return _config2.default.PORTS.BARRIER;
                case 'terrace':
                    return _config2.default.PORTS.TERRACE;
            }
            return portManager.find();
        }
    }, {
        key: 'freePort',
        value: function freePort() {
            portManager.find(this.port);
        }
    }]);

    return Neuro;
})();

exports.default = Neuro;