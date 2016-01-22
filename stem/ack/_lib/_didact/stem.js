import { argv } from 'yargs';
let isDebug = (argv.debug !== undefined);

class Stem {

    constructor () {
        this.logs = { };
        this.neuros = { };
    }

    sourceImage (neuro) {
        return neuro.image;
    }

    log () {
        let args = Array.prototype.slice.call(arguments),
            name = args.shift();

        if (this.logs[name] === undefined) {
            this.logs[name] = [ ];
        }

        this.logs[name].unshift(args.join(' '));
        if (this.logs[name].length > 100) {
            this.logs[name].pop();
        }

        if (isDebug) {
            args.unshift('--------' + name);
            console.log.apply(console, args);
        }
    }

    start (name, callback) {
        callback();
    }

    kill (name, callback) {
        callback();
    }

    running (callback) {
        callback(Object.keys(this.neuros));
    }

    gaze (name, callback) {
        var list = this.logs[name] || [ ];
        callback(list);
    }

    neuro (name) {
        if (this.neuros[name]) {
            return this.neuros[name];
        }
    }
    
}

export default Stem;