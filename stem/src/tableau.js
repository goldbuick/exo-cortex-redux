// express server
import log from './_lib/_util/log';

import { argv } from 'yargs';
import express from 'express';
import engines from 'consolidate';
import favicon from 'serve-favicon';
import bodyParser from 'body-parser';
import compression from 'compression';
import errorHandler from 'errorhandler';

let app = express();

// expected args --path && --port

// setup views and port
app.set('views', argv.path + '/views');
app.set('view engine', 'html');
app.set('port', argv.port);
app.engine('html', engines['ejs']);

// log requests
// app.use((req, res, next) => {
//     let path = req.get('host') + req.url;
//     log.msg('request', path);
//     next();
// });

// interface content
app.use(compression());
app.use(favicon(argv.path + '/favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(argv.path + '/public'));
app.use(errorHandler());

// load interface
app.get('/', (req, res) => {
    res.render('index', { optimize: true });
});

// start it up
app.listen(argv.port, () => {
    log.server(argv.path, 'started on', argv.port);
});
