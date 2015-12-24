import log from '../_lib/_util/log';
import ObjMod from '../_lib/_util/obj-mod';
import TerraceListen from './terrace-listen';
import makeMessage from '../_lib/_util/message';

function _sub (channel, type) {
    return [channel, type].join('/');
}

class CodexClient {

    constructor (channel) {
        this.channel = channel;
        this.store = { };
        this.rules = { };
        this.before = { };
        this.triggers = { };
        this.api = TerraceListen();
        this.api.connect(() => {
            this.api.emit('codex', 'get', { keys: [ this.channel ] });
        });
        this.api.message('codex/value', message => {
            let keys = message.meta.keys,
                value = message.meta.value;
            if (keys === undefined || value === undefined ||
                keys[0] !== this.channel) return;

            // write update
            ObjMod.set(this.store, keys, value);

            // run rules
            let json = JSON.parse(JSON.stringify(this.store[this.channel])),
                changed = this.checkJson(json);

            // signal update value
            if (changed) {
                this.api.emit('codex', 'set', { keys: [ this.channel ], value: json });
            }

            // update upstream target 
            if (typeof json.upstream === 'string') {
                this.target = json.upstream;
            }
        });
        this.api.watch(this.channel, message => {
            if (this.target) {
                let _message = message;
                if (this.onUpstream) _message = this.onUpstream(message) || message;
                _message.upstream = this.target;
                this.api.upstream(_message);
            }
        });
    }

    upstream (handler) {
        this.onUpstream = handler;
    }

    emit (type, data) {
        if (this.target) {
            let _message = makeMessage(this.channel, type, data);
            _message.upstream = this.target;
            this.api.upstream(_message);
        }
    }

    value (pathRegex, rule, trigger) {
        this.rules[pathRegex] = rule;
        this.triggers[pathRegex] = trigger;
    }

    typeOf (value) {
        var type = typeof value;
        if (type === 'object') {
            if (Array.isArray(value)) type = 'array';

        } else if (type !== 'undefined') {
            type = 'value';
        }
        return type;
    }

    flatten (result, parent, key, path, cursor) {
        var type = this.typeOf(cursor);

        result[path] = {
            parent: parent,
            key: key,
            value: cursor
        };

        if (type === 'array') {
            cursor.forEach((value, index) => {
                this.flatten(result, cursor, index, path + '/' + index, value);
            });

        } else if (type === 'object') {
            Object.keys(cursor).forEach(key => {
                this.flatten(result, cursor, key, path + '/' + key, cursor[key]);
            });
        }
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

    checkMatch (value, rule) {
        var type = this.typeOf(value.value),
            start = JSON.stringify(value.value);

        var changed = false,
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
    }

    checkJson (json) {
        var changed = false;

        var lookup = [];
        this.flatten(lookup, undefined, '', '', json);
        this.checkPatterns(lookup, (path, pattern) => {
            try {
                if (this.checkMatch(lookup[path], this.rules[pattern])) {
                    changed = true;
                }

            } catch (e) {
                log.event('codex', 'rule', pattern, e);
            }
        });

        lookup = [];
        this.flatten(lookup, undefined, '', '', json);
        this.checkPatterns(lookup, (path, pattern) => {
            var before;

            if (this.triggers[pattern] !== undefined) {
                try {
                    if (this.before[path] === undefined) {
                        this.triggers[pattern](lookup[path].value, undefined);

                    } else if (this.before[path] !== JSON.stringify(lookup[path].value)) {
                        this.triggers[pattern](lookup[path].value, JSON.parse(this.before[path]));

                    }

                } catch (e) {
                    log.event('codex', 'trigger', pattern, e);
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

export default function (channel) {
    return new CodexClient(channel);
}
