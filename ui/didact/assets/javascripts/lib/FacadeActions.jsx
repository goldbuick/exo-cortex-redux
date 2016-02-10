let socket,
    domain = window.location.hostname.split('.').slice(-2).join('.'),
    url = window.location.protocol + '//facade.' + domain + ':' + window.location.port;

let FacadeActions = Reflux.createActions([
    'api',
    'message',
    'connect',
    'connectError'
]);

require([ url + '/socket.io/socket.io.js'], io => {
    socket = io(url);
    socket.on('message', e => {
        FacadeActions.message(e);
    });
    socket.on('connect', () => {
        FacadeActions.connect();
        FacadeActions.connect.listen = (callback => callback());
    });
    socket.on('connect_error', e => FacadeActions.connectError(e));
});

FacadeActions.api.listen((service, type, data, success, fail) => {
    socket.emit('api', {
        id: uuid.v4(),
        when: new Date().toISOString(),
        channel: service,
        type: type,
        meta: data || { }
    });
});

export default FacadeActions;
