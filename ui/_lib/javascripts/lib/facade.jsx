let domain = window.location.hostname.split('.').slice(-2).join('.'),
    url = window.location.protocol + '//facade.' + domain + ':' + window.location.port;

console.log('facade url', url);
require([ url + '/socket.io/socket.io.js'], function (io) {
    let socket = io(url);
    socket.on('connection', () => {
        console.log('connected to FACADE!!!!');
    });
});
