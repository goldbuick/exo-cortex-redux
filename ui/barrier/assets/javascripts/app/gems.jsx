import Graph from 'lib/graph';
import ThreeRender from 'lib/three-render';

var Gems = React.createClass({
    mixins: [
        ThreeRender
    ],

    animate3D: function (delta, anim, obj) {
        anim.angle = (anim.angle || (Math.random() * Math.PI)) + delta;
        obj.position.y = Math.sin(anim.angle) * 4;
    },

    render3D: function () {
        let r = alea('barrier-gems'),
            gems = new Graph();

        let center = 700,
            edge = 128;

        edge = 500;
        for (let i=0; i<64; ++i) {
            let a = r() * Math.PI * 2,
                radius = center + (r() * edge),
                x = Math.cos(a) * radius,
                y = Math.sin(a) * radius;
            radius = 8 + r() * 32;
            for (let c=0; c<Math.floor(r() * 8); ++c) {
                gems.drawLoop(x, y, 0, 6, radius);
                radius += 8;
            }
        }

        return gems.build({
            transform: Graph.projectFacePlane(1)
        });
    }
});

export default Gems;