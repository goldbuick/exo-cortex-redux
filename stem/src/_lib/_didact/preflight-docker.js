import PreFlight from './preflight';

class PreFlightDocker extends PreFlight {
    checklist () {
        return [
            'check docker api connection', // TODO
            'check data volume arg', // TODO
            'start rethinkdb', // TODO
        ];
    }
}

export default PreFlightDocker;
