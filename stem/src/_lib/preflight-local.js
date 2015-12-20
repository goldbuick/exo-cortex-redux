import PreFlight from './preflight';
import ObjMod from '../_lib/obj-mod';

class PreFlightLocal extends PreFlight {
    checklist () {
        return [
            this.checkRethinkDb.bind(this),
            this.runNeuro('terrace'),
            this.runNeuro('codex'),
            this.runNeuro('facade'),
            this.checkDomain.bind(this),
            this.runNeuro('ui-barrier'),
            this.checkBarrier.bind(this),
            this.checkPassword.bind(this),
            this.runNeuro('ui-didact'),
            this.runNeuro('ui-sensorium'),
        ];
    }
}

export default PreFlightLocal;
