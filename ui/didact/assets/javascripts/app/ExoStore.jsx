import { CodexAPI, CodexMSG } from 'lib/CodexActions';
import { DidactAPI, DidactMSG } from 'lib/DidactActions';

let ExoStore = Reflux.createStore({
    listenables: [ CodexMSG, DidactMSG ],

    data: {
        facade: false,
        neuros: [ ],
        services: [ ]
    },

    getInitialState: function () {
        return this.data;
    },

    onDidactList: function (message) {
        console.log('onDidactList', message);
    },

    onCodexGet: function (message) {
        console.log('onCodexGet', message);
    }

});

export default ExoStore;
