import FacadeActions from 'lib/FacadeActions';

let DidactAPI = Reflux.createActions([
    'add',
    'list',
    'remove',
    'restart'
]);

DidactAPI.add.listen(service => FacadeActions.api('didact', 'add', { service }));
DidactAPI.list.listen(() => FacadeActions.api('didact', 'list'));
DidactAPI.remove.listen(service => FacadeActions.api('didact', 'remove', { service }));
DidactAPI.restart.listen(service => FacadeActions.api('didact', 'restart', { service }));

let DidactMSG = Reflux.createActions([
    'didactList'
]);

FacadeActions.onMessage({ channel: 'didact', type: 'list', target: DidactMSG });

export { DidactAPI, DidactMSG }
