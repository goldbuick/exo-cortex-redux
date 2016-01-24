'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Run = (function () {
    function Run() {
        _classCallCheck(this, Run);

        this.services = {};

        this.PORTS = {
            FACADE: 7156,
            NEURO: 7200,
            BARRIER: 8888
        };

        this.slots = {};
        var begin = this.PORTS.NEURO,
            end = begin + 1000;
        for (var p = begin; p < end; ++p) {
            this.slots[p] = false;
        }
    }

    _createClass(Run, [{
        key: 'findPort',
        value: function findPort(image) {
            switch (image) {
                case 'facade':
                    return this.PORTS.FACADE;
                case 'barrier':
                    return this.PORTS.BARRIER;
            }

            var begin = this.PORTS.NEURO,
                end = begin + 1000;
            for (var p = begin; p < end; ++p) {
                if (this.slots[p] === false) {
                    this.slots[p] = true;
                    return p;
                }
            }

            return 9999;
        }
    }, {
        key: 'releasePort',
        value: function releasePort(port) {
            this.slots[port] = false;
        }
    }, {
        key: 'image',
        value: function image(name) {
            var config = name.split('-');
            if (config[0] === 'ui' && config.length > 1) {
                return config[1];
            }
            return name;
        }
    }, {
        key: 'ui',
        value: function ui(name) {
            var config = name.split('-');
            return config[0] === 'ui' && config.length > 1;
        }
    }, {
        key: 'list',
        value: function list(success) {
            success({ services: Object.keys(this.services) });
        }
    }, {
        key: 'ping',
        value: function ping(name, data) {}
    }, {
        key: 'add',
        value: function add(name, success, fail) {}
    }, {
        key: 'remove',
        value: function remove(name, success, fail) {}
    }, {
        key: 'restart',
        value: function restart(name, success, fail) {}
    }]);

    return Run;
})();

exports.default = Run;