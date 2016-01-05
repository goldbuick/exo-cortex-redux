import log from '../_lib/_util/log';
import CodexClient from './codex-client';

// TODO: include a way to formalized upstream path deps
// because otherwise users have no idea what they need in order to run
// certain setups

class UpstreamNode extends CodexClient {

    constructor (channel) {
        super(channel);

        // register as an upstream node
        this.api.connect(() => {
            this.api.socket.emit('register', {
                node: this.channel
            });
        });

        // watch for our upstream target config
        this.changed(json => {
            if (typeof json.upstream === 'string') {
                this.target = json.upstream;
            }
        });

        // watch for incoming upstream data
        this.api.watch(this.channel, message => {
            if (this.target) {
                let _message = message;
                if (this.onUpstream) _message = this.onUpstream(message) || message;
                _message.upstream = this.target;
                this.api.upstream(_message);
            }
        });
    }

    // handle incoming upstream data
    upstream (handler) {
        this.onUpstream = handler;
    }

    // send data upstream
    emit (type, data) {
        if (this.target) {
            let _message = makeMessage(this.channel, type, data);
            _message.upstream = this.target;
            this.api.upstream(_message);
        }
    }

}

export default function (channel) {
    return new UpstreamNode(channel);
}
