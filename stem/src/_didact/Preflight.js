import { argv } from 'yargs';
import inquirer from 'inquirer';
import RethinkDb from '../_api/RethinkDb';
import PostMessage from '../_api/PostMessage';

// get the base exo-cortex stack up

class Preflight {

    constructor (host, port) {
        this.index = 1;
        this.host = host;
        this.port = port;
        this.address = { };

        this.steps = [ ];

        if (argv.docker) {
            // this.steps = this.steps.concat([{
            // 'check docker api connection', // TODO
            // 'check data volume arg', // TODO
            // 'start rethinkdb', // TODO
            // }]);
        }

        this.steps = this.steps.concat([{
            'starting vault': this.start('vault')
        },{
            'check rethinkdb connection': next => {
                this.find('rethinkdb', rethinkdb => {
                    let db = new RethinkDb('codex');
                    db.testConnect(rethinkdb.host, rethinkdb.port, () => {
                        next('connection to rethinkdb works');
                    }, () => {
                        console.log('failed to connect to rethinkdb');
                    });
                });
            }
        },{
            'starting codex': this.start('codex')
        },{
            'check barrier proxy domain': next => {
                let validate = json => {
                    let domain = json.domain;
                    if (domain && domain.length) {
                        next('domain is setup ' + domain);

                    } else {
                        inquirer.prompt([{
                            type: 'input',
                            name: 'domain',
                            message: 'please set the barrier domain'
                        }], answers => {
                            this.message('codex', 'set', {
                                keys: [ 'barrier', 'domain' ],
                                value: answers.domain
                            }, validate);
                        });
                    }
                };

                this.message('codex', 'get', {
                    keys: [ 'barrier' ]
                }, validate);
            }
        },{
            'starting facade': this.start('facade')
        },{
            'starting barrier': this.start('barrier')
        },{
            'display barrier config': next => {
                this.message('codex', 'get', {
                    keys: [ 'barrier' ]
                }, json => {
                    next(json);
                });                
            }
        },{
            'check barrier password': next => {
                let validate = json => {
                    let password = json.password;
                    if (password && password.length) {
                        next('password is setup ' + password);

                    } else {
                        inquirer.prompt([{
                            type: 'input',
                            name: 'password',
                            message: 'please set the barrier password'
                        }], answers => {
                            this.message('codex', 'set', {
                                keys: [ 'barrier', 'password' ],
                                value: answers.password
                            }, validate);
                        });
                    }
                };

                this.message('codex', 'get', {
                    keys: [ 'barrier' ]
                }, validate);
            }
        },{
            'starting didact ui': this.start('ui-didact')
        }]);
    }

    invoke (step) {
        let text = Object.keys(step)[0],
            op = step[text];

        console.log('preflight', ((this.index++) + '.'), text);
        op(result => {
            console.log('preflight', '  ', result);
            console.log();
            this.steps.shift();
            this.next();
        });
    }

    next () {
        if (this.steps.length === 0) {
            console.log('preflight', '!. CHECKLIST COMPLETE');
            console.log();
            if (this.onReady) this.onReady();
        } else {
            this.invoke(this.steps[0]);
        }
    }

    ready (callback) {
        this.onReady = callback;
        this.next();
    }

    find (service, success) {
        if (service === 'didact') {
            return success({
                service: service,
                host: this.host,
                port: this.port
            });
        }

        if (this.address[service]) {
            return success(this.address[service]);
        }

        PostMessage('localhost', this.port, 'didact', 'find', {
            service
        }, json => {
            this.address[json.service] = json;
            success(this.address[json.service]);
        }, err => {
            console.log('find error', err);
        });
    }

    message (service, type, data, success) {
        this.find(service, address => {
            // console.log('message', address);
            PostMessage(address.host, address.port, service, type, data, success, err => {
                console.log('message error', err);
            });
        });
    }

    start (service) {
        return next => this.message('didact', 'add', { service }, next);
    }

}

export default Preflight;
