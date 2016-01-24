import HttpNeuro from './_api/HttpNeuro';

let server = new HttpNeuro('barrier');
server.ping(() => {
    return { active: true };
});
server.start();
server.ready();

// create an express route /codex/update via post method
// this.config = new CodexConfig(name);
