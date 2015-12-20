import PreFlight from './preflight';

class PreFlightDocker extends PreFlight {
    checklist () {
        return [
            this.checkDataVolume.bind(this),
            this.checkRethinkDb.bind(this),
            this.runNeuro('terrace'),
            this.runNeuro('codex'),
            this.runNeuro('facade'),
            this.runNeuro('ui-barrier'),
            this.runNeuro('ui-didact'),
            this.checkDomain.bind(this),
            this.checkPassword.bind(this)
        ];
    }

    checkDataVolume (next) {
    }

    checkDomain (next) {
    }
}

export default PreFlightDocker;
