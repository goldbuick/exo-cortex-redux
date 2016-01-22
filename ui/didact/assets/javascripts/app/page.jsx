import FacadeActions from 'lib/facade-actions';
import Background from 'lib/background';
import ThreeScene from 'lib/three-scene';

/*
what do I need from web-didact
generic config editor
start / stop neuros
edit upstream path
*/

FacadeActions.connect.listen(() => {
    FacadeActions.emit('didact', 'neuros');
});

FacadeActions.api.listen(api => console.log(api));
FacadeActions.nodes.listen(nodes => console.log(nodes));
FacadeActions.message.listen(message => console.log(message));

var Page = React.createClass({
    mixins: [
    ],

    getInitialState: function () {
        return { };
    },
    
    render: function () {
        return <ThreeScene onCreate={this.handleCreate} onPointer={this.handlePointer}>
            <Background seed="something-else-yeah"/>
        </ThreeScene>;
    },

    handleCreate: function (render) {
        render.camera.position.z = 1440;
    },

    handlePointer: function (id, pressed, x, y, intersects) {
    }

});

export default Page;