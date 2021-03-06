import ApiClient from '../_api/ApiClient';

class Run extends ApiClient {

    constructor (host, port) {
        super(host, port);

        this.services = { };

        this.PORTS = {
            FACADE: 7156,
            NEURO: 7200,
            BARRIER: 7777
        };

        this.slots = { };
        let begin = this.PORTS.NEURO,
            end = begin + 1000;
        for (let p=begin; p<end; ++p) {
            this.slots[p] = false;
        }
    }

    findPort (image) {
        switch (image) {
            case 'facade': return this.PORTS.FACADE;
            case 'barrier': return this.PORTS.BARRIER;
        }

        let begin = this.PORTS.NEURO,
            end = begin + 1000;
        for (let p=begin; p<end; ++p) {
            if (this.slots[p] === false) {
                this.slots[p] = true;
                return p;
            }
        }

        return 9999;
    }

    releasePort (port) {
        this.slots[port] = false;
    }

    image (name) {
        let config = name.split('-');
        if (config[0] === 'ui' && config.length > 1) {
            return config[1];
        }
        return name;
    }

    ui (name) {
        let config = name.split('-');
        return (config[0] === 'ui' && config.length > 1);
    }

    list (success) {
        success({ services: Object.keys(this.services) });
    }

    proxyPub (name, success, fail) {
        this.address(name, address => {
            this.emit('codex', 'get', {
                keys: [ 'ui-barrier' ]
            }, json => {
                let barrierUrl = this.image(name) + '.' + json.value.domain,
                    serviceUrl = address.host + ':' + address.port;
                this.emit('codex', 'set', {
                    keys: [ 'ui-barrier', 'pub', barrierUrl ],
                    value: serviceUrl
                }, success);
            });
        }, fail);
    }

    proxyAuth (name, success, fail) {
        this.findAddress(name, address => {
            this.emit('codex', 'get', {
                keys: [ 'ui-barrier' ]
            }, json => {
                let barrierUrl = this.image(name) + '.' + json.value.domain,
                    serviceUrl = address.host + ':' + address.port;
                this.emit('codex', 'set', {
                    keys: [ 'ui-barrier', 'auth', barrierUrl ],
                    value: serviceUrl
                }, success);
            });
        }, fail);
    }

    findAddress (name, success, fail) {
    }

    ping (name, data) {
    }

    add (name, success, fail) {
    }

    remove (name, success, fail) {
    }

    restart (name, success, fail) {
    }

}

export default Run;
