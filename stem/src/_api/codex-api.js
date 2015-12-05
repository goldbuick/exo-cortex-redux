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

    update (key, json) {
        this.value[key] = json;
        this.api.emit('codex', 'set', { key: this.key, value: this.value });
    }
    
}

export default function (key, handler) {
    return new CodexAPI(key, handler);
}
