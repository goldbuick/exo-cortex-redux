import Draft from 'lib/viz/Draft';
import Animate from 'lib/Animate';
import ThreeRender from 'lib/ThreeRender';

var DraftTest = React.createClass({
    mixins: [
        ThreeRender
    ],

    animate3D: function (delta, anim, obj) {
        // let animRoot = Animate.subAnim(anim, 'root');
        // animRoot.angle = (animRoot.angle || 0) + delta;
        // obj.userData.root.rotation.y = animRoot.angle;
    },

    render3D: function () {
    }
});

export default DraftTest;
