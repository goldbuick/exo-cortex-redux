'use strict';

var _yargs = require('yargs');

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _consolidate = require('consolidate');

var _consolidate2 = _interopRequireDefault(_consolidate);

var _serveFavicon = require('serve-favicon');

var _serveFavicon2 = _interopRequireDefault(_serveFavicon);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _compression = require('compression');

var _compression2 = _interopRequireDefault(_compression);

var _errorhandler = require('errorhandler');

var _errorhandler2 = _interopRequireDefault(_errorhandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();

// setup views and port
// express server
// expected args --path && --port

app.set('views', _yargs.argv.path + '/views');
app.set('view engine', 'html');
app.set('port', _yargs.argv.port);
app.engine('html', _consolidate2.default['ejs']);

// interface content
app.use((0, _compression2.default)());
app.use((0, _serveFavicon2.default)(_yargs.argv.path + '/favicon.ico'));
app.use(_bodyParser2.default.json());
app.use(_bodyParser2.default.urlencoded({ extended: true }));
app.use(_express2.default.static(_yargs.argv.path + '/public'));
app.use((0, _errorhandler2.default)());

// load interface
app.get('/', function (req, res) {
    res.render('index', { optimize: true });
});

// start it up
app.listen(_yargs.argv.port, function () {
    console.log(_yargs.argv.path, 'started on', _yargs.argv.port);
});