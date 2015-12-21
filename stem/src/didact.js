import { argv } from 'yargs';
import log from './_lib/log';
import CONFIG from './_lib/config';
import { GatewayClient } from './_lib/gateway';
import StemLocal from './_lib/stem-local';
import StemDocker from './_lib/stem-docker';
import CodexClient from './_api/codex-client';
import PreFlightLocal from './_lib/preflight-local';
import PreFlightDocker from './_lib/preflight-docker';

let isLocal = (argv.docker === undefined);

let stem;
if (isLocal) {
    stem = new StemLocal();
} else {
    stem = new StemDocker();
}

let preflight;
if (isLocal) {
    preflight = new PreFlightLocal();
} else {
    preflight = new PreFlightDocker();
}

preflight.ready(stem, () => {
    let store = CodexClient('didact'),
        didact = GatewayClient('didact', CONFIG.PORTS.TERRACE);

    store.value('', (type, value) => {
        if (value.neuros === undefined) {
            value.neuros = [ ];
        }
    }, value => {
        console.log('didact config', value);
    });

    didact.message('lib', message => {
        didact.emit('lib', {
            neuros: [
                // core set of neuros
                'codex',
                'facade',
                'terrace',
                'vault',
                'ui-didact',
                'ui-barrier',
            ]
        });  
    });

    didact.message('running', message => {
        stem.running(list => {
            didact.emit('running', { neuros: list });  
        });
    });

    didact.message('start', message => {
        let name = message.meta.name;
        if (name === undefined) return;
        stem.start(name, result => {
            didact.emit('started', result);
        });
    });

    didact.message('kill', message => {
        let name = message.meta.name;
        if (name === undefined) return;
        stem.kill(name, result => {
            didact.emit('started', result);
        });
    });

    didact.message('gaze', message => {
        let name = message.meta.name;
        if (name === undefined) return;
        stem.gaze(name, result => {
            didact.emit('gaze', {
                neuro: name,
                logs: result
            });
        });
    });
});
