import { argv } from 'yargs';
import HttpApi from './_api/HttpApi';
import RunDev from './_didact/RunDev';
import RunDocker from './_didact/RunDocker';
import Preflight from './_didact/Preflight';

let ghost = argv.dev ? 'localhost' : 'didact',
    gport = 7154,
    glogs = { },
    gaddress = { },
    gservices = { };

let grun;
if (argv.dev) {
    grun = new RunDev(ghost, gport);
} else {
    grun = new RunDocker(ghost, gport);
}

let server = new HttpApi(),
    channel = server.channel('didact');

// messages for neuros 

channel.message('ping', {
    service: 'name of service that is pinging'
}, (json, finish) => {
    if (json.meta && json.meta.service) {
        grun.ping(json.meta.service, json.meta);
    }
    finish();
});

channel.message('log', {
    service: 'name of service this log is for',
    data: 'generic json data to log'
}, (json, finish) => {
    finish();
});

channel.message('register', {
    service: 'name of service address to register',
    host: 'host name of the address',
    port: 'port of the address'
}, (json, finish) => {
    if (json.meta && json.meta.service) {
        gaddress[json.meta.service] = {
            service: json.meta.service,
            host: json.meta.host,
            port: json.meta.port
        };
    }
    finish();
    // console.log(gaddress);
});

channel.message('find', {
    service: 'name of service to find address:port on',
}, (json, finish) => {
    if (json.meta && json.meta.service) {
        return finish(gaddress[json.meta.service || ''] || { });
    }
    finish();
});

// messages for service management

channel.message('list', {
}, (json, finish) => {
    grun.list(finish);
});

channel.message('add', {
    service: 'name of service image to spin up'
}, (json, finish) => {
    if (json.meta && json.meta.service) {
        let port = grun.add(json.meta.service, finish);
        gaddress[json.meta.service] = {
            service: json.meta.service,
            host: argv.dev ? 'localhost' : json.meta.service,
            port: port
        };
    } else {
        finish();
    }
    // console.log(gaddress);
});

channel.message('remove', {
    service: 'name of service to stop & remove'
}, (json, finish) => {
    if (json.meta && json.meta.service) {
        return grun.remove(json.meta.service, finish);
    }
    finish();
});

channel.message('restart', {
    service: 'name of service to restart'
}, (json, finish) => {
    if (json.meta && json.meta.service) {
        return grun.restart(json.meta.service, finish);
    }
    finish();
});

server.start(gport);

let preflight = new Preflight(ghost, gport);
preflight.ready(() => console.log('exo-cortex is READY!'));

