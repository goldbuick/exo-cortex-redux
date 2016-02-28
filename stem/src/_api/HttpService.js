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
        this.addressCache = { };

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
        if (service === 'didact') {
            return success({
                service: service,
                host: this.didact.host,
                port: this.didact.port
            });
        }

        if (this.addressCache[service]) {
            return success(this.addressCache[service]);
        }

        PostMessage(this.didact.host, this.didact.port, 'didact', 'find', {
            service
        }, (json) => {
            this.addressCache[json.service] = json;
            success(this.addressCache[json.service]);
        }, fail);
    }
    
    emit (service, type, data, success) {
        this.find(service, target => {
            PostMessage(target.host, target.port, service, type, data, success, err => {
                console.log('emit error', err);
            });
        });
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
