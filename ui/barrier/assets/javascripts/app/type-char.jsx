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
        let chr = Graph.genText({
            scale: 6,
            logo: true,
            text: this.props.chr,
            pos: [ 0, 0, 0 ],
            nudge: [ 8, 0, 0 ]
        }, obj => {
            chr.text = obj;
            chr.text.name = this.props.chr;
        });
        chr.name = this.props.chr;
        chr.position.x = this.props.offset;
        return chr;
    }
});

export default TypeChar;