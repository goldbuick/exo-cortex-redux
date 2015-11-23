import log from '../_lib/log';
import CONFIG from '../_lib/config';
import { listen } from '../_lib/gateway';

class CodexAPI {
    constructor (key) {
        var self = this;
        self.key = key;
        self.rules = { };
        self.before = { };
        self.triggers = { };
        self.api = listen(CONFIG.PORTS.TERRACE, () => {
            log.event('codex', 'request', self.key);
            self.api.emit('codex', 'get', { key: self.key });            
        });
        self.api.message('codex/value', message => {
            if (message.meta.key !== key) return;

            log.event('codex', 'received', self.key);
            var json = JSON.parse(JSON.stringify(message.meta.value)),
                changed = self.checkJson(json);

            if (changed) self.api.emit('codex', 'set', { key: key, value: json });
        });
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
        var self = this,
            type = this.typeOf(cursor);

        result[path] = {
            parent: parent,
            key: key,
            value: cursor
        };

        if (type === 'array') {
            cursor.forEach(function (value, index) {
                self.flatten(result, cursor, index, path + '/' + index, value);
            });

        } else if (type === 'object') {
            Object.keys(cursor).forEach(function (key) {
                self.flatten(result, cursor, key, path + '/' + key, cursor[key]);
            });
        }
    }

    checkPatterns (lookup, fn) {
        var patterns = Object.keys(this.rules);

        Object.keys(lookup).forEach(function (path) {
            patterns.forEach(function (pattern) {
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
        var self = this,
            changed = false;

        var lookup = [];
        self.flatten(lookup, undefined, '', '', json);
        self.checkPatterns(lookup, function (path, pattern) {
            try {
                if (self.checkMatch(lookup[path], self.rules[pattern])) {
                    changed = true;
                }

            } catch (e) {
                log.event('codex', 'rule', pattern, e);
            }
        });

        lookup = [];
        self.flatten(lookup, undefined, '', '', json);
        self.checkPatterns(lookup, function (path, pattern) {
            var before;

            if (self.triggers[pattern] !== undefined) {
                try {
                    if (self.before[path] === undefined) {
                        self.triggers[pattern](lookup[path].value, undefined);

                    } else if (self.before[path] !== JSON.stringify(lookup[path].value)) {
                        self.triggers[pattern](lookup[path].value, JSON.parse(self.before[path]));

                    }

                } catch (e) {
                    log.event('codex', 'trigger', pattern, e);
                }
            }
        });

        self.before = { };
        Object.keys(lookup).forEach(function (path) {
            self.before[path] = JSON.stringify(lookup[path].value);
        });

        return changed;
    }

}

export default function (name) {
    return new CodexAPI(name);
}
