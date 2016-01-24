import { argv } from 'yargs';
import HttpService from './_api/HttpService';

let server = new HttpService('vault');
server.ping(() => {
    return { active: true };
});

let host = argv.dev ? '192.168.99.100' : 'rethinkdb';
server.register('rethinkdb', host, 28015, () => {
    server.register('rethinkdb-ui', host, 8080, () => {
        server.ready();
    });
});

server.start();
