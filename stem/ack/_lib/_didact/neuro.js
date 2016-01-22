import CONFIG from '../../_api/_config';

class PortManager {
    constructor () {
        this.ports = { };
        let begin = CONFIG.PORTS.BASE_NEURO,
            end = begin + 1000;
        for (let p=begin; p<end; ++p) {
            this.ports[p] = false;
        }
    }

    find () {
        let begin = CONFIG.PORTS.BASE_NEURO,
            end = begin + 1000;
        for (let p=begin; p<end; ++p) {
            if (this.ports[p] === false) {
                this.ports[p] = true;
                return p;
            }
        }
        return 9999;
    }

    free (port) {
        if (this.ports[port] === undefined) return;
        this.ports[port] = false;
    }
}

let portManager = new PortManager();

class Neuro {
    constructor (name) {
        this.name = name;
        let config = name.split('-');
        if (config[0] === 'ui' && config.length > 1) {
            this.ui = true;
            this.image = config[1];
        } else {
            this.ui = false;
            this.image = name;
        }
        this.port = this.findPort(this.image);
    }

    findPort (image) {
        switch (image) {
            case 'facade': return CONFIG.PORTS.FACADE;
            case 'barrier': return CONFIG.PORTS.BARRIER;
            case 'terrace': return CONFIG.PORTS.TERRACE;
        }
        return portManager.find();
    }

    freePort () {
        portManager.find(this.port);
    }
}

export default Neuro;
