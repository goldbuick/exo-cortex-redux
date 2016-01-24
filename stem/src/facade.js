import HttpService from './_api/HttpService';

let server = new HttpService('facade');

server.ping(() => {
    return { active: true };
});

server.start();
server.ready();
