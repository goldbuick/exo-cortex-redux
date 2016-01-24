// express server
// expected args --service --path --port

import { argv } from 'yargs';
import express from 'express';
import engines from 'consolidate';
import favicon from 'serve-favicon';
import bodyParser from 'body-parser';
import compression from 'compression';
import errorHandler from 'errorhandler';
import HttpService from './_api/HttpService';

let app = express();

// setup views and port
app.set('views', argv.path + '/views');
app.set('view engine', 'html');
app.set('port', argv.port);
app.engine('html', engines['ejs']);

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
    console.log(argv.path, 'started on', argv.port);
    let temp = new HttpService(argv.service);
    temp.ping(() => {
        return { active: true };
    });
    temp.ready();
});
