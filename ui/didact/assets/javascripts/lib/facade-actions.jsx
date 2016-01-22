let socket,
    domain = window.location.hostname.split('.').slice(-2).join('.'),
    url = window.location.protocol + '//facade.' + domain + ':' + window.location.port;

let FacadeActions = Reflux.createActions([
    'api',
    'emit',
    'nodes',
    'message',
    'connect',
    'connectError'
]);

require([ url + '/socket.io/socket.io.js'], io => {
    socket = io(url);
    socket.on('api', e => FacadeActions.api(e));
    socket.on('nodes', e => FacadeActions.nodes(e));
    socket.on('message', e => FacadeActions.message(e));
    socket.on('connect', () => {
        FacadeActions.connect();
        FacadeActions.connect.listen = (callback => callback());
    });
    socket.on('connect_error', e => FacadeActions.connectError(e));
});

FacadeActions.emit.listen((channel, type, meta) => {
    socket.emit('message', {
        id: uuid.v4(),
        when: new Date().toISOString(),
        channel: channel,
        type: type,
        meta: meta || { }
    });
});

export default FacadeActions;
