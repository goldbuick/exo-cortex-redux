class NeuroContext {

    constructor() {
        // find a port
    }

    /*
    a ui mode context manages putting entries
    into barrier reverse proxy
    */

}

class DidactRun {

    constructor () {
        this.logs = { };
        this.prefix = 'src/';
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
    }

    gaze (vorpal, name, callback) {
        var list = this.logs[name] || [ ];
        list.forEach(line => vorpal.log(line));
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

    setup (vorpal) {
        let self = this,
            list = [ 'terrace', 'codex', 'ui-barrier' ];

        let _list = list.join(', ');
        function next() {
            if (list.length === 0) {
                vorpal.log('finished setup of', _list);
                return;
            }
            let name = list.pop();
            self.start(vorpal, name, next);
        }

        next();
    }

    boot (callback) {
        callback();
    }

    running (callback) {
        callback([]);
    }

    start (vorpal, name, callback) {
        callback();
    }

    kill (vorpal, name, callback) {
        callback();
    }

    check (vorpal, name) {

    }

}

export default DidactRun;
