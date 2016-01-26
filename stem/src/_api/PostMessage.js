import Message from './Message';
import PostJson from './PostJson';

// post a standard message to a server on a port

export default function (host, port, channel, type, data, success, fail) {
    let path = '/' + [ channel, type ].join('/');
    // console.log('PostMessage', host, port, channel, type, data);
    PostJson(host, port, path, Message(channel, type, data), success, fail);
}
