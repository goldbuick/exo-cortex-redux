
class DidactRun {

    constructor () {
        this.prefix = 'src/';
    }

    lib () {
        return [
            'barrier',
            'codex',
            'facade',
            'tableu',
            'terrace',
            'vault'
        ];
    }

    kind () {
        return 'undefined';
    }

    boot (vorpal, callback) {
        callback();
    }

    running (callback) {
        callback([]);
    }

    start (vorpal, name, codepath, args, callback) {
        callback();
    }

    kill (vorpal, name, callback) {
        callback();
    }

    check (vorpal, name) {

    }

}

export default DidactRun;
