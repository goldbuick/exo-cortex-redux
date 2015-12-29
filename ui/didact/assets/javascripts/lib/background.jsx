import Graph from 'lib/graph';
import ThreeRender from 'lib/three-render';
import 'lib/threejs/SimplexNoise';

var Background = React.createClass({
    mixins: [
        ThreeRender
    ],

    animate3D: function (delta, anim, obj) {
        anim.angle = (anim.angle || 0) + delta * 0.1;
        obj.rotation.x = Math.cos(anim.angle);
        obj.rotation.y = Math.cos(anim.angle) + Math.sin(-anim.angle);
        obj.rotation.z = Math.sin(anim.angle);
    },

    render3D: function () {
        let r = alea('star-speckle-background'),
            points = [ ],
            sparks = new Graph();

        let nudge = 64,
            count = 50,
            range = 3000,
            scale = 0.051,
            hcount = count * 0.5;
        let rr = new SimplexNoise({ random: r }); 
        for (let x=0; x<count; ++x) {
            for (let y=0; y<count; ++y) {
                for (let z=0; z<count; ++z) {
                    let v = rr.noise3d(x * scale, y * scale, z * scale);
                    if (v > 0.5 && v < 0.6) {
                        let pt = {
                            x: ((x - hcount) / count) * range,
                            y: ((y - hcount) / count) * range,
                            z: ((z - hcount) / count) * range,
                        };
                        pt.x += (r()-0.5) * nudge;
                        pt.y += (r()-0.5) * nudge;
                        pt.z += (r()-0.5) * nudge;
                        points.push(pt);
                    }
                }
            }
        }
        for (let i=0; i<3000; ++i) {
            points.push({
                x: (r()-0.5) * range,
                y: (r()-0.5) * range,
                z: (r()-0.5) * range,
            });
        }

        console.log(points.length);
        sparks.drawPoints(points);

        return sparks.build({
            transform: Graph.projectPlane(1)
        });
    }
});

export default Background;