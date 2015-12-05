import path from 'path';
import Stem from './stem';
import Neuro from './neuro';
import { spawn } from 'child_process';

class StemLocal extends Stem {

    kind () {
        return 'didact-local';
    }

    sourceImage (neuro) {
        if (neuro.ui === false || neuro.image === 'barrier') return neuro.image;
        return 'tableau';
    }

    start (vorpal, name, callback) {
        if (this.neuros[name]) {
            vorpal.log('restarting', name);
            this.neuros[name].child.kill();
        } else {
            vorpal.log('creating', name);
            this.neuros[name] = new Neuro(name);
        }

        let neuro = this.neuros[name],
            params = [ ];

        if (neuro.ui) {
            let codePath = this.sourceImage(neuro),
                sourcePath = path.join( __dirname, '/../../../ui/', codePath);
            params = [ '--', this.prefix + codePath, '--port', neuro.port, '--path', sourcePath ];

        } else {
            params = [ '--', this.prefix + neuro.image ];

        }

        // start server
        vorpal.log('spawning', params.join(' '));
        neuro.child = spawn('babel-node', params);

        // monitor child
        neuro.child.stdout.on('data', data => {
            this.log(name, data.toString('utf8'));
        });
        neuro.child.stderr.on('data', data => {
            this.log(name, 'ERROR', data.toString('utf8'));
            vorpal.log(name, 'ERROR', data.toString('utf8'));
        });
        neuro.child.on('exit', exitCode => {
            this.log(name, 'has exited with code', exitCode);
            vorpal.log(name, 'has exited with code', exitCode);
            this.neuros[name].freePort();
            delete this.neuros[name];
        });

        // set proxy data for this neuro assume barrier is 8888
        this.barrier.set('auth', name, 'localhost:' + neuro.port).commit();

        // finished        
        callback();
    }

    kill (vorpal, name, callback) {
        if (this.neuros[name] === undefined) {
            vorpal.log(name, 'is not running');
            return callback();
        }
        // remove proxy data & kill child process
        this.barrier.remove('auth', name).commit();
        this.neuros[name].child.kill();
        callback();
    }

}

export default StemLocal;
