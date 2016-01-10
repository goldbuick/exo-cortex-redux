import { argv } from 'yargs';
import log from './_lib/_util/log';
import CodexClient from './_api/codex-client';
import StemLocal from './_lib/_didact/stem-local';
import StemDocker from './_lib/_didact/stem-docker';
import TerraceClient from './_api/terrace-client';
import PreFlightLocal from './_lib/_didact/preflight-local';
import PreFlightDocker from './_lib/_didact/preflight-docker';

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

/*
still need a way to have a neuro health check??
*/

preflight.ready(stem, () => {
    let store = CodexClient('didact'),
        didact = TerraceClient('didact');

    store.value('', (type, value) => {
        if (value.neuros === undefined) {
            value.neuros = [ ];
        }
    }, value => {
        log.server('didact', 'config', value);
    });

    didact.message('neuros', message => {
        stem.running(list => {
            didact.reply('neuros', { neuros: list });  
        });
    });

    didact.message('start', message => {
        let name = message.meta.name;
        if (name === undefined) return;
        stem.start(name, result => {
            didact.reply('start', result);
        });
    });

    didact.message('kill', message => {
        let name = message.meta.name;
        if (name === undefined) return;
        stem.kill(name, result => {
            didact.reply('kill', result);
        });
    });

    didact.message('gaze', message => {
        let name = message.meta.name;
        if (name === undefined) return;
        stem.gaze(name, result => {
            didact.reply('gaze', {
                neuro: name,
                logs: result
            });
        });
    });
});
