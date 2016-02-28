import Graph from 'lib/Graph';
import ThreeRender from 'lib/ThreeRender';

var LogoLabel = React.createClass({
    mixins: [
        ThreeRender
    ],

    animate3D: function (delta, anim, obj) {
        anim.y = (anim.y || parseFloat(this.props['position-y']));
        anim.angle = (anim.angle || 0) + delta;
        obj.position.y = anim.y + Math.sin(anim.angle) * 6;
    },

    render3D: function () {
        return Graph.genText({
            ax: this.props.center ? 0.5 : 0,
            scale: 3,
            font: 'LOGO',
            text: this.props.text || '',
            pos: [ 0, 0, 0 ],
            nudge: [ 0, 0, 0 ]
        });
    }
});

export default LogoLabel;