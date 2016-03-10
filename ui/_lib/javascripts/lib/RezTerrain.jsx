import ThreeRender from 'lib/ThreeRender';
import 'lib/threejs/OBJLoader';
import 'lib/threejs/TessellateModifier';

let normal = new THREE.TextureLoader().load('media/lib/TERRAIN.A.NORMAL.png'),
    diffuse = new THREE.TextureLoader().load('media/lib/TERRAIN.A.DIFFUSE.png');

let RezTerrain = React.createClass({
    mixins: [
        ThreeRender
    ],

    animate3D: function (delta, anim, obj) {
        anim.angle = (anim.angle || 0) + delta;
        obj.rotation.y = 0.795 + Math.cos(anim.angle) * 0.005;
    },

    render3D: function () {
        let base = new THREE.Group();
        base.rotation.x = 0.2;
        base.position.z = -3800;
        base.position.y = -1900;

        let loader = new THREE.OBJLoader().load('media/lib/TERRAIN.A.model', obj => {
            let terrain = obj.children[0];

            let geometry = new THREE.Geometry().fromBufferGeometry(terrain.geometry);
            geometry.mergeVertices();
            
            // let tess = new THREE.TessellateModifier(1);
            // tess.modify(geometry);
            geometry.computeFaceNormals();
            geometry.computeVertexNormals();
            terrain.geometry = new THREE.BufferGeometry().fromGeometry(geometry);

            [ normal, diffuse ].forEach(tex => {
                tex.anisotropy = window.maxAni;
                tex.needsUpdate = true;
            });

            terrain.material = new THREE.MeshPhongMaterial({
                map: diffuse,
                shininess: 4,
                color: 0xffffff,
                normalMap: normal,
                specular: 0xffffff,
                shading: THREE.SmoothShading
            });

            base.add(terrain);
        });

        return base;
    }
});

export default RezTerrain;