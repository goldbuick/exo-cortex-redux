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

    render: function () {
        return <ThreeScene onCreate={this.handleCreate}>
            <Background />
            <LogoLabel ref="logo" text="exoDIDACT" screenLeft="16" position-y="-760" />
            <JellyBase position-y="700"/>
        </ThreeScene>;
    },

    handleCreate: function (render) {
        render.camera.position.z = 1440;
    }

});

export default Page;