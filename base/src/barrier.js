import log from './lib/log';

/*

this is an authenticated reverse proxy for exo-cortex
when unauthenticated it will serve up it's own front-end
otherwise based on HOST http header it will proxy to the
appropriate ui server

*/