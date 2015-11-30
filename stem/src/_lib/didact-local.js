import path from 'path';
import DidactRun from './didact-run';
import { spawn } from 'child_process';

class DidactLocal extends DidactRun {

    constructor () {
        super();
        this.ports = { };
        this.neuros = { };
        for (let p=7000; p<8000; ++p) {
            this.ports[p] = false;
        }
    }

    findPort () {
        for (let p=7200; p<8000; ++p) {
            if (this.ports[p] === false) {
                this.ports[p] = true;
                return p;
            }
        }
        return 8000;
    }

    freePort (port) {
        if (this.ports[port] === undefined) return;
        this.ports[port] = false;
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

    start (vorpal, name, callback) {
        if (this.neuros[name]) {
            vorpal.log('restarting', name);
            this.neuros[name].kill();
        }

        // determine run mode
        let port,
            params = [ ],
            config = name.split('-');

        switch (config[0]) {
            case 'ui':
                let codePath = config[1],
                    sourcePath = path.join( __dirname, '/../../../ui/', codePath);
                if (codePath === 'barrier') {
                    port = 8888;
                } else {
                    codePath = 'tableau';
                    port = this.findPort();
                }
                params = [ '--', this.prefix + codePath, '--port', port, '--path', sourcePath ];
                break;

            default:
                params = [ '--', this.prefix + name ];
                break;
        }

        // start server
        vorpal.log('spawning', params.join(' '));
        let child = spawn('babel-node', params);
        this.neuros[name] = child;

        // monitor child
        child.stdout.on('data', data => {
            this.log(name, data.toString('utf8'));
        });
        child.stderr.on('data', data => {
            this.log(name, 'ERROR', data.toString('utf8'));
            vorpal.log(name, 'ERROR', data.toString('utf8'));
        });
        child.on('exit', exitCode => {
            if (port !== undefined) this.freePort(port);
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
