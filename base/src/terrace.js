import log from './lib/log';
import Server from 'socket.io';
import CONFIG from './lib/config';

var io = new Server(CONFIG.PORTS.TERRACE);
io.on('connection', socket => {
    socket.on('disconnect', () => { });
});

log.server('TERRACE', CONFIG.PORTS.TERRACE);

/*

need to define a pub / sub spec here

client id, ie: didact, facade, etc.. api-irc, api-chat, api-xmpp, api-ident
config -> your config has changed ?

alive -> reply with a ping ..

register -> register a service with facade

*/