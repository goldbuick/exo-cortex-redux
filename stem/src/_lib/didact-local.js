import DidactRun from './didact-run';
import { spawn } from 'child_process';

class DidactLocal extends DidactRun {

    constructor () {
        super();
        this.neuros = { };
    }

    kind () {
        return 'didact-local';
    }

    boot (callback) {
        callback();
    }

    running (callback) {
        callback(Object.keys(this.neuros));
    }

    start (vorpal, name, codepath, params, callback) {
        if (this.neuros[name]) {
            vorpal.log('restarting', name);
            this.neuros[name].kill();
        }

        params.unshift(this.prefix + codepath);
        vorpal.log('starting', name, params.join(', '));
        let child = spawn('babel-node', params);
        this.neuros[name] = child;

        child.stdout.on('data', data => {
            this.log(name, data.toString('utf8'));
        });
        child.stderr.on('data', data => {
            this.log(name, 'ERROR', data.toString('utf8'));
            vorpal.log(name, 'ERROR', data.toString('utf8'));
        });
        child.on('exit', exitCode => {
            this.log(name, 'has exited with code', exitCode);
            vorpal.log(name, 'has exited with code', exitCode);
            delete this.neuros[name];
        });

        callback();
    }

    kill (vorpal, name, callback) {
        if (this.neuros[name] === undefined) {
            vorpal.log(name, 'is not running');
            return;
        }
        this.neuros[name].kill();
        delete this.neuros[name];
        callback();
    }

}

export default DidactLocal;
