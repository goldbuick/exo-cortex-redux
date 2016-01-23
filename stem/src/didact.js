import { argv } from 'yargs';
import CONFIG from './_api/CONFIG';
import HttpApi from './_api/HttpApi';

let gport = 7154,
    gservices = { };

// didact --dev    [this will send --didact as localhost:7154]
// didact --docker [this will send --didact as didact:7154]

// common arg --rethinkdb [host:port] <= this will add the rethinkdb service address

// export default {
//     HOSTS: {
//         DIDACT: 'didact'
//     },
//     PORTS: {
//         DIDACT: 7154,
//         NEUROS: 9000,
//         BARRIER: 8888,
//         RETHINKDB: 28015,
//         RETHINKDB_UI: 8080
//     }
// };

/*
Need to figure out a way to lookup service host & port
--didact [host:port] --rethinkdb [host:port] --port [port]
*/

let server = new HttpApi(),
    channel = server.channel('didact');

channel.message('ping', {
    service: 'name of service that is pinging'
}, (message, finish) => {
    finish();
});

channel.message('log', {
    service: 'name of service this log is for',
    data: 'generic json data to log'
}, (message, finish) => {
    finish();
});

channel.message('list', {
}, (message, finish) => {
    finish();
});

channel.message('add', {
    service: 'name of service image to spin up'
}, (message, finish) => {
    finish();
});

channel.message('remove', {
    service: 'name of service to stop & remove'
}, (message, finish) => {
    finish();
});

channel.message('restart', {
    service: 'name of service to restart'
}, (message, finish) => {
    finish();
});

channel.message('find', {
    service: 'name of service to find address:port on',
}, (message, finish) => {
    let service = gservices[message.meta.service || ''] || { };
    finish({
        host: service.host || '',
        port: service.port || ''
    });
});

server.start(gport);

/*
I want to boil didact down to a simple process manager
that can collect logs from the processes it runs.

dev mode is without docker
release mode is with docker containers

in order to be run by didact you have to run a nuero client
which allows you to dump logs to didact and signal didact you're ready & alive
*/
