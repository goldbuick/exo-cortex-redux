import FacadeActions from 'lib/FacadeActions';
import { CodexAPI, CodexMSG } from 'lib/CodexActions';
import { DidactAPI, DidactMSG } from 'lib/DidactActions';

let ExoStore = Reflux.createStore({
    listenables: [ CodexMSG, DidactMSG ],

    queue: {
        services: [ ]
    },

    data: {
        facade: false,
        neuros: [ ],
        services: [ ]
    },

    getInitialState: function () {
        return this.data;
    },

    identifyService: function () {
        if (this.queue.services.length === 0) return;
        let service = this.queue.services.shift();
        CodexAPI.get([ service ]);
    },

    onDidactList: function (message) {
        this.data.neuros = [ ];
        this.data.services = [ ];
        this.data.facade = false;
        this.trigger(this.data);
        this.queue.services = message.meta.services;
        this.identifyService();
    },

    onCodexGet: function (message) {
        let service = message.meta.keys[0],
            hasUpstream = message.meta.value.upstream !== undefined;

        if (hasUpstream) {
            this.data.neuros.push(service);

        } else if (service === 'ui-facade') {
            this.data.facade = true;

        } else {
            this.data.services.push(service);

        }

        this.trigger(this.data);
        this.identifyService();
    }

});

FacadeActions.connect.listen(() => {
    DidactAPI.list();
});

export default ExoStore;
