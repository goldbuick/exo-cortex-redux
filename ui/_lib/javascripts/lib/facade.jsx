let domain = window.location.hostname.split('.').slice(-2).join('.'),
    url = window.location.protocol + '//facade.' + domain + ':' + window.location.port;

// console.log('facade url', url);
require([ url + '/socket.io/socket.io.js'], function (io) {
    let socket = io(url);
    socket.on('connect', () => {
        console.log('--==[ connected to FACADE ]==--');
    });
    socket.on('connect_error', () => {
        console.log('--==[ lost connection to FACADE ]==--');
    });
    socket.on('api', data => {
        console.log('--== api', data, '==--');
    });
    socket.on('nodes', data => {
        console.log('--== nodes', data, '==--');
        socket.emit('message', {
            channel: 'didact',
            type: 'neuros'
        });
    });
    socket.on('didact/running', data => {
        console.log('--== didact/running', data, '==--');
    });
});
