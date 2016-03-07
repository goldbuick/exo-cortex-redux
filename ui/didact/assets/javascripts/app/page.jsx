import FacadeActions from 'lib/FacadeActions';
import Background from 'lib/Background';
import ThreeScene from 'lib/ThreeScene';
import Substrate from 'lib/Substrate';
import LogoLabel from 'lib/LogoLabel';
import JellyBase from 'app/JellyBase';
import JellyArms from 'app/JellyArms';
import RezTerrain from 'lib/RezTerrain';

var Page = React.createClass({
    mixins: [
    ],

    getInitialState: function () {
        return { };
    },

    render: function () {
        return <ThreeScene onCreate={this.handleCreate}>
            <Background />
            <LogoLabel ref="logo" text="exoDIDACT" screenLeft="16" position-y="-750" />
            <JellyBase position-y="700" />
            <JellyArms position-y="200" />
            <RezTerrain />
        </ThreeScene>;
    },

    handleCreate: function (render) {
        render.camera.position.z = 1440;
    }

});

export default Page;