import ThreeRender from 'lib/three-render';
import Graph from 'lib/graph';

var Background = React.createClass({
    mixins: [
        ThreeRender
    ],

    animate3D: function (delta, anim, obj) {
        anim.angle = (anim.angle || 0) + delta * 0.1;
        obj.rotation.x = Math.cos(anim.angle);
        obj.rotation.y = Math.cos(anim.angle) + Math.sin(anim.angle);
        obj.rotation.z = Math.sin(anim.angle);
    },

    render3D: function () {
        let sparks = new Graph(),
            points = [ ];

        for (let i=0; i<10000; ++i) {
            let range = 3000,
                y = (Math.random()-0.5) * range,
                a = Math.abs(y) / 1000,
                w = Math.cos(a) * range;
            points.push({
                x: (Math.random()-0.5) * w,
                y: y,
                z: (Math.random()-0.5) * w
            });
        }
        sparks.drawPoints(points);

        return sparks.build({
            transform: Graph.projectPlane(1)
        });
    }
});

export default Background;