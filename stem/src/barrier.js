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
import CodexClient from './_api/codex-client';

// CODEX-API

let gproxy = {},
    gdomain = '',
    store = CodexClient('barrier');

store.value('', (type, value) => {
    if (value.pub === undefined) {
        value.pub = { };
    }
    if (value.auth === undefined) {
        value.auth = { };
    }
    if (value.password === undefined) {
        value.password = 'D@k1WJcpL';
    }
}, value => {
    console.log('updated', value);
    gproxy.pub = { };
    gproxy.auth = { };
    if (value.password) {
        gproxy.password = value.password;
    }
    if (value.pub) {
        Object.keys(value.pub).forEach(key => gproxy.pub[key] = value.pub[key]);
    }
    if (value.auth) {
        Object.keys(value.auth).forEach(key => gproxy.auth[key] = value.auth[key]);
    }
    if (value.domain) {
        gdomain = '.' + value.domain;
        startBarrier();
    }
});

store.value('/pub/[0-9]+', (type, value) => {
    if (type !== 'object') {
        return { source: '', target: '' };
    }
});

store.value('/auth/[0-9]+', (type, value) => {
    if (type !== 'object') {
        return { source: '', target: '' };
    }
});

function startBarrier() {
    // EXPRESS

    let app = express(),
        proxy = new httpProxy.createProxyServer(),
        sysUser = { id: '18290341234-1234123948710829347--2sdfds-aqwer' };

    // PASSPORT

    passport.use(new Strategy((username, password, cb) => {
        if (password === gproxy.password) {
            log.msg('password accepted', password);
            return cb(null, sysUser);
        }
        log.msg('password rejected', password, '!==', gproxy.password);
        cb('{ "access": false }');
    }));

    passport.serializeUser((user, cb) => {
        cb(null, user.id);
    });

    passport.deserializeUser((id, cb) => {
        if (id === sysUser.id) {
            cb(null, sysUser);
        } else {
            cb('{ "access": false }');
        }
    });    

    // UI-SERVER

    // setup views and port
    let compiledDir = argv.path;
    app.set('views', compiledDir + '/views');
    app.set('view engine', 'html');
    app.set('port', argv.port);
    app.engine('html', engines['ejs']);

    // passport integration
    log.msg('barrier', 'using cookie domain', gdomain);
    app.use(session({
        resave: true,
        saveUninitialized: false,
        cookie: {
            domain: gdomain,
            maxAge: 86400
        },
        secret: '_exo_cortex_barrier_'
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    // authenticated proxy
    app.use((req, res, next) => {
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
            let target = gproxy.pub[req.hostname];
            if (target) {
                target = 'http://' + target;
                return proxy.web(req, res, { target: target });
            }
        }

        // authenticated domains
        if (gproxy.auth !== undefined) {
            let target = gproxy.auth[req.hostname];
            if (target && req.isAuthenticated()) {
                target = 'http://' + target;
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
    app.get('/', (req, res) => {
        res.render('index', { optimize: true });
    });

    // handle auth
    app.post('/barrier-auth', passport.authenticate('local'), (req, res) => {
        res.end('{ "access": ' + req.isAuthenticated() + ' }', 'utf8');
    });

    // start it up
    app.listen(argv.port, () => {
        log.server('barrier', 'started on', argv.port);
    });
}
