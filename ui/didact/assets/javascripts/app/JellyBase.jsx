import Graph from 'lib/Graph';
import ThreeRender from 'lib/ThreeRender';

var JellyBase = React.createClass({
    mixins: [
        ThreeRender
    ],

    animate3D: function (delta, anim, obj) {
        for (let i=0; i<obj.children.length; ++i) {
            let service = obj.children[i];
            let _anim = this.subAnim(anim, service.userData.name);
            _anim.angle = this.clampAngle((_anim.angle || 0) + (delta * service.userData.spinRate));
            service.rotation.y = _anim.angle;
            service.position.y = service.userData.yOffset + Math.cos(_anim.angle) * 4;
        }
    },

    drawRing: function (r, jelly, radius) {
        let gap = 8,
            drift = 0.1,
            sides = 256,
            bump = r() * Math.PI * 2;
        jelly.drawLoopR(0, 0, -gap * r(), sides, radius + r(), r, 0.3, 0, 0, drift + r() * 0.5, bump + r());
        jelly.drawLoopR(0, 0, -gap * r(), sides, radius + r(), r, 0.3, 0, 0, drift + r() * 0.5, bump + r());
        jelly.drawSwipe(0, 0, -gap * r(), sides, radius + r(), 4 + r() * 4, 0, 0, drift + r() * 0.5, bump + r());
        jelly.drawSwipe(0, 0, gap * r(), sides, radius + r(), 4 + r() * 4, 0, 0, drift + r() * 0.5, bump + r());
        jelly.drawLoopR(0, 0, gap * r(), sides, radius + r(), r, 0.3, 0, 0, drift + r() * 0.5, bump + r());
        jelly.drawLoopR(0, 0, gap * r(), sides, radius + r(), r, 0.3, 0, 0, drift + r() * 0.5, bump + r());
        return bump;
    },

    drawAnchor: function (r, jelly, radius, spin, name) {
        let service = new Graph(),
            rad = -radius;

        let skip = Math.round(r() * 16);
        service.drawSwipe(0, rad, 0, 32, 12 - r() * 2, 4 + r(), skip, 0, 0, r() * Math.PI * 2);
        
        skip = Math.round(r() * 16);
        service.drawSwipe(0, rad, 0, 32, 32, 6 + r(), skip, 0, 0, r() * Math.PI * 2);
        
        skip = Math.round(r() * 16);
        service.drawLoopR(0, rad, 5, 32, 42 + r() * 2, r, 0.3, skip, 0, 0, r() * Math.PI * 2);
        service.drawLoopR(0, rad, -5, 32, 42 + r() * 2, r, 0.3, skip, 0, 0, r() * Math.PI * 2);

        skip = Math.round(r() * 16);
        service.drawLoopR(0, rad, 5, 32, 20 + r() * 2, r, 0.3, skip, 0, 0, r() * Math.PI * 2);
        service.drawLoopR(0, rad, -5, 32, 20 + r() * 2, r, 0.3, skip, 0, 0, r() * Math.PI * 2);
        service.drawLoopR(0, rad, 15, 32, 16 + r() * 2, r, 0.3, skip, 0, 0, r() * Math.PI * 2);
        service.drawLoopR(0, rad, -15, 32, 16 + r() * 2, r, 0.3, skip, 0, 0, r() * Math.PI * 2);
        service.drawLoopR(0, rad, 20, 32, 12 + r() * 2, r, 0.3, skip, 0, 0, r() * Math.PI * 2);
        service.drawLoopR(0, rad, -20, 32, 12 + r() * 2, r, 0.3, skip, 0, 0, r() * Math.PI * 2);
        service.drawLoopR(0, rad, 25, 32, 10 + r() * 2, r, 0.3, skip, 0, 0, r() * Math.PI * 2);
        service.drawLoopR(0, rad, -25, 32, 10 + r() * 2, r, 0.3, skip, 0, 0, r() * Math.PI * 2);

        service = service.build({
            transform: Graph.projectFacePlane(1)
        });

        service.rotation.y = (Math.PI * -0.5) - spin;
        jelly.add(service);

        let label = Graph.genText({
            ax: 0.5,
            ay: 0.8,
            scale: 0.85,
            text: name,
            pos: [ 0, 0, radius + 64 ], 
            nudge: [ 0, 0, 0 ],
            font: 'OCRA'
        });
        label.rotation.y = (Math.PI * 2) - spin;
        jelly.add(label);
    },

    drawService: function (name, radius) {
        let r = alea('jelly-base-' + name),
            jelly = new Graph();

        let spin = this.drawRing(r, jelly, radius);
        jelly = jelly.build({
            transform: Graph.projectPlane(1)
        });

        this.drawAnchor(r, jelly, radius, spin, name);
        return jelly;
    },

    render3D: function () {
        let base = new THREE.Group(),
            names = [ 'vault', 'codex', 'ui-facade', 'ui-barrier', 'ui-didact' ];

        let step = -64,
            astep = (Math.PI * 0.5) / names.length,
            radius = rad => 128 + Math.sin(rad * astep) * 512;

        for (let i=0; i<names.length; ++i) {
            let service = this.drawService(names[i], radius(i));
            service.userData.name = names[i];
            service.userData.yOffset = i * step;
            service.userData.spinRate = ((1 + i) / names.length) - (Math.random() * 1.2);
            service.userData.spinRate /= 10;
            base.add(service);
            console.log(service.userData);
        }

        base.rotation.x = 0.4;
        base.rotation.z = 0.05;
        return base;
    }
});

export default JellyBase;