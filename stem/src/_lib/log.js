function log() {
    // for now, simple logging, in future add winston ..
    console.log.apply(console, arguments);    
}

log.msg = function () {
    var args = Array.prototype.slice.call(arguments);
    args[0] = args[0] + ': =>';
    args.unshift('MSG');
    log.apply(undefined, args);
};

log.server = function() {
    var args = Array.prototype.slice.call(arguments);
    args[0] = args[0] + ': =>';
    args.unshift('SRV');
    log.apply(undefined, args);
};

log.client = function() {
    var args = Array.prototype.slice.call(arguments);
    args[0] = args[0] + ': =>';
    args.unshift('CLI');
    log.apply(undefined, args);
};

log.event = function() {
    var args = Array.prototype.slice.call(arguments);
    args[0] = args[0] + ': =>';
    args.unshift('EVT');
    log.apply(undefined, args);
};

export default log;
