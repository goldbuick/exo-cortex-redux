'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (host, port, path, data, success, fail) {
    function writeError() {
        var error = Array.prototype.slice.call(arguments).join(' ');
        console.log('PostJson', 'error', error);
    }

    var dataString = JSON.stringify(data);

    // request headers
    var headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(dataString)
    };

    // request config
    var options = {
        host: host || 'localhost',
        port: port || 80,
        path: path || '/',
        method: 'POST',
        headers: headers
    };

    var proto = options.port === 443 ? _https2.default : _http2.default;

    // setup request
    var req = proto.request(options, function (res) {
        var responseBody = '';

        function callbackError(message) {
            if (fail) fail(message);
        }

        res.on('data', function (chunk) {
            responseBody += chunk;
        });

        res.on('end', function () {
            try {
                var json = JSON.parse(responseBody);

                try {
                    // invoke callback
                    if (success) success(json);
                } catch (e) {
                    callbackError(e.stack);
                }
            } catch (e) {
                callbackError([e.stack, responseBody].join('\n'));
            }
        });
    });

    req.on('error', function (error) {
        writeError(JSON.stringify(options, null, '\t'), error, 'for data', JSON.stringify(data, null, '\t'));
    });

    // emit request
    req.end(dataString);
};

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

;

// standard helper code to POST json data to a given url