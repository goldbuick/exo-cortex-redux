import log from '../_lib/log';
import CONFIG from '../_lib/config';
import ObjMod from '../_lib/obj-mod';
import { listen } from '../_lib/gateway';

class CodexAPI {

    constructor (key, onValue) {
        this.key = key;
        this.store = { };
        this.api = listen(CONFIG.PORTS.TERRACE, () => {
            this.api.emit('codex', 'get', { keys: [ this.key ] });
        });
        this.api.message('codex/value', message => {
            let keys = message.meta.keys,
                value = message.meta.value;
            if (keys === undefined || value === undefined ||
                keys[0] !== this.key) return;

            // write update
            ObjMod.set(this.store, keys, value);

            // callback for updated value
            if (onValue) {
                onValue(this.store[this.key]);
            }

            // waiting for the next updated value
            if (this.onCheck) {
                let _check = this.onCheck;
                delete this.onCheck;
                _check(this.store[this.key]);
            }
        });
    }

    check (onCheck) {
        this.onCheck = onCheck;
        this.api.emit('codex', 'get', { keys: [ this.key ] });
    }

    get (keys, onCheck) {
        let _keys = [ this.key ].concat(keys);
        if (onCheck) {
            this.onCheck = onCheck;
            this.api.emit('codex', 'get', { keys: _keys });
        }
        return ObjMod.get(this.store, _keys);
    }

    set (keys, value, onCheck) {
        let _keys = [ this.key ].concat(keys);
        ObjMod.set(this.store, _keys, value);
        if (onCheck) {
            this.onCheck = onCheck;
        }
        this.api.emit('codex', 'set', { keys: _keys, value: value });
    }

}

export default function (key, onValue) {
    return new CodexAPI(key, onValue);
}
