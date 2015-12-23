import PreFlight from './preflight';

class PreFlightLocal extends PreFlight {
    checklist () {
        return [
            this.checkRethinkDb.bind(this),
            this.runNeuro('terrace'),
            this.runNeuro('codex'),
            this.checkDomain.bind(this),
            this.runNeuro('facade'),
            this.runNeuro('ui-barrier'),
            this.checkBarrier.bind(this),
            this.checkPassword.bind(this),
            this.runNeuro('ui-didact'),
        ];
    }
}

export default PreFlightLocal;
