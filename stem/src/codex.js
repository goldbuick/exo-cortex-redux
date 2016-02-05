import { argv } from 'yargs';
import ObjMod from './_api/ObjMod';
import Debounce from './_api/Debounce';
import RethinkDb from './_api/RethinkDb';
import HttpService from './_api/HttpService';
import PostMessage from './_api/PostMessage';

// simple key / value store api

let server = new HttpService('codex');
server.find('rethinkdb', rethinkdb => {
    server.ping(() => {
        return { active: true };
    });

    let gstore = { },
        gchanged = { },
        db = new RethinkDb('codex');

    let writeValue = key => {
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
            // console.log('codex', 'wrote', JSON.stringify(json));
        });

        // signal value change to neuro
        server.find(key, neuro => {
            PostMessage(neuro.host, neuro.port, 'codex', 'update', {
                keys: [ key ],
                value: gstore[key]
            });
        });
    };

    let writeChangedValues = Debounce(() => {
        Object.keys(gchanged).forEach(writeValue);
        gchanged = { };
    }, 1000);

    db.ready(() => {
        // query for config values
        db.run(db.q(), (err, cursor) => {
            if (db.check(err)) return;

            cursor.each((err, record) => {
                if (db.check(err)) return;
                if (record.value === undefined) return;

                gstore[record.id] = record.value;
                // console.log('codex', 'read', record.id, JSON.stringify(record.value));

            }, () => {
                // console.log('codex', 'finished reading');
                server.ready();
            });
        });  
    });

    db.connect(rethinkdb.host, rethinkdb.port);

    let channel = server.channel('codex');
    channel.message('set', {
        keys: 'key path to fetch',
        value: 'what value to set the key path to'
    }, (json, finish) => {
        let keys = json.meta.keys,
            value = json.meta.value;
        if (keys === undefined || value === undefined) return;

        ObjMod.set(gstore, keys, value);
        finish({ keys: keys, value: value });

        gchanged[keys[0]] = true;
        writeChangedValues();
    });

    channel.message('get', {
        keys: 'key path to fetch'
    }, (json, finish) => {
        let keys = json.meta.keys;
        if (keys === undefined) return finish();
        let value = ObjMod.get(gstore, keys);
        finish(value);      
    });

    server.start();
});
