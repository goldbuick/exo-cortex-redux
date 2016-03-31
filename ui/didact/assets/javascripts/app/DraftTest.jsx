import Draft from 'lib/viz/Draft';
import Animate from 'lib/Animate';
import ThreeRender from 'lib/ThreeRender';

var DraftTest = React.createClass({
    mixins: [
        ThreeRender
    ],

    animate3D: function (delta, anim, obj) {
        anim.angle = (anim.angle || 0) + delta * 0.25;
        obj.rotation.x = anim.angle;
        obj.rotation.z = anim.angle * 0.25;
    },

    render3D: function () {
        let r = alea('rando-b'),
            test = new Draft();

        let points = Draft.genSpaces(0, 0, 0, 512, 512, count => {
            return count === 0 || (count < 4 && r() < 0.5);
        });

        // let points = Draft.genGrid(0, 0, 0, 16, 16, 1, 80);
        // points = test.filterByNoise(points, 'radical', 0.002, v => {
        //     console.log(v);
        //     return v < -0.2;
        // });

        test.map(points, pt => {
            let gap = 64 + (r() - 0.5) * 256,
                z = pt.z + (r() - 0.5) * 256;
            test.drawLine([{ x: pt.x, y: pt.y, z: z + gap }, pt]);
            test.drawLine([{ x: pt.x, y: pt.y, z: z - gap }, pt]);
            test.drawHexPod(pt.x, pt.y, z, 8, Math.floor(2 + r() * 2), 4 + r() * 2);
        });

        // let arc = (x, y, z, i, count) => {
        //     let ratio = 1 - (i / count),
        //         len = i * 64;
        //     return {
        //         x: x + len * ratio,
        //         y: y + len,
        //         z: z + Math.cos(i * 0.7) * 64
        //     };
        // };

        // let points = Draft.genAngles(Draft.genPoints(-200, -1000, 0, 32, false, arc));
        // test.map(points, (pt, i) => {
        //     let pts = Draft.genChevron(pt.x, pt.y, pt.z, 128 + i * 10, pt.angle, Math.PI * 0.2);
        //     test.drawLine(pts);
        //     if (i % 4 === 0) {
        //         test.drawHexPod(pts[0].x, pts[0].y, pts[0].z, 32, Math.floor(3 + r() * 2), 10 + r() * 2);
        //     }
        //     if ((i + 2) % 4 === 0) {
        //         test.drawHexPod(pts[2].x, pts[2].y, pts[2].z, 32, Math.floor(3 + r() * 2), 12 + r() * 4);
        //     }
        // });

        return test.build({
            transform: Draft.projectFacePlane(1)
        });
    }
});

export default DraftTest;
