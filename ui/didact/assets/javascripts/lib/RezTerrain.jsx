import ThreeRender from 'lib/ThreeRender';
import 'lib/threejs/OBJLoader';

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
        base.rotation.x = 0.1;
        base.position.z = -3500;
        base.position.y = -2000;

        let loader = new THREE.OBJLoader().load('media/lib/TERRAIN.A.model', obj => {
            let terrain = obj.children[0];
            terrain.scale.multiplyScalar(1);

            let geometry = new THREE.Geometry().fromBufferGeometry(terrain.geometry);
            geometry.computeFaceNormals();
            geometry.mergeVertices();
            geometry.computeVertexNormals();
            terrain.geometry = new THREE.BufferGeometry().fromGeometry(geometry);

            [ normal, diffuse ].forEach(tex => {
                tex.anisotropy = window.maxAni;
                tex.minFilter = THREE.LinearFilter;
            });

            terrain.material = new THREE.MeshPhongMaterial({
                map: diffuse,
                bumpScale: 32,
                shininess: 50,
                bumpMap: normal,
                color: 0x888888,
                specular: 0x444444,
                shading: THREE.SmoothShading
            });

            base.add(terrain);
        });

        return base;
    }
});

export default RezTerrain;