import Facade from 'lib/facade';
import Background from 'lib/background';
import ThreeScene from 'lib/three-scene';

var Page = React.createClass({
    mixins: [
    ],

    getInitialState: function () {
        return { };
    },
    
    render: function () {
        return <ThreeScene onCreate={this.handleCreate} onPointer={this.handlePointer}>
            <Background />
        </ThreeScene>;
    },

    handleCreate: function (render) {
        render.camera.position.z = 1440;
    },

    handlePointer: function (id, pressed, x, y, intersects) {
    }

});

export default Page;