import app from 'vorpal';
import { argv } from 'yargs';
import DidactLocal from './_lib/didact-local';
import DidactDocker from './_lib/didact-docker';

let didact;
if (argv.docker === undefined) {
    didact = new DidactLocal();
} else {
    didact = new DidactDocker();
}

didact.boot(() => {
    let vorpal = app();

    vorpal.delimiter('exo-didact$')
    .show()
    .log('-------------------------------------')
    .log('welcome to', didact.kind())
    .log('-------------------------------------')
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

    vorpal.command('prefix [name]')
    .description('show / set codepath prefix to find neuro files')
    .action(function(args, callback) {
        if (args.name === undefined) {
            this.log('current prefix', didact.prefix);
        } else {
            didact.prefix = args.name;
            this.log('prefix updated to', didact.prefix);
        }
        callback();
    });

    didact.setup(vorpal);
});
