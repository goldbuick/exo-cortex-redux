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
        let config = name.split('-');
        if (config[0] === 'ui' && config.length > 1) {
            this.port = this.findPort(config[1]);
            this.image = this.sourceImage(true, config[1]);
        } else {
            this.image = this.sourceImage(true, name);
        }
        console.log(this);
    }

    findPort (name) {
        if (image === 'barrier') return 8888;
        return portManager.find();
    }
}

class NeuroLocal extends Neuro {
    sourceImage (ui, name) {
        if (ui === false || image === 'barrier') return name;
        return 'tableau';
    }
}

class NeuroDocker extends Neuro {
    sourceImage (ui, name) {
        if (ui) return 'neuro-ui' + name;
        return 'neuro-' + name;
    }
}
