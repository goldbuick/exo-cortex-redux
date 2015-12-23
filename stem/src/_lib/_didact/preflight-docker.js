import PreFlight from './preflight';

class PreFlightDocker extends PreFlight {
    checklist () {
        return [
            this.checkDataVolume.bind(this),
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

    checkDataVolume (next) {
    }
}

export default PreFlightDocker;
