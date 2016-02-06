import Graph from 'lib/Graph';
import UiButton from 'lib/UiButton';
import ThreeRender from 'lib/ThreeRender';

var TestButton = React.createClass({
    mixins: [
        UiButton,
        ThreeRender
    ],

    handleButton: function (anim, obj, action, pt) {
        switch (action) {
            case 'out': anim.targetScale = 1; break;
            case 'over':
            case 'click': anim.targetScale = 1.5; break;
            case 'pressed': anim.targetScale = 0.8; break;
        }
    },

    animate3D: function (delta, anim, obj) {
        anim.targetScale = anim.targetScale || 1;
        let scaleInc = (anim.targetScale - obj.scale.x) * delta * 8;
        obj.scale.x += scaleInc;
        obj.scale.y += scaleInc;
        obj.scale.z += scaleInc;
        anim.rotation = anim.rotation || (alea(obj.position.x)() * Math.PI * 2);
        anim.rotationSpeed = anim.rotationSpeed || (0.5 - alea(obj.position.x)());
        anim.rotation += anim.rotationSpeed * delta;
        obj.rotation.z = anim.rotation;
    },

    render3D: function () {
        let r = alea(),
            button = new Graph();

        button.drawCircle(0, 0, 0, 32, 100, 
            undefined, undefined, undefined, undefined, this.props.fill === undefined);
        button.drawLoop(0, 0, 0, 32, 100);
        button.drawLoopR(0, 0, 0, 32, 108, r, 0.5, 0, 8, 1);
        button.drawLoopR(0, 0, 0, 32, 116, r, 0.5, 2, 12, 2);
        button.drawLoopR(0, 0, 0, 32, 124, r, 0.5, 4, 16, 3);

        return button.build({
            transform: Graph.projectFacePlane(1)
        });
    }
});

export default TestButton;