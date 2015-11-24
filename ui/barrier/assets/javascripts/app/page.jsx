import ThreeScene from 'lib/three-scene';
import Background from 'app/background';
import Logo from 'app/logo';

var Page = React.createClass({
    mixins: [
    ],
    
    render: function () {
        return <ThreeScene onCreate={this.handleCreate}>
            <Background />
            <Logo />
        </ThreeScene>;
    },

    handleCreate: function (render) {
        render.camera.position.z = 1440;
    }

});

export default Page;
