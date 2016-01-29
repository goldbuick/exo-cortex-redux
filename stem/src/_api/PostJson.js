import http from 'http';
import https from 'https';

// standard helper code to POST json data to a given url

export default function(host, port, path, data, success, fail) {
    function writeError() {
        let error = Array.prototype.slice.call(arguments).join(' ');
        console.log('PostJson', 'error', error);
    }

    let dataString = JSON.stringify(data);

    // request headers
    let headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(dataString)
    };

    // request config
    let options = {
        host: host || 'localhost',
        port: port || 80,
        path: path || '/',
        method: 'POST',
        headers: headers
    };

    let proto = (options.port === 443) ? https : http;

    // setup request
    let req = proto.request(options, function (res) {
        let responseBody = '';

        function callbackError (message) {
            if (fail) fail(message);
        }

        res.on('data', function (chunk) {
            responseBody += chunk;
        });

        res.on('end', function() {
            try {
                let json = JSON.parse(responseBody);

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