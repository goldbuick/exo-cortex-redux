import { argv } from 'yargs';
import HttpNeuro from './_api/HttpNeuro';

let server = new HttpNeuro('test');
server.ping(() => {
    return { active: true };
});

server.start();
