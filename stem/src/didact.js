import app from 'vorpal';
import log from './_lib/log';
import { argv } from 'yargs';
import DidactLocal from './_lib/didact-local';
import DidactDocker from './_lib/didact-docker';

let didact;
if (argv.docker === undefined) {
    didact = new DidactLocal();
} else {
    didact = new DidactDocker();
}

let vorpal = app();

// log.method(() => {
//     vorpal.log.apply(vorpal, arguments);    
// });

vorpal.command('lib')
.description('show list of built-in neuros')
.action(function(args, callback) {
    this.log('neuro-lib', didact.lib());
    callback();
});

vorpal.command('running')
.description('show list of running neuros')
.action(function(args, callback) {
    didact.running(vorpal, callback);
});

vorpal.command('start <name> [codepath]')
.description('install a neuro')
.action(function(args, callback) {
    let params = [ ];
    didact.start(vorpal, args.name, args.codepath || args.name, params, callback);
});

vorpal.command('kill <name>')
.description('uninstall a neuro')
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

didact.boot(vorpal, () => {
    vorpal.delimiter('exo-didact$')
    .show()
    .log('-------------------------------------')
    .log('welcome to', didact.kind())
    .log('-------------------------------------')
    .parse(process.argv);
});
