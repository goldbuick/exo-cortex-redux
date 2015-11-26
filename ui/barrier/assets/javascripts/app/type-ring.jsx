import Graph from 'lib/graph';
import TypeChar from 'app/type-char';
import ThreeGroup from 'lib/three-group';
import ThreeRender from 'lib/three-render';

var TypeRing = React.createClass({
    mixins: [
        ThreeRender
    ],

    animate3D: function (delta, anim, obj) {
    },

    render3D: function () {
        let step = 300,
            offset = step * -2,
            chars = this.props.chars.split('');

        return <ThreeGroup position-y={this.props.offset}>{chars.map((chr, i) => {
            offset += step;
            return <TypeChar
                key={'char-' + i}
                row={this.props.row}
                col={i}
                chr={chr}
                position-x={offset} />;
        })}</ThreeGroup>;
    }
});

export default TypeRing;