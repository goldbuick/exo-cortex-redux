// UI-SERVER

import express from 'express';
import engines from 'consolidate';
import favicon from 'serve-favicon';
import bodyParser from 'body-parser';
import compression from 'compression';
import errorHandler from 'errorhandler';
import cookieParser from 'cookie-parser';

// AUTH-PROXY

import passport from 'passport';
import httpProxy from 'http-proxy';
import session from 'express-session';
import { Strategy } from 'passport-local';

// CODEX-CONFIG

import { argv } from 'yargs';
import log from './_lib/log';
import apiCodex from './_api/codex';

// CODEX-API

let gproxy = { pub: { }, auth: { } },
    store = apiCodex('barrier');

store.value('', (type, value) => {
    if (value.pub === undefined) {
        value.pub = [ ];
    }
    if (value.auth === undefined) {
        value.auth = [ ];
    }
}, value => {
    gproxy = { pub: { }, auth: { } };
    if (value.pub && value.pub.forEach) {
        value.pub.forEach(pair => { gproxy.pub[pair.host] = pair.target; });
    }
    if (value.auth && value.auth.forEach) {
        value.auth.forEach(pair => { gproxy.auth[pair.host] = pair.target; });
    }
});

store.value('/pub/[0-9]+', (type, value) => {
    if (type !== 'object') {
        return { host: '', target: '' };
    }
});

store.value('/auth/[0-9]+', (type, value) => {
    if (type !== 'object') {
        return { host: '', target: '' };
    }
});

// EXPRESS

let app = express(),
    proxy = new httpProxy.createProxyServer(),
    sysUser = { id: '18290341234-1234123948710829347--2sdfds-aqwer' };

// PASSPORT

passport.use(new Strategy(function (username, password, cb) {
    log.msg('passport', 'username, password', username, password);
    cb(null, sysUser);
}));

passport.serializeUser(function(user, cb) {
    cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
    if (id === sysUser.id) {
        cb(null, sysUser);
    } else {
        cb('invalid user');
    }
});    

// UI-SERVER

// expected args --path

// setup views and port
let compiledDir = argv.path;
app.set('views', compiledDir + '/views');
app.set('view engine', 'html');
app.set('port', argv.port);
app.engine('html', engines['ejs']);

// passport integration
app.use(session({ secret: '_exo_cortex_barrier_', resave: true, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// authenticated proxy
app.use(function(req, res, next) {
    let host = req.get('host');
    log.msg('passport', 'request', host);

    // public domains
    if (gproxy.pub !== undefined) {
        let target = gproxy.pub[host];
        if (target !== undefined) {
            return proxy.web(req, res, { target: target });
        }
    }

    // authenticated domains
    if (req.isAuthenticated() && gproxy.auth !== undefined) {
        let target = gproxy.auth[host];
        if (target !== undefined) {
            return proxy.web(req, res, { target: target });
        }
    }

    next();
});

// interface content
app.use(compression());
app.use(favicon(compiledDir + '/favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(compiledDir + '/public'));
app.use(errorHandler());

// load interface
app.get('/', function(req, res) {
    res.render('index', {
        optimize: true
        // optimize: false,
        // cachebust: '?b=' + (new Date()).getTime()
    });
});

// handle auth
app.post('/', 
    passport.authenticate('local', { failureRedirect: '/' }),
    function(req, res) { res.redirect('/'); });    

// start it up
app.listen(argv.port, function() {
    log.server('barrier', 'started on', argv.port);
});
