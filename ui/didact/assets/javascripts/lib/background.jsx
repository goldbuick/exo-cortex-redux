import Graph from 'lib/graph';
import ThreeRender from 'lib/three-render';

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
        let r = alea('star-speckle-background'),
            points = [ ],
            sparks = new Graph();

        for (let i=0; i<10000; ++i) {
            let range = 3000,
                y = (r()-0.5) * range,
                a = Math.abs(y) / 1000,
                w = Math.cos(a) * range;
            points.push({
                x: (r()-0.5) * w,
                y: y,
                z: (r()-0.5) * w
            });
        }
        sparks.drawPoints(points);

        return sparks.build({
            transform: Graph.projectPlane(1)
        });
    }
});

export default Background;