import SocketIO from 'socket.io';
import HttpService from './_api/HttpService';

let server = new HttpService('ui-facade'),
    io = SocketIO(server.http);

server.ping(() => {
    return { active: true };
});

server.upstream(json => {
    console.log('upstream', json);
});

io.on('connection', socket => {
    // do cool shit here ...
    // console.log('we have a connection!');
    socket.on('api', json => {

    });
});

server.start();
server.ready();
