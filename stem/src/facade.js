import SocketIO from 'socket.io';
import HttpService from './_api/HttpService';

let server = new HttpService('ui-facade'),
    io = SocketIO(server.http);

server.ping(() => {
    return { active: true };
});

// create a webhook channel ..
let channel = server.channel('webhook');

channel.message('push', {
}, (json, finish) => {
    console.log('webhook/push', json);
    finish();
});

io.on('connection', socket => {
    // do cool shit here ...
    console.log('we have a connection!');
});

server.start();
server.ready();
