import FacadeActions from 'lib/FacadeActions';
import Background from 'lib/Background';
import ThreeScene from 'lib/ThreeScene';
import Substrate from 'lib/Substrate';
import LogoLabel from 'lib/LogoLabel';
import JellyBase from 'app/JellyBase';

var Page = React.createClass({
    mixins: [
    ],

    getInitialState: function () {
        return { };
    },
            // <JellyBase position-y="700"/>

    render: function () {
        return <ThreeScene onCreate={this.handleCreate} onUpdate={this.handleUpdate}>
            <Background />
            <LogoLabel ref="logo" text="exoDIDACT" position-y="-760" />
        </ThreeScene>;
    },

    handleCreate: function (render) {
        render.camera.position.z = 1440;
    },

    handleUpdate: function (scene, delta) {
        if (this.refs.logo && this.refs.logo._object3D) {
            this.refs.logo._object3D.position.x = ThreeScene.screenLeft(10);
        }
    }

});

export default Page;