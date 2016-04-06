import Draft from 'lib/viz/Draft';
import Animate from 'lib/Animate';
import ThreeRender from 'lib/ThreeRender';

var DraftTest = React.createClass({
    mixins: [
        ThreeRender
    ],

    animate3D: function (delta, anim, obj) {
        anim.angle = (anim.angle || 0) + delta * 0.25;
        // obj.rotation.y = anim.angle;
        obj.rotation.x = anim.angle;
        obj.rotation.z = anim.angle * 0.25;
    },

    render3D: function () {
        let r = alea('rando-b'),
            test = new Draft();

        let range = 128,
            rr = Draft.noise('rando-c');

        for (let i=0; i < 256; ++i) {
            let points = Draft.genFlow(rr, 
                (r()-0.5) * range,
                (r()-0.5) * range,
                (r()-0.5) * range,
                64, 256);
            points = Draft.map(points, pt => {
                return { x: pt.x, y: pt.y - 512, z: pt.z };
            });
            test.drawLine(points);
        }

        return test.build({
            transform: Draft.projectFacePlane(1)
        });
    }
});

export default DraftTest;
