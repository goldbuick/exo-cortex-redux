import Graph from 'lib/Graph';
import ThreeRender from 'lib/ThreeRender';
import UiButton from 'lib/UiButton';

var TypeChar = React.createClass({
    mixins: [
        UiButton,
        ThreeRender
    ],

    handleButton: function (anim, obj, action, pt) {
        if (action === 'pressed' && this.props.onPressed) {
            this.props.onPressed();
        }
    },

    animate3D: function (delta, anim, obj) {
        if (!obj.text) return;
        anim.angle = (anim.angle || (Math.random() * Math.PI)) + delta;
        obj.position.z = Math.sin(anim.angle) * 16;
        obj.rotation.x = Math.sin(anim.angle) * 0.1;
    },

    render3D: function () {
        let graph = new Graph();

        graph.drawRect(-35, 0, 200, 200, 0, true);

        graph = graph.build({
            transform: Graph.projectFacePlane(1)
        });

        graph.add(Graph.genText({
            scale: 3,
            text: this.props.chr,
            pos: [ 0, 0, 0 ],
            nudge: [ 0, 0, 0 ]
        }));

        return graph;
    }
});

export default TypeChar;