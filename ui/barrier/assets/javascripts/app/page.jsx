import ThreeScene from 'lib/three-scene';
import Logo from 'app/logo';
import Plate from 'app/plate';
import Background from 'app/background';

var Page = React.createClass({
    mixins: [
    ],
    
    render: function () {
        return <ThreeScene onCreate={this.handleCreate}>
            <Background />
            <Plate />
            <Logo />
        </ThreeScene>;
    },

    handleCreate: function (render) {
        render.camera.position.z = 1440;
    }

});

export default Page;
