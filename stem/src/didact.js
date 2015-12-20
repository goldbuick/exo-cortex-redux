import { argv } from 'yargs';
import log from './_lib/log';
import CONFIG from './_lib/config';
import { client } from './_lib/gateway';
import StemLocal from './_lib/stem-local';
import StemDocker from './_lib/stem-docker';
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
    let didact = client('didact', CONFIG.PORTS.TERRACE);

    didact.message('lib', message => {
        didact.emit('lib', {
            neuros: [
                // core set of neuros
                'codex',
                'facade',
                'terrace',
                'vault',
                // indicates path & port args required
                'ui-didact',
                'ui-barrier',
                'ui-paracord',
                'ui-sensorium'
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
