import Graph from 'lib/graph';
import ThreeRender from 'lib/three-render';

var Feather = React.createClass({
    mixins: [
        ThreeRender
    ],

    animate3D: function (delta, anim, obj) {
        anim.angle = (anim.angle || (Math.random() * Math.PI)) + delta;
        obj.position.y = Math.sin(anim.angle) * 4;
        obj.rotation.z = anim.angle * -0.03;
    },

    render3D: function () {
        let r = alea('barrier-feather'),
            feather = new Graph();

        let center = 800,
            width = 16,
            edge = 128,
            step = 8,
            front = 64,
            drift = 40,
            base = 23,
            segs = 256,
            thresh = 0.3,
            rings = 8;

        edge = width;
        for (let i=0; i<32; ++i) {
            let z = i * -2;
            let twist = Math.floor((r() - 0.5) * 32),
                arc = 45 + Math.floor(r() * 20);
            feather.drawSwipe(0, 0, z, 128, center + edge, width - 2, arc - twist, arc + twist, -12);
            edge += width;
        }

        // feather.drawLoopR(0, 0, 0, 128, center - 32, r, 0.3, base, base);

        // edge = 128;
        // feather.drawLoopR(0, 0, 0, 128, center + edge, r, 0.3, base, base);

        // for (let i=0; i<rings; ++i) {
        //     let z = -64;
        //     edge += step;
        //     feather.drawLoopR(0, 0, z, segs, center + edge, r, thresh,
        //         front + Math.floor(r() * drift),
        //         front - Math.floor(r() * drift));
        //     edge += step;
        //     feather.drawLoopR(0, 0, z, segs, center + edge, r, thresh,
        //         front - Math.floor(r() * drift),
        //         front + Math.floor(r() * drift));
        //     edge += step * Math.floor(r() * 10);
        // }

        // for (let i=0; i<64; ++i) {
        //     let a = r() * Math.PI * 2,
        //         radius = center + (r() * edge),
        //         x = Math.cos(a) * radius,
        //         y = Math.sin(a) * radius;
        //     radius = 8 + r() * 32;
        //     for (let c=0; c<Math.floor(r() * 8); ++c) {
        //         feather.drawLoop(x, y, 0, 6, radius);
        //         radius += 8;
        //     }
        // }

        return feather.build({
            transform: Graph.projectFacePlane(1)
        });
    }
});

export default Feather;