import path from 'path';
import Run from './Run';
import { argv } from 'yargs';
import { spawn } from 'child_process';

class RunDev extends Run {

    constructor (host, port) {
        super();
        this.didact = host + ':' + port;
    }

    nodeScript (image) {
        switch (image) {
            case 'barrier': return image;
        }
        return 'tableau';
    }

    ping (name, data) {
        if (this.services[name] === undefined ||
            this.services[name].success === undefined) return;

        this.services[name].success(name + ' is ready');
        delete this.services[name].success;
    }

    add (name, success, fail) {
        if (this.services[name]) return success();

        let ui = this.ui(name),
            image = this.image(name),
            service = { port: this.findPort(image) };

        let params = [ ];
        if (this.ui(name)) {
            params.push('lib/' + this.nodeScript(image));
            params.push('--service');
            params.push(name);
            params.push('--path');
            params.push(path.join(__dirname, '/../../../ui/', image));

        } else {
            params.push('lib/' + image);
        }

        params.push('--port');
        params.push(service.port);

        params.push('--didact');
        params.push(this.didact);

        if (argv.dev) params.push('--dev');
        if (argv.docker) params.push('--docker');

        // so we can wait for legit ready signal
        service.success = success;

        // start child
        service.child = spawn('node', params);

        // monitor child
        service.child.stdout.on('data', data => {
            let _data = data.toString('utf8');
            console.log(name, _data);
        });
        service.child.stderr.on('data', data => {
            let _data = data.toString('utf8');
            console.log(name, 'ERROR', _data);
        });
        service.child.on('exit', exitCode => {
            console.log(name, 'has exited with code', exitCode);
            this.releasePort(this.services[name].port);
            delete this.services[name];
        });

        // track so we can kill it later
        this.services[name] = service;

        // let didact know which port 
        return service.port;
    }

    remove (name, success, fail) {
        if (this.services[name] === undefined) return success();

    }

    restart (name, success, fail) {
        if (this.services[name] === undefined) return success();

    }

}

export default RunDev;
