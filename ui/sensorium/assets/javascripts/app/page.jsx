import ThreeScene from 'lib/three-scene';

var Page = React.createClass({
    mixins: [
    ],

    render: function () {
        return <ThreeScene onCreate={this.handleCreate} onPointer={this.handlePointer}>
        </ThreeScene>;
    },

    handleCreate: function (render) {
        render.camera.position.z = 1440;
    },

    handlePointer: function (id, pressed, x, y, intersects) {
    }

});

export default Page;
