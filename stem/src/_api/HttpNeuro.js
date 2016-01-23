import { argv } from 'yargs';
import ObjMod from './_api/ObjMod';
import PostMessage from './_api/PostMessage';
import HttpService from './_api/HttpService';

// extended service to use codex for configuration

let typeOf = value => {
    let type = typeof value;
    if (type === 'object') {
        if (Array.isArray(value)) type = 'array';

    } else if (type !== 'undefined') {
        type = 'value';
    }
    return type;
};

let checkMatch = (value, rule) => {
    let type = typeOf(value.value),
        start = JSON.stringify(value.value);

    let changed = false,
        result = rule(type, value.value);

    if (type === 'value') {
        if (result !== undefined) {
            changed = true;
            value.parent[value.key] = result;
        }

    } else {
        if (result !== undefined) {
            changed = true;
            value.parent[value.key] = result;

        } else {
            changed = start !== JSON.stringify(value.value);
        }

    }

    return changed;
};

let flatten = (result, parent, key, path, cursor) => {
    let type = typeOf(cursor);

    result[path] = {
        parent: parent,
        key: key,
        value: cursor
    };

    if (type === 'array') {
        cursor.forEach((value, index) => {
            flatten(result, cursor, index, path + '/' + index, value);
        });

    } else if (type === 'object') {
        Object.keys(cursor).forEach(key => {
            flatten(result, cursor, key, path + '/' + key, cursor[key]);
        });
    }
}

class HttpNeuro extends HttpService {

    constructor (name) {
        super.constructor();
        this.name = name;
        this.store = { };
        this.rules = { };
        this.before = { };
        this.triggers = { };

        // let config = this.channel('codex');
        // config.message('update', {
        //     keys: 'which part of the config store to update',
        //     value: 'value to change'
        // }, (json, finish) => {
        //     let keys = json.meta.keys,
        //         value = json.meta.value;
            
        //     if (keys === undefined || value === undefined ||
        //         keys[0] !== this.name) return finish();

        //     // write update
        //     ObjMod.set(this.store, keys, value);

        //     // run rules
        //     let json = JSON.parse(JSON.stringify(this.store[this.name])),
        //         changed = this.checkJson(json);

        //     if (changed) {
        //         PostMessage(CONFIG.HOSTS.CODEX, CONFIG.PORTS.CODEX, 'codex', 'set', {
        //             keys: [ this.name ],
        //             value: json
        //         });
        //     }

        //     finish();
        // });
    }

    value (pathRegex, rule, trigger) {
        this.rules[pathRegex] = rule;
        this.triggers[pathRegex] = trigger;
    }

    checkPatterns (lookup, fn) {
        var patterns = Object.keys(this.rules);

        Object.keys(lookup).forEach(path => {
            patterns.forEach(pattern => {
                var result = path.match(pattern);
                if (result && result[0].length === path.length) {
                    fn(path, pattern);
                }
            });
        });
    }

    checkJson (json) {
        let changed = false;

        let lookup = [];
        flatten(lookup, undefined, '', '', json);
        this.checkPatterns(lookup, (path, pattern) => {
            try {
                if (checkMatch(lookup[path], this.rules[pattern])) {
                    changed = true;
                }

            } catch (e) {
                console.log('config', 'rule', pattern, e);
            }
        });

        lookup = [];
        flatten(lookup, undefined, '', '', json);
        this.checkPatterns(lookup, (path, pattern) => {
            let before;

            if (this.triggers[pattern] !== undefined) {
                try {
                    if (this.before[path] === undefined) {
                        this.triggers[pattern](lookup[path].value, undefined);

                    } else if (this.before[path] !== JSON.stringify(lookup[path].value)) {
                        this.triggers[pattern](lookup[path].value, JSON.parse(this.before[path]));

                    }

                } catch (e) {
                    console.log('config', 'trigger', pattern, e);
                }
            }
        });

        this.before = { };
        Object.keys(lookup).forEach(path => {
            this.before[path] = JSON.stringify(lookup[path].value);
        });

        return changed;
    }

    start () {
        // super.start(argv.port);
    }

}

export default HttpNeuro;
