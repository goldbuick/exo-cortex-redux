import log from './log';
import r from 'rethinkdb';

function check (err) {
    if (!err) return false;

    log.msg('rethinkdb', 'error', err);
    return true;
}

class RethinkDB {
    constructor (table) {
        this.table = table;
        this.conn = undefined;
        this.db = '_exo_cortex_';
    }

    q () {
        return r.table(this.table);
    }

    run (qobj, callback) {
        qobj.run(this.conn, callback);
    }

    ready (callback) {
        this.onReady = callback;
    }

    check (err) {
        return check(err);
    }

    testConnect (host, port, success, failure) {
        r.connect({
            host: host,
            port: port,
            db: this.db            
        }, (err, conn) => {
            if (check(err)) {
                failure();
            } else {
                success();
            }
        });
    }

    connect (host, port) {
        var self = this;
        this.conn = undefined;

        function createdb (next) {
            r.dbCreate(self.db).run(self.conn, function (err) {
                next();
            });
        }

        function createtable (next) {
            r.tableCreate(self.table).run(self.conn, function (err) {
                next();
            });
        }

        log.msg('rethinkdb', 'connect', host, port, self.db, self.table);
        r.connect({
            host: host,
            port: port,
            db: self.db            
        }, (err, conn) => {
            if (check(err)) return;

            self.conn = conn;
            createdb(() => {
                createtable(() => {
                    log.msg('rethinkdb', 'connected', self.db, self.table);
                    if (self.onReady) self.onReady();
                });
            });

        });
    }
}

export default RethinkDB;
