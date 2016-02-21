import { argv } from 'yargs';
import ObjMod from './ObjMod';
import HttpConfig from './HttpConfig';
import PostMessage from './PostMessage';

// extended service to use codex for configuration

class HttpNeuro extends HttpConfig {

    constructor (name) {
        super(name);

        this.channel('codex').message('update', {
            keys: 'which part of the config store to update',
            value: 'value to change'
        }, (json, finish) => {
            if (json.meta) {
                this.update({
                    keys: [ this.name ],
                    value: json
                });
            }
            finish();
        });

        this.upstream((url, json, finish) => {
            console.log(url, json, finish);
            finish();
        });
    }

    update (json) {
        super.update(json);
        if (this.config().upstream === undefined) return;
        this.find('codex', codex => {
            PostMessage(codex.host, codex.port, 'codex', 'set', {
                keys: [ this.name, 'upstream' ],
                value: ''
            });
        });
    }

}

export default HttpNeuro;
