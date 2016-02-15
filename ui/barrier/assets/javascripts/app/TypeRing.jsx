import Graph from 'lib/Graph';
import TypeChar from 'app/TypeChar';
import ThreeGroup from 'lib/ThreeGroup';
import ThreeRender from 'lib/ThreeRender';

var TypeRing = React.createClass({
    mixins: [
        ThreeRender
    ],

    handlePressed: function (row, col, chr) {
        if (this.props.onPressed) {
            this.props.onPressed(row, col, chr);
        }
    },

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
                chr={chr}
                position-x={offset}
                onPressed={this.handlePressed.bind(this, this.props.row, i, chr)} />;
        })}</ThreeGroup>;
    }
});

export default TypeRing;