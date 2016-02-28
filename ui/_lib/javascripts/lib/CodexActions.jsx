import FacadeActions from 'lib/FacadeActions';

let CodexAPI = Reflux.createActions([
    'get',
    'set'
]);

CodexAPI.get.listen(keys => FacadeActions.api('codex', 'get', { keys }));
CodexAPI.set.listen((keys, value) => FacadeActions.api('codex', 'set', { keys, value }));

let CodexMSG = Reflux.createActions([
    'codexGet',
    'codexSet'
]);

FacadeActions.onMessage({ channel: 'codex', type: 'get', target: CodexMSG });
FacadeActions.onMessage({ channel: 'codex', type: 'set', target: CodexMSG });

export { CodexAPI, CodexMSG }
