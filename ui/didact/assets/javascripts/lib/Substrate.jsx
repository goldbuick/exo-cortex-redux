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
            scale = 0.00375;

        anim.offset = (anim.offset || 0) + (delta * 0.04);

        let verts = obj.geometry.attributes.position.array;
        for (let i=0; i < verts.length; i += 3) {
            verts[i + 2] = rr.noise3d(verts[i] * scale, verts[i+1] * scale, anim.offset) * 64;
        }

        obj.geometry.attributes.position.needsUpdate = true;
    },

    render3D: function () {
        let geometry = new THREE.PlaneBufferGeometry(5000, 2000, 32, 16),
            material = new THREE.MeshBasicMaterial({
                color: Glyph.baseColor,
                side: THREE.DoubleSide,
                wireframe: true
            });

        let plane = new THREE.Mesh(geometry, material);
        plane.position.y = -700;
        plane.rotation.x = Math.PI * -0.5;

        return plane;
    }
});

export default Substrate;