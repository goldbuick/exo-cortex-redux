import { argv } from 'yargs';
import inquirer from 'inquirer';
import RethinkDb from '../_api/RethinkDb';
import ApiClient from '../_api/ApiClient';

// get the base exo-cortex stack up
// D@k1WJcpL

class Preflight extends ApiClient {

    constructor (host, port) {
        super(host, port);
        
        this.index = 1;
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
                                keys: [ 'ui-barrier', 'domain' ],
                                value: answers.domain
                            }, fetch);
                        });
                    }
                };

                let fetch = json => {
                    this.message('codex', 'get', {
                        keys: [ 'ui-barrier' ]
                    }, validate);
                };
                fetch();
            }
        },{
            'starting facade': this.start('facade')
        },{
            'starting barrier': this.start('ui-barrier')
        },{
            'display barrier config': next => {
                this.message('codex', 'get', {
                    keys: [ 'ui-barrier' ]
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
                                keys: [ 'ui-barrier', 'password' ],
                                value: answers.password
                            }, fetch);
                        });
                    }
                };

                let fetch = json => {
                    this.message('codex', 'get', {
                        keys: [ 'ui-barrier' ]
                    }, validate);
                };
                fetch();
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

    start (service) {
        return next => this.message('didact', 'add', { service }, next);
    }

}

export default Preflight;
