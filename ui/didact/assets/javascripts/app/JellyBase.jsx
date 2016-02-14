import Graph from 'lib/Graph';
import ThreeRender from 'lib/ThreeRender';

var JellyBase = React.createClass({
    mixins: [
        ThreeRender
    ],

    animate3D: function (delta, anim, obj) {
        anim.angle = (anim.angle || 0) + (delta * 0.07);
        obj.rotation.y = anim.angle;
    },

    drawService: function (r, jelly, index, y, radius, name) {
        let gap = 2,
            sides = 256,
            bump = r() * Math.PI * 2;
        jelly.drawLoopR(0, 0, y - gap, sides, radius, r, 0.9, 0, 0, 1.1, bump);
        jelly.drawLoopR(0, 0, y - gap, sides, radius + 2, r, 0.1, 0, 0, 1.1, bump);
        jelly.drawSwipe(0, 0, y, sides, radius, 4, 0, 0, 1.0, bump + r());
        jelly.drawSwipe(0, 0, y, sides, radius + 12, 6, 0, 0, 1.0, bump + r());
        jelly.drawLoopR(0, 0, y + gap, sides, radius, r, 0.3, 0, 0, 0.9, bump + r());
    },

    render3D: function () {
        let r = alea('ashdifu-jelly-base-asdfwejeioioj'),
            jelly = new Graph();

        let count = 5,
            step = -64,
            astep = (Math.PI * 0.5) / count;
        for (let i=0; i<count; ++i) {
            this.drawService(r, jelly, i, i * step, 256 + Math.sin(i * astep) * 256);
        }

        return jelly.build({
            transform: Graph.projectPlane(1)
        });
    }
});

export default JellyBase;