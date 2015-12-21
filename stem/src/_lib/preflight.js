import log from './log';
import CONFIG from './config';
import inquirer from 'inquirer';
import RethinkDB from './rethinkdb';
import CodexApi from '../_api/codex-api';

class PreFlight {
    constructor () {
        this.barrier = new CodexApi('barrier');
        this.steps = this.checklist();
    }

    invoke (op) {
        op(result => {
            log.msg('preflight', result);
            this.steps.shift();
            this.next();
        });
    }

    next () {
        if (this.steps.length === 0) {
            log.msg('preflight', 'CHECKLIST COMPLETE');
            if (this.onReady) this.onReady();
        } else {
            this.invoke(this.steps[0]);
        }
    }

    ready (stem, callback) {
        this.stem = stem;
        this.onReady = callback;
        this.next();
    }

    runNeuro (name) {
        let self = this;
        return function (next) {
            self.stem.start(name, result => {
                if (name !== 'ui-barrier' && name.indexOf('ui-') === 0) {
                    self.proxyNeuro(name, next);
                } else {
                    next(name + ' started');
                }
            });
        };
    }

    proxyNeuro (name, next) {
        let barrier = this.barrier,
            neuro = this.stem.neuro(name),
            barrierUrl = neuro.image + '.' + barrier.get(['domain']),
            neuroUrl = 'localhost:' + neuro.port;

        barrier.set(['auth', barrierUrl], neuroUrl, () => {
            next(name + ' started & proxied');
        });
    }

    checkRethinkDb (next) {
        let db = new RethinkDB();
        function validate() {
            db.testConnect(CONFIG.HOSTS.VAULT, CONFIG.PORTS.VAULT, () => {
                next('connected to RethinkDB');
            }, () => {
                inquirer.prompt([{
                    type: 'input',
                    name: 'ready',
                    message: 'have you started RethinkDB?'
                }], () => {
                    validate();
                });
            });
        }
        validate();
    }

    checkDomain (next) {
        let self = this;
        function validate (value) {
            let domain = value.domain;
            if (domain && domain.length) {
                next('domain is setup ' + domain);
            } else {
                inquirer.prompt([{
                    type: 'input',
                    name: 'domain',
                    message: 'please set the barrier domain'
                }], answers => {
                    self.barrier.set(['domain'], answers.domain, validate);
                });
            }
        }
        this.barrier.get(['domain'], validate);
    }

    checkBarrier (next) {
        this.barrier.check((value) => {
            next('barrier config active: ' + JSON.stringify(value));
        });
    }

    checkPassword (next) {
        let self = this;
        function validate (value) {
            let password = value.password;
            if (password && password.length) {
                next('password is setup ' + password);
            } else {
                inquirer.prompt([{
                    type: 'input',
                    name: 'password',
                    message: 'please set the barrier password'
                }], answers => {
                    self.barrier.set(['password'], answers.password, validate);
                });
            }
        }
        this.barrier.get(['password'], validate);
    }

}

export default PreFlight;
