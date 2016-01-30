import Graph from 'lib/graph';
import UiButton from 'lib/ui-button';
import ThreeRender from 'lib/three-render';

var TestButton = React.createClass({
    mixins: [
        UiButton,
        ThreeRender
    ],

    handleButton: function (anim, obj, action, pt) {
        switch (action) {
            case 'out': anim.targetScale = 1; break;
            case 'click':
            case 'over': anim.targetScale = 2; break;
            case 'pressed': anim.targetScale = 1.5; break;
        }
    },

    animate3D: function (delta, anim, obj) {
        anim.targetScale = anim.targetScale || 1;
        let scaleInc = (anim.targetScale - obj.scale.x) * delta * 10;
        obj.scale.x += scaleInc;
        obj.scale.y += scaleInc;
        obj.scale.z += scaleInc;
    },

    render3D: function () {
        let geometry = new THREE.SphereGeometry(32, 8, 8),
            material = new THREE.MeshBasicMaterial({ color: 0xffff00 });

        return new THREE.Mesh(geometry, material);
    }
});

export default TestButton;