import DidactActions from 'app/DidactActions';
import FacadeActions from 'lib/FacadeActions';

let DidactStore = Reflux.createStore({
    listenables: [ DidactActions ],

    data: {
        facade: false,
        neuros: [ ],
        services: [ ]
    },

    getInitialState: function() {
        return this.data;
    },

    onList: function() {
        FacadeActions.api('didact', 'list', {});        
    },

    onListResponse: function(services) {
        this.data.services = services.filter(service => {
            if (service !== 'ui-facade') return true;
            this.data.facade = true;
            return false;
        });
        this.trigger(this.data);
    }
});

FacadeActions.connect.listen(() => DidactActions.list());

FacadeActions.onMessage({
    channel: 'didact',
    type: 'list'
}, message => DidactActions.listResponse(message.meta.services));

export default DidactStore;
