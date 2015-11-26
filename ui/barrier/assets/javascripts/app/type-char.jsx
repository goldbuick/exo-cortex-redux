import Graph from 'lib/graph';
import ThreeRender from 'lib/three-render';

var TypeChar = React.createClass({
    mixins: [
        ThreeRender
    ],

    animate3D: function (delta, anim, obj) {
        if (!obj.text) return;
        anim.angle = (anim.angle || (Math.random() * Math.PI)) + delta;
        obj.position.z = Math.sin(anim.angle) * 16;
        obj.rotation.x = Math.sin(anim.angle) * 0.1;
    },

    render3D: function () {
        return Graph.genText({
            scale: 3,
            text: this.props.chr,
            pos: [ 0, 0, 0 ],
            nudge: [ 0, 0, 0 ]
        }, (obj, text) => {
            obj.text = text;
            obj.text.userData.chr = this.props.chr;
            obj.text.userData.row = this.props.row;
            obj.text.userData.col = this.props.col;
        });
    }
});

export default TypeChar;