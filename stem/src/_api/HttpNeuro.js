import { argv } from 'yargs';
import ObjMod from './ObjMod';
import PostMessage from './PostMessage';
import HttpService from './HttpService';
import CodexConfig from './CodexConfig';

// extended service to use codex for configuration

class HttpNeuro extends HttpService {

    constructor (name) {
        super(name);
        this.config = new CodexConfig(name);
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

    value (pathRegex, rule, trigger) {
        this.config.value(pathRegex, rule, trigger);
    }

}

export default HttpNeuro;
