import Graph from 'lib/graph';
import ThreeRender from 'lib/three-render';

var Plate = React.createClass({
    mixins: [
        ThreeRender
    ],

    animate3D: function (delta, anim, obj) {
        anim.angle = (anim.angle || (Math.random() * Math.PI)) + delta;
        obj.position.y = Math.sin(anim.angle) * 4;
        obj.rotation.z = anim.angle * 0.03;
    },

    render3D: function () {
        let r = alea('barrier-plate'),
            plate = new Graph();

        let center = 700,
            width = 16,
            edge = 128,
            step = 8,
            front = 64,
            drift = 40,
            base = 23,
            segs = 256,
            thresh = 0.3,
            rings = 8;

        plate.drawSwipe(0, 0, 0, 128, center, width, base, base);
        plate.drawLoopR(0, 0, 0, 128, center - 32, r, 0.3, base, base);

        edge = 128;
        plate.drawLoopR(0, 0, 0, 128, center + edge, r, 0.3, base, base);

        for (let i=0; i<rings; ++i) {
            let z = -64;
            edge += step;
            plate.drawLoopR(0, 0, z, segs, center + edge, r, thresh,
                front + Math.floor(r() * drift),
                front - Math.floor(r() * drift));
            edge += step;
            plate.drawLoopR(0, 0, z, segs, center + edge, r, thresh,
                front - Math.floor(r() * drift),
                front + Math.floor(r() * drift));
            edge += step * Math.floor(r() * 10);
        }

        return plate.build({
            transform: Graph.projectFacePlane(1)
        });
    }
});

export default Plate;