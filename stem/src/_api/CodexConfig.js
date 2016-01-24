import ObjMod from './ObjMod';
import PostMessage from './PostMessage';

// use codex for applicaiton configuration

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

class CodexConfig {
    constructor (name) {
        this.name = name;
        this.store = { };
        this.rules = { };
        this.before = { };
        this.triggers = { };
    }

    update (json) {
        let keys = json.keys,
            value = json.value;
        
        if (keys === undefined ||
            value === undefined ||
            keys[0] !== this.name) return;

        // write update
        ObjMod.set(this.store, keys, value);

        // run rules
        let config = JSON.parse(JSON.stringify(this.store[this.name])),
            changed = this.checkJson(config);

        if (changed) {
            this.find('codex', codex => {
                PostMessage(codex.host, codex.port, 'codex', 'set', {
                    keys: [ this.name ],
                    value: config
                });
            });
        }
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

}

export default CodexConfig;
