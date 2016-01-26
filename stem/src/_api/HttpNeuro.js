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
                this.config.update(json.meta);
            }
            finish();
        });
    }

    start () {
        super.start();
        this.fetch();
    }

}

export default HttpNeuro;
