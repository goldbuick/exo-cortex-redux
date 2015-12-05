
import app from 'vorpal';
import { argv } from 'yargs';
import log from './_lib/log';
import CodexApi from './_api/codex-api';
import StemLocal from './_lib/stem-local';
import StemDocker from './_lib/stem-docker';

let vorpal = app();
log.output(function () {
    vorpal.log.apply(vorpal, arguments);
});

let didact;
if (argv.docker === undefined) {
    didact = new StemLocal();
} else {
    didact = new StemDocker();
}

let barrier = CodexApi('barrier');

vorpal.delimiter('exo-didact$').show();
didact.boot(vorpal, started => {

    vorpal.log('-------------------------------------')
    .log('welcome to', didact.kind())
    .log('-------------------------------------')
    .log('started: ' + started)
    .parse(process.argv);

    vorpal.command('lib')
    .description('show list of built-in neuros')
    .action(function(args, callback) {
        this.log('neuro-lib', didact.lib().join(', '));
        callback();
    });

    vorpal.command('running')
    .description('show list of running neuros')
    .action(function(args, callback) {
        didact.running(list => {
            vorpal.log('active neuros', list.join(', '));
            callback();
        });
    });

    vorpal.command('start <name>')
    .description('install a neuro')
    .autocompletion(function(text, iteration, callback) {
        let list = didact.lib();
        if (iteration > 1) return callback(void 0, list);

        var match = this.match(text, list);
        if (match) return callback(void 0, 'start ' + match);

        return callback(void 0, void 0);
    })    
    .action(function(args, callback) {
        didact.start(vorpal, args.name, callback);
    });

    vorpal.command('gaze <name>')
    .description('show logs from a neuro')
    .autocompletion(function(text, iteration, callback) {
        didact.running(list => {
            if (iteration > 1) return callback(void 0, list);

            var match = this.match(text, list);
            if (match) return callback(void 0, 'gaze ' + match);

            return callback(void 0, void 0);
        });
    })    
    .action(function(args, callback) {
        didact.gaze(vorpal, args.name, callback);
    });

    vorpal.command('kill <name>')
    .description('uninstall a neuro')
    .autocompletion(function(text, iteration, callback) {
        didact.running(list => {
            if (iteration > 1) return callback(void 0, list);

            var match = this.match(text, list);
            if (match) return callback(void 0, 'kill ' + match);

            return callback(void 0, void 0);
        });
    })    
    .action(function(args, callback) {
        didact.kill(vorpal, args.name, callback);
    });

    // vorpal.command('prefix [name]')
    // .description('show / set codepath prefix to find neuro files')
    // .action(function(args, callback) {
    //     if (args.name === undefined) {
    //         this.log('current prefix', didact.prefix);
    //     } else {
    //         didact.prefix = args.name;
    //         this.log('prefix updated to', didact.prefix);
    //     }
    //     callback();
    // });    

    vorpal.command('access')
    .description('show current access to web didact')
    .action(function(args, callback) {
        this.log('current password', barrier.value.password);
        this.log('current auth proxy', barrier.value.auth);
        callback();
    });

    vorpal.command('password <password>')
    .description('set password for barrier')
    .action(function(args, callback) {
        barrier.update('password', args.password);
        callback();
    });

    vorpal.command('proxy <source> <into>')
    .description('set proxy info for ui-didact')
    .action(function(args, callback) {
        barrier.update('auth', args.source, args.into);
        callback();
    });
});
