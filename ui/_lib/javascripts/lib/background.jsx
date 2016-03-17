import Etch from 'lib/viz/Etch';
import ThreeRender from 'lib/ThreeRender';
import 'lib/threejs/SimplexNoise';

let Background = React.createClass({
    mixins: [
        ThreeRender
    ],

    animate3D: function (delta, anim, obj) {
        anim.angle = (anim.angle || 0) + delta * 0.007;
        // obj.rotation.x = Math.cos(anim.angle);
        // obj.rotation.y = Math.cos(anim.angle) + Math.sin(-anim.angle);
        obj.rotation.z = Math.sin(anim.angle);
    },

    render3D: function () {
        let r = alea(this.props.seed || 'star-speckle-background'),
            points = [ ],
            sparks = new Etch();

        let nudge = 512,
            count = 50,
            range = 18000,
            scale = 0.051,
            hrange = 1700,
            hcount = count * 0.5;
        let rr = new SimplexNoise({ random: r }); 
        for (let x=0; x<count; ++x) {
            for (let y=0; y<count; ++y) {
                for (let z=0; z<count; ++z) {
                    let v = rr.noise3d(x * scale, y * scale, z * scale);
                    if (v > 0.5 && v < 0.6) {
                        let pt = {
                            x: ((x - hcount) / count) * hrange,
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
        for (let i=0; i<2000; ++i) {
            points.push({
                x: (r()-0.5) * hrange,
                y: (r()-0.5) * range,
                z: (r()-0.5) * range,
            });
        }

        sparks.drawPoints(points);

        sparks = sparks.build({
            transform: Etch.projectPlane(1)
        });

        sparks.position.z = -6000;

        return sparks;
    }
});

export default Background;