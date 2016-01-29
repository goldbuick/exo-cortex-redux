'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (fn) {

    function writeError(res, code, error) {
        console.log('HttpJson', 'error', error);
        res.writeHead(code, error, {
            'Content-Type': 'text/html; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Methods': 'GET, POST'
        });
        res.end('');
    }

    function writeResponse(req, res, json) {
        // invoke callback
        fn(req, json, function (result) {
            if (result === undefined) {
                result = { success: true };
            }

            res.writeHead(200, {
                'Content-Type': 'application/json; charset=utf-8',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Allow-Methods': 'GET, POST'
            });

            res.end(JSON.stringify(result));
        });
    }

    function postHandler(req, res) {
        var requestBody = '';

        req.on('data', function (data) {
            requestBody += data;
            if (requestBody.length > 1e7) {
                writeError(res, 413, 'Request Entity Too Large');
            }
        });

        req.on('end', function () {
            try {
                var json = JSON.parse(requestBody);

                try {
                    // invoke callback
                    writeResponse(req, res, json);
                } catch (e) {
                    writeError(res, 400, e.stack);
                }
            } catch (e) {
                writeError(res, 400, [e.stack, requestBody].join('\n'));
            }
        });
    }

    function getHandler(req, res) {
        try {
            // invoke callback
            writeResponse(req, res, undefined);
        } catch (e) {
            writeError(res, 400, e);
        }
    }

    function handler(req, res) {
        if (req.method === 'POST') {
            postHandler(req, res);
        } else if (req.method === 'GET') {
            getHandler(req, res);
        } else {
            writeError(res, 405, 'Method Not Supported');
        }
    }

    return _http2.default.createServer(handler);
};

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

;

// standard helper code to listen for incoming POST with json data