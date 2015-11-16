
import http from 'http';
import socket from 'socket.io';

let port = 3000;
let server = http.createServer();
let io = socket(server);

server.listen(port, () => { console.log('started on ' + port); });
