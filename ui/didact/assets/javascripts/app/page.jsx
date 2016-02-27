import FacadeActions from 'lib/FacadeActions';
import Background from 'lib/Background';
import ThreeScene from 'lib/ThreeScene';
import Substrate from 'lib/Substrate';
import JellyBase from 'app/JellyBase';

var Page = React.createClass({
    mixins: [
    ],

    getInitialState: function () {
        return { };
    },

    render: function () {
        return <ThreeScene onCreate={this.handleCreate}>
            <Background seed="something-else-yeah"/>
            <Substrate />
            <JellyBase position-y="700"/>
        </ThreeScene>;
    },

    handleCreate: function (render) {
        render.camera.position.z = 1440;
    },

    handlePointer: function (id, pressed, x, y, intersects) {
    }

});

export default Page;