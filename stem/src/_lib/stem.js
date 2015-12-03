class Stem {
    constructor () {
        this.logs = { };
        this.neuros = { };
        this.prefix = 'src/';
    }

    _log (name, args) {
        if (this.logs[name] === undefined) {
            this.logs[name] = [ ];
        }

        this.logs[name].unshift(args.join(' '));
        if (this.logs[name].length > 100) {
            this.logs[name].pop();
        }
    }

    log () {
        let args = Array.prototype.slice.call(arguments),
            name = args.shift();
        this._log(name, args);
    }

    gaze (vorpal, name, callback) {
        var list = this.logs[name] || [ ];
        vorpal.log(list);
        callback();
    }

    lib () {
        return [
            // core set of neuros
            'codex',
            'facade',
            'tableu',
            'terrace',
            'vault',
            // indicates path & port args required
            'ui-barrier',
            'ui-sensorium'
        ];
    }

    kind () {
        return 'undefined';
    }

    boot (vorpal, callback) {
        let self = this,
            list = [ 'terrace', 'codex', 'ui-barrier' ];

        let _list = list.join(', ');
        function next() {
            if (list.length === 0) {
                callback(_list);
                return;
            }
            let name = list.pop();
            self.start(vorpal, name, next);
        }

        next();
    }

    running (callback) {
        callback(Object.keys(this.neuros));
    }

    sourceImage (neuro) {
        return neuro.image;
    }

    start (vorpal, name, callback) {
        callback();
    }

    kill (name, callback) {
        callback();
    }

    check (name) {

    }    
}

export default Stem;
