import log from './lib/_util/log';

/*
not sure what to do here ? is this just pass-log ?
need to figure out a good way to replay -> query history
the idea is what we log completed messages only
vault => facade
pass-chat would consume any api-irc & api-xmpp messages and not upstream them,
only upstream the generated chat messages
going to drop the log-message boolean, vault logs it all

*/