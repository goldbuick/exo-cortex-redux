import Graph from 'lib/Graph';
import ThreeRender from 'lib/ThreeRender';

var JellyBase = React.createClass({
    mixins: [
        ThreeRender
    ],

    animate3D: function (delta, anim, obj) {
        anim.angle = (anim.angle || 0) + (delta * 0.07);
        obj.rotation.y = anim.angle;
    },

    drawRing: function (r, jelly, index, y, radius) {
        let gap = 8,
            drift = 0.1,
            sides = 256,
            bump = r() * Math.PI * 2;
        jelly.drawLoopR(0, 0, y - gap * r(), sides, radius + r(), r, 0.3, 0, 0, drift + r() * 0.5, bump + r());
        jelly.drawLoopR(0, 0, y - gap * r(), sides, radius + r(), r, 0.3, 0, 0, drift + r() * 0.5, bump + r());
        jelly.drawSwipe(0, 0, y - gap * r(), sides, radius + r(), 4, 0, 0, drift + r() * 0.5, bump + r());
        jelly.drawSwipe(0, 0, y + gap * r(), sides, radius + r(), 6, 0, 0, drift + r() * 0.5, bump + r());
        jelly.drawLoopR(0, 0, y + gap * r(), sides, radius + r(), r, 0.3, 0, 0, drift + r() * 0.5, bump + r());
        jelly.drawLoopR(0, 0, y + gap * r(), sides, radius + r(), r, 0.3, 0, 0, drift + r() * 0.5, bump + r());
        return bump;
    },

    render3D: function () {
        let r = alea('ashdifu-jelly-base-asdfwejeioioj'),
            jelly = new Graph();

        let count = 5,
            step = -64,
            spins = [],
            astep = (Math.PI * 0.5) / count,
            radius = rad => 128 + Math.sin(rad * astep) * 512;

        for (let i=0; i<count; ++i) {
            spins.push(this.drawRing(r, jelly, i, i * step, radius(i)));
        }

        jelly = jelly.build({
            transform: Graph.projectPlane(1)
        });

        let names = [ 'vault', 'codex', 'ui-facade', 'ui-barrier', 'ui-didact' ];
        for (let i=0; i<count; ++i) {
            let service = new Graph(),
                skip,
                y = i * step,
                rad = -radius(i);

            skip = Math.round(r() * 16);
            service.drawSwipe(y, rad, 0, 32, 12 - r() * 2, 4 + r(), skip, 0, 0, r() * Math.PI * 2);
            
            skip = Math.round(r() * 16);
            service.drawSwipe(y, rad, 0, 32, 32, 6 + r(), skip, 0, 0, r() * Math.PI * 2);
            
            skip = Math.round(r() * 16);
            service.drawLoopR(y, rad, 5, 32, 42 + r() * 2, r, 0.3, skip, 0, 0, r() * Math.PI * 2);
            service.drawLoopR(y, rad, -5, 32, 42 + r() * 2, r, 0.3, skip, 0, 0, r() * Math.PI * 2);

            skip = Math.round(r() * 16);
            service.drawLoopR(y, rad, 5, 32, 20 + r() * 2, r, 0.3, skip, 0, 0, r() * Math.PI * 2);
            service.drawLoopR(y, rad, -5, 32, 20 + r() * 2, r, 0.3, skip, 0, 0, r() * Math.PI * 2);
            service.drawLoopR(y, rad, 15, 32, 16 + r() * 2, r, 0.3, skip, 0, 0, r() * Math.PI * 2);
            service.drawLoopR(y, rad, -15, 32, 16 + r() * 2, r, 0.3, skip, 0, 0, r() * Math.PI * 2);
            service.drawLoopR(y, rad, 20, 32, 12 + r() * 2, r, 0.3, skip, 0, 0, r() * Math.PI * 2);
            service.drawLoopR(y, rad, -20, 32, 12 + r() * 2, r, 0.3, skip, 0, 0, r() * Math.PI * 2);
            service.drawLoopR(y, rad, 25, 32, 10 + r() * 2, r, 0.3, skip, 0, 0, r() * Math.PI * 2);
            service.drawLoopR(y, rad, -25, 32, 10 + r() * 2, r, 0.3, skip, 0, 0, r() * Math.PI * 2);

            service = service.build({
                transform: Graph.projectFacePlane(1)
            });

            service.rotation.y = (Math.PI * -0.5) - spins[i];
            jelly.add(service);

            let label = Graph.genText({
                ax: 0.5,
                ay: 0.8,
                scale: 0.85,
                text: names[i],
                pos: [ 0, i * step, radius(i) + 64 ], 
                nudge: [ 0, 0, 0 ],
                font: 'OCRA'
            });
            label.rotation.y = (Math.PI * 2) - spins[i];
            jelly.add(label);
        }

        jelly.rotation.x = 0.4;
        jelly.rotation.z = 0.05;
        return jelly;
    }
});

export default JellyBase;