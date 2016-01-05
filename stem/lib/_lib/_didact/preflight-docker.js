'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _preflight = require('./preflight');

var _preflight2 = _interopRequireDefault(_preflight);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PreFlightDocker = (function (_PreFlight) {
    _inherits(PreFlightDocker, _PreFlight);

    function PreFlightDocker() {
        _classCallCheck(this, PreFlightDocker);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(PreFlightDocker).apply(this, arguments));
    }

    _createClass(PreFlightDocker, [{
        key: 'checklist',
        value: function checklist() {
            return ['check docker api connection', // TODO
            'check data volume arg', // TODO
            'start rethinkdb'];
        }
    }]);

    return PreFlightDocker;
})(_preflight2.default);

// TODO
exports.default = PreFlightDocker;