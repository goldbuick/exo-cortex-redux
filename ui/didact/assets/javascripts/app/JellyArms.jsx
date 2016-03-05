import Graph from 'lib/Graph';
import Animate from 'lib/Animate';
import ThreeRender from 'lib/ThreeRender';
import ExoStore from 'app/ExoStore';

var JellyArms = React.createClass({
    mixins: [
        ThreeRender,
        Reflux.connect(ExoStore, 'exo'),
    ],

    animate3D: function (delta, anim, obj) {
        let animRoot = Animate.subAnim(anim, 'root');
        animRoot.angle = (animRoot.angle || 0) + delta;
        obj.userData.root.rotation.y = animRoot.angle;
    },

    drawRoot: function () {
        let skip,
            radius,
            root = new Graph(),
            r = alea('jelly-arms-root');

        // for (let i=0; i<4; ++i) {
        //     radius = 128 + r() * 128;
        //     skip = Math.round(r() * 16);
        //     root.drawLoopR(0, 0, i * 10, 32, radius, r, 0.3, skip, 0, 0, r() * Math.PI * 2);
        //     root.drawLoopR(0, 0, i * -10, 32, radius, r, 0.3, skip, 0, 0, r() * Math.PI * 2);
        // }

        let count = 5;
        for (let i=0; i<count; ++i) {
            radius = 16 + r() * (count-i) * 64;
            skip = Math.round(r() * 16);
            root.drawSwipe(0, 0, i * -16, 64, radius, 6 + r() * 12, skip, 0, 0, r() * Math.PI * 2);
        }

        return root.build({
            transform: Graph.projectPlane(1)
        });
    },

    render3D: function () {
        let base = new THREE.Group(),
            r = alea('jelly-arms');

        base.userData.root = this.drawRoot();
        base.userData.root.rotation.x = 0.4;
        base.add(base.userData.root);

        let label = Graph.genText({
            text: 'ui-facade',
            pos: [ 0, 128, 0 ], 
            nudge: [ 0, 0, 0 ],
            font: 'OCRA'
        });
        base.add(label);

        return base;
    }
});

export default JellyArms;
