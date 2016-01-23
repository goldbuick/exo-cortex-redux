import { argv } from 'yargs';
import HttpApi from './_api/HttpApi';
import PostMessage from './_api/PostMessage';

// extended api to log & ping didact

class HttpService extends HttpApi {

    constructor (name) {
        super.constructor();
        this.name = name;
        let args = argv.didact.split(':');
        this.didact = {
            host: args[0],
            port: args[1]
        };
    }

    ping (handler) {
        this.onPing = handler;
    }

    log (json) {
        PostMessage(this.didact.host, this.didact.port, 'didact', 'log', {
            service: this.name,
            data: json
        });
    }

    find (service, success, fail) {
        PostMessage(this.didact.host, this.didact.port, 'didact', 'find', { service }, success, fail);
    }

    start (port) {
        if (this.onPing === undefined) {
            console.log('HttpService requires ping handler');

        } else {
            super.start(port);
            // ping every 2 minutes
            setInterval(this.onPing, 1000 * 60 * 2);
            
        }
    }

}

export default HttpService;
