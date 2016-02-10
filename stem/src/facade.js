import SocketIO from 'socket.io';
import HttpService from './_api/HttpService';
import Message from './_api/Message';

let server = new HttpService('ui-facade'),
    io = SocketIO(server.http);

server.ping(() => {
    return { active: true };
});

server.upstream(json => {
    socket.emit('message', json);
});

io.on('connection', socket => {
    socket.on('api', json => {
        server.emit(json.channel, json.type, json.meta, result => {
            socket.emit('message', Message(json.channel, json.type, result));
        });
    });
});

server.start();
server.ready();
