import Graph from 'lib/Graph';
import ThreeRender from 'lib/ThreeRender';

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
            edge = 128;

        edge = width;
        for (let i=0; i<32; ++i) {
            let z = i * -2;
            let twist = Math.floor((r() - 0.5) * 32),
                arc = 45 + Math.floor(r() * 20);
            feather.drawSwipe(0, 0, z, 128, center + edge, width - 2, arc - twist, arc + twist, -12);
            edge += width;
        }

        return feather.build({
            transform: Graph.projectFacePlane(1)
        });
    }
});

export default Feather;