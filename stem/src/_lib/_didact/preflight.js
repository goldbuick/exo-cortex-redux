import log from '../_util/log';
import inquirer from 'inquirer';
import RethinkDB from '../rethinkdb';
import CONFIG from '../../_api/_config';
import CodexApi from '../../_api/codex-api';

class PreFlight {
    constructor () {
        this.index = 1;
        this.barrier = new CodexApi('barrier');
        this.steps = [ ];
        let _steps = this.checklist().concat([
            'check rethinkdb connection', this.checkRethinkDb.bind(this),
            'start terrace', this.runNeuro('terrace'),
            'start codex', this.runNeuro('codex'),
            'check barrier proxy domain', this.checkDomain.bind(this),
            'start facade', this.runNeuro('facade'),
            'start barrier', this.runNeuro('ui-barrier'),
            'display barrier config', this.checkBarrier.bind(this),
            'check barrier password', this.checkPassword.bind(this),
            'start didact ui', this.runNeuro('ui-didact'),
        ]);
        for (let i=0; i<_steps.length; i+=2) {
            this.steps.push({
                text: _steps[i],
                op: _steps[i+1]
            });
        }
    }

    invoke (step) {
        log.msg('preflight', ((this.index++) + '.'), step.text);
        step.op(result => {
            log.msg('preflight', '  ', result);
            log.blank(1);
            this.steps.shift();
            this.next();
        });
    }

    next () {
        if (this.steps.length === 0) {
            log.msg('preflight', '   CHECKLIST COMPLETE');
            log.blank(1);
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
                if ((name === 'facade') ||
                    (name !== 'ui-barrier' && name.indexOf('ui-') === 0)) {
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

        // log.msg('preflight', barrierUrl, neuroUrl);
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
            next('barrier config is ' + JSON.stringify(value));
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
