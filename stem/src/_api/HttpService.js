import { argv } from 'yargs';
import HttpApi from './_api/HttpApi';
import PostMessage from './_api/PostMessage';

// extended api to log & ping didact

class HttpService extends HttpApi {

    ping (handler) {
        this.onPing = handler;
    }

    log (json) {
        let args = argv.didact.split(':');
        PostMessage(args[0], args[1], 'didact', 'log', json);
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
