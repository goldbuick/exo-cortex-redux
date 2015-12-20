import PreFlight from './preflight';
import ObjMod from '../_lib/obj-mod';

class PreFlightLocal extends PreFlight {
    checklist () {
        return [
            this.checkRethinkDb.bind(this),
            this.runNeuro('terrace'),
            this.runNeuro('codex'),
            this.runNeuro('facade'),
            this.runNeuro('ui-barrier'),
            this.runNeuro('ui-didact'),
            this.checkBarrier.bind(this),
            this.checkPassword.bind(this)
        ];
    }

    proxyNeuro (name, next) {
        let barrier = this.barrier,
            barrierPort = this.stem.neuroPort('ui-barrier'),
            barrierUrl = 'localhost:' + barrierPort + '/' + name,
            neuroPort = this.stem.neuroPort(name),
            neuroUrl = 'localhost:' + neuroPort;

        barrier.set(['auth', barrierUrl], neuroUrl, () => {
            next(name + ' started & proxied');
        });
    }
}

export default PreFlightLocal;
