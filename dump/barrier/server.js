var express = require('express'),
    engines = require('consolidate'),
    favicon = require('serve-favicon'),
    bodyParser = require('body-parser'),
    compression = require('compression'),
    errorHandler = require('errorhandler'),
    cookieParser = require('cookie-parser');

var sysUser = { id: '18290341234-1234123948710829347--2sdfds-aqwer' },
    passport = require('passport'),
    httpProxy = require('http-proxy'),
    session = require('express-session'),
    Strategy = require('passport-local').Strategy;

exports.startServer = function(config, callback) {
    var app = express(),
        proxy = new httpProxy.createProxyServer();

    passport.use(new Strategy(function (username, password, cb) {
        console.log('username, password', username, password);
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

    // setup views and port
    app.set('views', config.server.views.path);
    app.set('view engine', config.server.views.extension);
    app.set('port', process.env.PORT || config.server.port || 3000);
    app.engine(config.server.views.extension, engines[config.server.views.compileWith]);

    // passport integration
    app.use(session({ secret: 'exo-cortex-barrier', resave: true, saveUninitialized: false }));
    app.use(passport.initialize());
    app.use(passport.session());

    // authenticated proxy
    app.use(function(req, res, next) {
        var host = req.get('host').split(':')[0];
        console.log('host', host);

        // public paths
        // private paths

        // need an api key by-pass here

        if (req.isAuthenticated()) {
            if (host === 'cortex.space') {
                proxy.web(req, res, { target: 'http://gamedevmap.com:80' });
            } else {
                next();
            }
        } else {
            next();
        }

        // basically we're going to have a collection of
        // proxy routes that are public / private
        // if (req.isAuthenticated()) {
        //     // here we look at the host in the headers
        //     // to determine where to proxy the traffic
        //     proxy.web(req, res, { target: 'http://gamedevmap.com:80' });
        // } else {
        //     next();
        // }

        // we should be able to use codex to store the routing config
    });

    // standard mimosa
    app.use(compression());
    app.use(favicon(config.watch.compiledDir + '/favicon.ico'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(cookieParser());

    app.use(express.static(config.watch.compiledDir));
    if (app.get('env') === 'development') {
        app.use(errorHandler());
    }

    // routes
    cachebust = ''
    if (process.env.NODE_ENV !== "production") {
        cachebust = "?b=" + (new Date()).getTime()
    }

    var routeOptions = {
        reload:    config.liveReload.enabled,
        optimize:  config.isOptimize != null ? config.isOptimize : false,
        cachebust: cachebust
    };

    // load interface
    app.get('/', function(req, res) {
        var name = "index";
        if (config.isOptimize) name += "-optimize";
        res.render(name, routeOptions);
    });

    app.post('/', 
        passport.authenticate('local', { failureRedirect: '/' }),
        function(req, res) { res.redirect('/'); });    

    // start it up
    var server = app.listen(app.get('port'), function() {
        console.log('Express server listening on port ' + app.get('port'));
    });

    callback(server);
};