import PostMessage from '../_api/PostMessage';

class ApiClient {
    
    constructor (host, port) {
        this.host = host;
        this.port = port;
        this.addressCache = { };
    }
    
    find (service, success) {
        if (service === 'didact') {
            return success({
                service: service,
                host: this.host,
                port: this.port
            });
        }

        if (this.addressCache[service]) {
            return success(this.addressCache[service]);
        }

        PostMessage(this.host, this.port, 'didact', 'find', {
            service
        }, json => {
            this.addressCache[json.service] = json;
            success(this.addressCache[json.service]);
        }, err => {
            console.log('find error', err);
        });
    }

    emit (service, type, data, success) {
        this.find(service, target => {
            PostMessage(target.host, target.port, service, type, data, success, err => {
                console.log('emit error', err);
            });
        });
    }

}

export default ApiClient;
