var log = { };

var output = function () {
    // for now, simple logging, in future add winston ..
    console.log.apply(console, arguments);    
}

log.output = function (fn) {
    output = fn;
};

log.msg = function () {
    var args = Array.prototype.slice.call(arguments);
    args[0] = args[0] + ': =>';
    args.unshift('MSG');
    output.apply(undefined, args);
};

log.error = function () {
    var args = Array.prototype.slice.call(arguments);
    args[0] = args[0] + ': =>';
    args.unshift('ERR');
    output.apply(undefined, args);
};

log.server = function () {
    var args = Array.prototype.slice.call(arguments);
    args[0] = args[0] + ': =>';
    args.unshift('SRV');
    output.apply(undefined, args);
};

log.client = function () {
    var args = Array.prototype.slice.call(arguments);
    args[0] = args[0] + ': =>';
    args.unshift('CLI');
    output.apply(undefined, args);
};

log.event = function () {
    var args = Array.prototype.slice.call(arguments);
    args[0] = args[0] + ': =>';
    args.unshift('EVT');
    output.apply(undefined, args);
};

log.blank = function (lines) {
    for (let i=0; i<lines; ++i)
        output.apply(undefined, [ '' ]);
};

export default log;
