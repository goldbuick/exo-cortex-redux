import PreFlight from './preflight';

class PreFlightLocal extends PreFlight {
    checklist () {
        return [
            'check RethinkDb connection', this.checkRethinkDb.bind(this),
            'start terrace', this.runNeuro('terrace'),
            'start codex', this.runNeuro('codex'),
            'check barrier proxy domain', this.checkDomain.bind(this),
            'start facade', this.runNeuro('facade'),
            'start barrier', this.runNeuro('ui-barrier'),
            'display barrier config', this.checkBarrier.bind(this),
            'check barrier password', this.checkPassword.bind(this),
            'start didact ui', this.runNeuro('ui-didact'),
        ];
    }
}

export default PreFlightLocal;
