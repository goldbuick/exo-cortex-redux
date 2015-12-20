import log from './_lib/log';
import CONFIG from './_lib/config';
import ObjMod from './_lib/obj-mod';
import debounce from './_lib/debounce';
import { client } from './_lib/gateway';
import RethinkDB from './_lib/rethinkdb';

let gstore = { },
    gchanged = { },
    db = new RethinkDB('codex'),
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
            log.msg('codex', 'read', record.id, JSON.stringify(record.value));

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

    json = JSON.parse(JSON.stringify(json));

    // insert value
    db.run(db.q().insert(
        json,
        { conflict: 'replace' }
    ), function (err) {
        if (db.check(err)) return;
        log.msg('codex', 'wrote', JSON.stringify(json));
    });
}

let writeChangedValues = debounce(() => {
    Object.keys(gchanged).forEach(writeValue);
    gchanged = { };
}, 1000);

// MESSAGE HANDLERS

codex.message('get', message => {
    log.msg('codex', 'get', message);
    let keys = message.meta.keys;
    if (keys === undefined) return;

    let value = ObjMod.get(gstore, keys);
    codex.emit('value', { keys: keys, value: value });
});

codex.message('set', message => {
    log.msg('codex', 'set', message);
    let keys = message.meta.keys,
        value = message.meta.value;
    if (keys === undefined || value === undefined) return;

    ObjMod.set(gstore, keys, value);
    codex.emit('value', { keys: keys, value: value });

    gchanged[keys[0]] = true;
    writeChangedValues();
});
