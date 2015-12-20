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

    checkRethinkDb (next) {
        let db = new RethinkDB();

        function tryToConnect() {
            db.testConnect(CONFIG.HOSTS.VAULT, CONFIG.PORTS.VAULT, () => {
                next('connected to RethinkDB');
            }, () => {
                inquirer.prompt([{
                    type: 'input',
                    name: 'ready',
                    message: 'have you started RethinkDB?'
                }], () => {
                    tryToConnect();
                });
            });
        }

        tryToConnect();
    }

    checkBarrier (next) {
        this.barrier.check((value) => {
            next('barrier config active: ' + JSON.stringify(value));
        });
    }

    checkPassword (next) {
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
                    this.barrier.set(['password'], answers.password, validate);
                });
            }
        }
        this.barrier.get(['password'], validate);
    }
}

export default PreFlight;
