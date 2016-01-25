import { argv } from 'yargs';
import HttpApi from './HttpApi';
import PostMessage from './PostMessage';

// extended api to log & ping didact
// --dev or --docker
// --didact [host:port]
// --port [port]

class HttpService extends HttpApi {

    constructor (name) {
        super();
        this.name = name;
        this.address = { };

        let args = argv.didact.split(':');
        this.didact = { host: args[0], port: args[1] };
        if (argv.dev) this.didact.dev = true;
        if (argv.docker) this.didact.docker = true;
    }

    ping (handler) {
        this.onPing = handler;
    }

    ready () {
        let data = this.onPing && this.onPing() || { };
        data.service = this.name;
        PostMessage(this.didact.host, this.didact.port, 'didact', 'ping', data);        
    }

    log (data) {
        let service = this.name;
        PostMessage(this.didact.host, this.didact.port, 'didact', 'log', {
            service, data
        });
    }

    find (service, success, fail) {
        if (this.address[service]) {
            return success(this.address[service]);
        }

        PostMessage(this.didact.host, this.didact.port, 'didact', 'find', {
            service
        }, (json) => {
            this.address[json.service] = json;
            success(this.address[json.service]);
        }, fail);
    }

    register (service, host, port, success, fail) {
        PostMessage(this.didact.host, this.didact.port, 'didact', 'register', {
            service, host, port
        }, success, fail);
    }

    start () {
        if (this.onPing === undefined) {
            console.log('HttpService requires ping handler');

        } else {
            super.start(argv.port);
            
            // ping every minute
            setInterval(() => this.ready(), 1000 * 60);
        }
    }

}

export default HttpService;
