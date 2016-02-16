import Graph from 'lib/Graph';
import ThreeRender from 'lib/ThreeRender';

var Logo = React.createClass({
    mixins: [
        ThreeRender
    ],

    animate3D: function (delta, anim, obj) {
        anim.y = (anim.y || 600);
        anim.angle = (anim.angle || 0) + delta;
        obj.position.y = anim.y + Math.sin(anim.angle) * 4;
        obj.rotation.x = Math.sin(anim.angle) * 0.01;

        if (this.props.complete && anim.tween === undefined) {
            anim.tween = new TWEEN.Tween(anim)
                .to({ y: 1 }, 600)
                .easing(TWEEN.Easing.Back.InOut)
                .start();
        }
    },

    render3D: function () {
        let group = new THREE.Group();

        group.add(Graph.genText({
            scale: 3,
            font: 'LOGO',
            text: 'exoBARRIER',
            pos: [ 0, 128, 64 ],
            nudge: [ 8, 0, 0 ]
        }));
        group.add(Graph.genText({
            scale: 2,
            text: this.props.passcode,
            pos: [ 0, 16, -64 ],
            nudge: [ 8, 0, 0 ]
        }));

        return group;
    }
});

export default Logo;