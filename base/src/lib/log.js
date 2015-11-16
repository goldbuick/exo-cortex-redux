function log() {
    // for now, simple logging, in future add winston ..
    console.log.apply(console, arguments);    
}

log.server = (name, port) => {
    log('server', name, 'started on', port);
}

export default log;
