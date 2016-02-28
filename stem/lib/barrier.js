'use strict';

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

var _cookieParser = require('cookie-parser');

var _cookieParser2 = _interopRequireDefault(_cookieParser);

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

var _httpProxy = require('http-proxy');

var _httpProxy2 = _interopRequireDefault(_httpProxy);

var _expressSession = require('express-session');

var _expressSession2 = _interopRequireDefault(_expressSession);

var _passportLocal = require('passport-local');

var _yargs = require('yargs');

var _HttpConfig = require('./_api/HttpConfig');

var _HttpConfig2 = _interopRequireDefault(_HttpConfig);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var gproxy = {},
    gdomain = '',
    store = new _HttpConfig2.default('ui-barrier');

store.ping(function () {
    return { active: true };
});

store.value('', function (type, value) {
    if (value.pub === undefined) {
        value.pub = {};
    }
    if (value.auth === undefined) {
        value.auth = {};
    }
    if (value.password === undefined) {
        value.password = 'D@k1WJcpL';
    }
}, function (value) {
    gproxy.pub = {};
    gproxy.auth = {};
    if (value.password) {
        gproxy.password = value.password;
    }
    if (value.pub) {
        Object.keys(value.pub).forEach(function (key) {
            return gproxy.pub[key] = value.pub[key];
        });
    }
    if (value.auth) {
        Object.keys(value.auth).forEach(function (key) {
            return gproxy.auth[key] = value.auth[key];
        });
    }
    if (value.domain) {
        gdomain = '.' + value.domain;
    }
});

store.value('/pub/[0-9]+', function (type, value) {
    if (type !== 'object') {
        return { source: '', target: '' };
    }
});

store.value('/auth/[0-9]+', function (type, value) {
    if (type !== 'object') {
        return { source: '', target: '' };
    }
});

// EXPRESS

var app = (0, _express2.default)(),
    proxy = new _httpProxy2.default.createProxyServer(),
    sysUser = { id: '18290341234-1234123948710829347--2sdfds-aqwer' };

// PROXY
proxy.on('error', function () {
    // prevent proxy errors from crashing barrier
});

// PASSPORT

_passport2.default.use(new _passportLocal.Strategy(function (username, password, cb) {
    if (password === gproxy.password) {
        console.log('password accepted', password);
        return cb(null, sysUser);
    }
    console.log('password rejected', password, '!==', gproxy.password);
    cb('{ "access": false }');
}));

_passport2.default.serializeUser(function (user, cb) {
    cb(null, user.id);
});

_passport2.default.deserializeUser(function (id, cb) {
    if (id === sysUser.id) {
        cb(null, sysUser);
    } else {
        cb('{ "access": false }');
    }
});

// UI-SERVER

// setup views and port
var compiledDir = _yargs.argv.path;
app.set('views', compiledDir + '/views');
app.set('view engine', 'html');
app.set('port', _yargs.argv.port);
app.engine('html', _consolidate2.default['ejs']);

// passport integration
app.use((0, _expressSession2.default)({
    resave: true,
    saveUninitialized: false,
    cookie: { domain: '' },
    secret: '_exo_cortex_barrier_'
}));
app.use(_passport2.default.initialize());
app.use(_passport2.default.session());

// authenticated proxy
app.use(function (req, res, next) {
    // make sure we have session cookie domain
    if (req.session && req.session.cookie && req.session.cookie.domain !== gdomain) {
        req.session.cookie.domain = gdomain;
    }

    // Enable cors.
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');

    // barrier-auth response
    if (req.url === 'barrier-auth') {
        return res.end('{ "access": ' + req.isAuthenticated() + ' }', 'utf8');
    }

    // public domains
    if (gproxy.pub !== undefined) {
        var target = gproxy.pub[req.hostname];
        if (target) {
            target = 'http://' + target;
            return proxy.web(req, res, { target: target, changeOrigin: true });
        }
    }

    // authenticated domains
    if (gproxy.auth !== undefined) {
        var target = gproxy.auth[req.hostname];
        if (target && req.isAuthenticated()) {
            target = 'http://' + target;
            return proxy.web(req, res, { target: target, changeOrigin: true });
        }
    }

    next();
});

// interface content
app.use((0, _compression2.default)());
app.use((0, _serveFavicon2.default)(compiledDir + '/favicon.ico'));
app.use(_bodyParser2.default.json());
app.use(_bodyParser2.default.urlencoded({ extended: true }));
app.use((0, _cookieParser2.default)());
app.use(_express2.default.static(compiledDir + '/public'));
app.use((0, _errorhandler2.default)());

// load interface
app.get('/', function (req, res) {
    res.render('index', { optimize: true });
});

// handle auth
app.post('/barrier-auth', _passport2.default.authenticate('local'), function (req, res) {
    res.end('{ "access": ' + req.isAuthenticated() + ' }', 'utf8');
});

// handle config updates
// will need to whitelist this request to
// limit it to only things local to the machine
app.post('/codex/update', function (req, res) {
    store.update(req.body.meta);
    res.end('{ "success": true }');
});

// start it up
app.listen(_yargs.argv.port, function () {
    store.ready();
    console.log('ui-barrier', 'stared on', _yargs.argv.port);
});