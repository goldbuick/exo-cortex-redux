import ThreeRender from 'lib/three-render';
import Graph from 'lib/graph';

var Logo = React.createClass({
    mixins: [
        ThreeRender
    ],

    animate3D: function (delta, anim, obj) {
        anim.angle = (anim.angle || 0) + delta;
        obj.position.y = 600 + Math.sin(anim.angle) * 4;
        obj.rotation.x = Math.sin(anim.angle) * 0.01;
    },

    render3D: function () {
        let group = new THREE.Group();
        group.add(Graph.genText({
            scale: 3,
            logo: true,
            text: 'exoBARRIER',
            pos: [ 0, 100, 64 ],
            nudge: [ 8, 0, 0 ]
        }));
        group.add(Graph.genText({
            scale: 4,
            logo: true,
            text: '---------',
            pos: [ 0, 0, -64 ],
            nudge: [ 8, 0, 0 ]
        }));

        return group;
    }
});

export default Logo;