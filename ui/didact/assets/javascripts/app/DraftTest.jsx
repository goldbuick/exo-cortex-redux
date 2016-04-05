import Draft from 'lib/viz/Draft';
import Animate from 'lib/Animate';
import ThreeRender from 'lib/ThreeRender';

var DraftTest = React.createClass({
    mixins: [
        ThreeRender
    ],

    animate3D: function (delta, anim, obj) {
        // anim.angle = (anim.angle || 0) + delta * 0.25;
        // obj.rotation.x = anim.angle;
        // obj.rotation.z = anim.angle * 0.25;
    },

    render3D: function () {
        let r = alea('rando-b'),
            test = new Draft();

        return test.build({
            transform: Draft.projectFacePlane(1)
        });
    }
});

export default DraftTest;
