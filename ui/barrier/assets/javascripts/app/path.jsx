import Graph from 'lib/Graph';
import ThreeRender from 'lib/ThreeRender';

var Logo = React.createClass({
    mixins: [
        ThreeRender
    ],

    animate3D: function (delta, anim, obj) {
        anim.angle = (anim.angle || (Math.random() * Math.PI)) + delta;
        obj.position.z = Math.sin(anim.angle) * 16;
        obj.rotation.x = Math.sin(anim.angle) * 0.1;
        obj.position.y = (anim.y || 0);

        if (this.props.complete && anim.tween === undefined) {
            anim.tween = new TWEEN.Tween(anim)
                .to({ y: -1400 }, 500)
                .easing(TWEEN.Easing.Back.InOut)
                .start();
        }
    },

    render3D: function () {
        let r = alea('barrier-plate'),
            sigil = new Graph();

        let r1 = [], r2 = [], r3 = [], r4 = [], r5 = [], r6 = [];
        for (let i=0; i<9; ++i) {
            r1.push(r());
            r2.push(r());
            r3.push(r());
            r4.push(r());
            r5.push(r());
            r6.push(r());
        }
        
        let step = 300,
            points = this.props.path.map(point => {
                return {
                    x: (1 - point.row) * step,
                    y: (1 - point.col) * step
                };
            });

        points.forEach((point, index) => {
            let c = Math.round(2 + r1[index] * 2),
                radius = 32 + r2[index] * 32;

            for (let i=0; i<c; ++i) {
                let step = 8,
                    sides = 32,
                    start = r5[index] * Math.PI * 2,
                    front = Math.floor(r3[index+i] * step),
                    back = Math.floor(r4[index+i] * step);
                sigil.drawSwipe(point.x, point.y, i * -3, sides, radius, 6,
                    front, back, -0.8, start + c * 0.1);
                radius += 8;
            }
        });

        for (let s=-2; s<=2; ++s) {
            sigil.drawLine(points.map((point, index) => {
                return {
                    x: point.x + s,
                    y: point.y - s,
                    z: s
                };
            }));
        }
        
        return sigil.build({
            transform: Graph.projectFacePlane(1)
        });        
    }
});

export default Logo;