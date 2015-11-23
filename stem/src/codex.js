import log from './_lib/log';
import CONFIG from './_lib/config';
import { client } from './_lib/gateway';
import Rethinkdb from './_lib/rethinkdb';

let gstore = { },
    db = new Rethinkdb('codex'),
    codex = client('codex', CONFIG.PORTS.TERRACE);

// STORAGE

db.ready(function () {
    // query for config values
    db.run(db.q(), function (err, cursor) {
        if (db.check(err)) return;

        cursor.each(function (err, record) {
            if (db.check(err)) return;
            if (record.value === undefined) return;

            gstore[record.id] = record.value;
            log.msg('codex', 'read', record.id);

        }, function () {
            log.msg('codex', 'finished reading');
        });
    });  
});

db.connect(CONFIG.HOSTS.VAULT, CONFIG.PORTS.VAULT);

function writeValue (key) {
    var json = {
        id: key,
        value: gstore[key]
    };

    // clean json, I don't know what I am doing!?
    json = JSON.parse(JSON.stringify(json));

    // insert value
    db.run(db.q().insert(
        json,
        { conflict: 'replace' }
    ), function (err) {
        if (db.check(err)) return;
        log.msg('codex', 'wrote', JSON.stringify(json));
    });

    signalValue(key);
}

function signalValue (key) {
    codex.emit('value', { key: key, value: gstore[key] });
}

// MESSAGE HANDLERS

codex.message('get', message => {
    log.msg('codex', 'get', message);
    let key = message.meta.key;
    if (gstore[key] === undefined) gstore[key] = { };
    signalValue(key);
});

codex.message('set', message => {
    log.msg('codex', 'set', message);
    let key = message.meta.key,
        value = message.meta.value;
    if (key === undefined || value === undefined) return;

    gstore[key] = value;
    writeValue(key);
});
