import Logo from 'app/logo';
import Plate from 'app/plate';
import TypeRing from 'app/type-ring';
import Background from 'app/background';
import ThreeScene from 'lib/three-scene';

var Page = React.createClass({
    mixins: [
    ],

    getInitialState: function () {
        return {
            rows: [ 'W^U', '#b%', 'G&X' ]
        };
    },
    
    render: function () {
        let step = -300,
            offset = 400 + -step;

        return <ThreeScene onCreate={this.handleCreate} onPointer={this.handlePointer}>
            <Background />
            <Plate />
            <Logo />
            {this.state.rows.map((chrs, i) => {
                offset += step;
                return <TypeRing key={'ring' + i} offset={offset} chars={chrs} />
            })}
        </ThreeScene>;
    },

    handleCreate: function (render) {
        render.camera.position.z = 1440;
    },

    handlePointer: function (id, pressed, x, y, intersects) {
        if (intersects.length === 0 ||
            intersects[0].object === undefined ||
            intersects[0].object.name.length === 0) return;
        console.log(intersects[0].object.name);
    }

});

export default Page;
