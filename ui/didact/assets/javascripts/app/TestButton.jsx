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
    },

    render3D: function () {
        let button = new Graph();

        button.drawCircle(0, 0, 0, 32, 100, undefined, undefined, undefined, undefined, true);
        button.drawLoop(0, 0, 0, 32, 100);
        return button.build({
            transform: Graph.projectFacePlane(1)
        });
    }
});

export default TestButton;