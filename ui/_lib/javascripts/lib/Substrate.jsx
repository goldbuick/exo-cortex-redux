import Glyph from 'lib/Glyph';
import ThreeRender from 'lib/ThreeRender';
import 'lib/threejs/SimplexNoise';

var Substrate = React.createClass({
    mixins: [
        ThreeRender
    ],

    animate3D: function (delta, anim, obj) {
    },

    render3D: function () {
        let r = alea(this.props.seed || 'neon-wave'),
            rr = new SimplexNoise({ random: r }),
            scale = 0.00217;

        let geometry = new THREE.PlaneBufferGeometry(5000, 2000, 32, 16),
            material = new THREE.MeshBasicMaterial({
                color: Glyph.baseColor,
                side: THREE.DoubleSide,
                wireframe: true
            });

        let verts = geometry.attributes.position.array;
        for (let i=0; i < verts.length; i += 3) {
            verts[i + 2] = rr.noise3d(verts[i] * scale, verts[i+1] * scale, 0) * 64;
        }
        geometry.rotateX(Math.PI / -2);
        console.log(geometry);

        let plane = new THREE.Mesh(geometry, material);
        plane.position.y = -700;
        return plane;
    }
});

export default Substrate;