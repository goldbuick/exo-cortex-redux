import path from 'path';
import Stem from './stem';
import Neuro from './neuro';
import { spawn } from 'child_process';

class StemLocal extends Stem {

    sourceImage (neuro) {
        if (neuro.ui === false || neuro.image === 'barrier') return neuro.image;
        return 'tableau';
    }

    start (name, callback) {
        if (this.neuros[name]) {
            this.log(name, 'restarting');
            this.neuros[name].child.kill();
        } else {
            this.log(name, 'creating');
            this.neuros[name] = new Neuro(name);
        }

        let neuro = this.neuros[name],
            params = [ ];

        if (neuro.ui) {
            let codePath = this.sourceImage(neuro),
                sourcePath = path.join(__dirname, '/../../../../ui/', neuro.image);
            params = [ 'src/' + codePath, '--port', neuro.port, '--path', sourcePath ];

        } else {
            params = [ 'src/' + neuro.image ];

        }

        // start server
        this.log(name, 'spawning', params.join(' '));
        neuro.child = spawn('babel-node', params);

        // monitor child
        neuro.child.stdout.on('data', data => {
            this.log(name, data.toString('utf8'));
        });
        neuro.child.stderr.on('data', data => {
            this.log(name, 'ERROR', data.toString('utf8'));
        });
        neuro.child.on('exit', exitCode => {
            this.log(name, 'has exited with code', exitCode);
            this.neuros[name].freePort();
            delete this.neuros[name];
        });

        // finished        
        callback({ neuro: name });
    }

    kill (name, callback) {
        if (this.neuros[name] === undefined) {
            this.log(name, 'is not running');
            return callback();
        }
        this.neuros[name].child.kill();
        callback({ neuro: name });
    }

}

export default StemLocal;
