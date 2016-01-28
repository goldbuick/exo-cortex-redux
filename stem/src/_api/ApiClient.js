import PostMessage from '../_api/PostMessage';

class ApiClient {
    
    constructor (host, port) {
        this.host = host;
        this.port = port;
        this.address = { };
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

        PostMessage(this.host, this.port, 'didact', 'find', {
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
            PostMessage(address.host, address.port, service, type, data, success, err => {
                console.log('message error', err);
            });
        });
    }

}

export default ApiClient;
