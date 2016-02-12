import Glyph from 'lib/Glyph';
import ThreeRender from 'lib/ThreeRender';
import 'lib/threejs/SimplexNoise';

var Substrate = React.createClass({
    mixins: [
        ThreeRender
    ],

    animate3D: function (delta, anim, obj) {
        let r = alea(this.props.seed || 'neon-wave'),
            rr = new SimplexNoise({ random: r }),
            scale = 0.00295;

        anim.offset = (anim.offset || 0) + (delta * 0.2);

        let verts = obj.geometry.attributes.position.array;
        for (let i=0; i < verts.length; i += 3) {
            let x = verts[i],
                y = verts[i+1],
                a = rr.noise3d(x * scale, y * scale, anim.offset),
                v = Math.sin(Math.sqrt(x * x + y * y) * 0.01) +
                    Math.sin((x + y) * 0.005);
            verts[i + 2] = v * 48 + a * 32;
        }

        obj.geometry.attributes.position.needsUpdate = true;
    },

    render3D: function () {
        let detail = 24,
            range = 1900,
            geometry = new THREE.PlaneBufferGeometry(range * 3, range, detail * 3, detail),
            material = new THREE.MeshBasicMaterial({
                color: Glyph.baseColor,
                side: THREE.DoubleSide,
                wireframe: true
            });

        let plane = new THREE.Mesh(geometry, material);
        plane.position.z = -600;
        plane.position.y = -800;
        plane.rotation.x = Math.PI * -0.5;

        return plane;
    }
});

export default Substrate;