class PortManager {
    constructor () {
        this.ports = { };
        for (let p=7000; p<8000; ++p) {
            this.ports[p] = false;
        }
    }

    find () {
        for (let p=7200; p<8000; ++p) {
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
            this.port = this.findPort(config[1]);
            this.image = config[1];
        } else {
            this.ui = false;
            this.image = name;
        }
    }

    findPort (image) {
        if (image === 'barrier') return 8888;
        return portManager.find();
    }

    freePort () {
        portManager.find(this.port);
    }
}

export default Neuro;
