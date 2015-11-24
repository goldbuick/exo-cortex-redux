import ThreeRender from 'lib/three-render';
import Graph from 'lib/graph';

var Logo = React.createClass({
    mixins: [
        ThreeRender
    ],

    animate3D: function (delta, anim, obj) {
        anim.angle = (anim.angle || 0) + delta;
        obj.position.z = Math.sin(anim.angle) * 2;
        obj.rotation.x = Math.sin(anim.angle) * 0.04;
    },

    render3D: function () {
        let r = alea('barrier-logo'),
            logo = new Graph();

        let center = 512,
            width = 16,
            edge = 128,
            step = 8,
            front = 64,
            drift = 40,
            base = 23,
            segs = 256,
            thresh = 0.3,
            rings = 8;

        logo.drawSwipe(0, 0, 0, 128, center, width, base, base);

        edge = width;
        for (let i=0; i<32; ++i) {
            let twist = Math.floor((r() - 0.5) * 32),
                arc = 45 + Math.floor(r() * 20);
            logo.drawSwipe(0, 0, 0, 128, center + edge, width - 2, arc - twist, arc + twist, -12);
            edge += width;
        }

        logo.drawLoopR(0, 0, 0, 128, center - 32, r, 0.3, base, base);

        edge = 128;
        logo.drawLoopR(0, 0, 0, 128, center + edge, r, 0.3, base, base);

        for (let i=0; i<rings; ++i) {
            edge += step;
            logo.drawLoopR(0, 0, 0, segs, center + edge, r, thresh,
                front + Math.floor(r() * drift),
                front - Math.floor(r() * drift));
            edge += step;
            logo.drawLoopR(0, 0, 0, segs, center + edge, r, thresh,
                front - Math.floor(r() * drift),
                front + Math.floor(r() * drift));
            edge += step * Math.floor(r() * 10);
        }

        for (let i=0; i<64; ++i) {
            let a = r() * Math.PI * 2,
                radius = center + (r() * edge),
                x = Math.cos(a) * radius,
                y = Math.sin(a) * radius;
            radius = 8 + r() * 32;
            for (let c=0; c<Math.floor(r() * 8); ++c) {
                logo.drawLoop(x, y, 0, 6, radius);
                radius += 8;
            }
        }

        let group = logo.build(Graph.projectFacePlane(1));
        group.add(Graph.genText({
            scale: 4,
            logo: true,
            text: 'BARRIER',
            pos: [ 0, 128, 0 ],
            nudge: [ 8, 0, 0 ]
        }));
        group.add(Graph.genText({
            scale: 4,
            logo: true,
            text: '------',
            pos: [ 0, 0, 0 ],
            nudge: [ 8, 0, 0 ]
        }));

        group.position.y = 600;

        return group;
    }
});

export default Logo;