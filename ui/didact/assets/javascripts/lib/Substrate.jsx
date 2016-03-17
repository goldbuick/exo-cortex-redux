import Glyph from 'lib/viz/Glyph';
import ThreeRender from 'lib/ThreeRender';
import 'lib/threejs/SimplexNoise';

var Substrate = React.createClass({
    mixins: [
        ThreeRender
    ],

    getVelocity: function () {
        return this.props.velocity || 1;
    },

    animate3D: function (delta, anim, obj) {
        anim.offset = (anim.offset || 0) + (delta * this.getVelocity());

        let max = 5000,
            scale = 0.027,
            verts = obj.geometry.attributes.position.array;

        for (let i=0; i < verts.length; i += 3) {
            let x = verts[i],
                y = verts[i+1],
                d = Math.max(1, Math.sqrt(x * x + y * y) - 100),
                r = 1 - (d / max),
                v = Math.sin(d * r * scale - anim.offset);
            verts[i + 2] = v * 80 * r;
        }

        obj.geometry.attributes.position.needsUpdate = true;
    },

    render3D: function () {
        let detail = 32,
            range = 2000,
            geometry = new THREE.PlaneBufferGeometry(range * 3, range, detail * 3, detail),
            material = new THREE.MeshBasicMaterial({
                wireframe: true,
                color: Glyph.baseColor
            });

        let plane = new THREE.Mesh(geometry, material);
        plane.position.z = -600;
        plane.position.y = -800;
        plane.rotation.x = Math.PI * -0.5;

        return plane;
    }
});

export default Substrate;