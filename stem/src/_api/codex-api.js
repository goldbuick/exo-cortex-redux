import log from '../_lib/log';
import CONFIG from '../_lib/config';
import { listen } from '../_lib/gateway';

class CodexAPI {

    constructor (key, handler) {
        this.key = key;
        this.value = { };
        this.handler = handler;
        this.api = listen(CONFIG.PORTS.TERRACE, () => {
            this.api.emit('codex', 'get', { key: this.key });            
        });
        this.api.message('codex/value', message => {
            if (message.meta.key !== key) return;
            this.value = message.meta.value;
            if (this.handler) this.handler(this.value);
        });
    }

    fetch (keys) {
        let prevObj,
            lastKey,
            currentObj = this.value;

        while (keys.length && currentObj) {
            lastKey = keys.shift();
            prevObj = currentObj;
            if (currentObj[lastKey] === undefined) {
                currentObj[lastKey] = { };
            }
            currentObj = currentObj[lastKey];
        }

        return {
            get: function () {
                return prevObj[lastKey];
            },
            set: function (value) {
                prevObj[lastKey] = value;
                return prevObj[lastKey];
            },
            push: function (value) {
                prevObj[lastKey].push(value);
                return prevObj[lastKey];
            },
            remove: function () {
                if (!Array.isArray(prevObj)) {
                    delete prevObj[lastKey];
                } else {
                    prevObj.slice(lastKey, lastKey);
                }
            }
        };
    }

    get () {
        let keys = Array.isArray(arguments[0])
            ? arguments[0] : Array.prototype.slice.call(arguments);
        let cursor = this.fetch(keys);
        return cursor.get();
    }

    set () {
        let keys = Array.isArray(arguments[0])
            ? arguments[0] : Array.prototype.slice.call(arguments),
            value = keys.pop();
        let cursor = this.fetch(keys);
        cursor.set(value);
        return this;
    }

    push () {
        let keys = Array.isArray(arguments[0])
            ? arguments[0] : Array.prototype.slice.call(arguments),
            value = keys.pop();
        let cursor = this.fetch(keys);
        cursor.push(value);
        return this;
    }

    remove () {
        let keys = Array.isArray(arguments[0])
            ? arguments[0] : Array.prototype.slice.call(arguments);
        let cursor = this.fetch(keys);
        cursor.remove();
        return this;
    }

    commit () {
        this.api.emit('codex', 'set', { key: this.key, value: this.value });        
    }
    
}

export default function (key, handler) {
    return new CodexAPI(key, handler);
}
