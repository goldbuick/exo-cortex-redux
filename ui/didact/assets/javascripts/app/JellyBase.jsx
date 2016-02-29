import Graph from 'lib/Graph';
import Animate from 'lib/Animate';
import ThreeRender from 'lib/ThreeRender';
import ExoStore from 'app/ExoStore';

var JellyBase = React.createClass({
    mixins: [
        ThreeRender,
        Reflux.connect(ExoStore, 'exo'),
    ],

    animate3D: function (delta, anim, obj) {
        for (let i=0; i<obj.children.length; ++i) {
            let service = obj.children[i];
            let _anim = Animate.subAnim(anim, service.userData.name);
            _anim.angle = Animate.clampAngle((_anim.angle || service.userData.angle) + (delta * service.userData.spinRate));
            service.rotation.y = _anim.angle;
            service.position.y = service.userData.yOffset + Math.cos(_anim.angle) * 4;
            let spinner = service.userData.hub.userData.spinner;
            _anim.spinAngle = Animate.clampAngle((_anim.spinAngle || 0) + delta);
            spinner.rotation.z = _anim.spinAngle;
        }
    },

    drawRing: function (r, jelly, radius) {
        let skip,
            gap = 16,
            sides = 256,
            _sides = sides * 0.5;
        
        skip = Math.round(r() * _sides);
        jelly.drawLoopR(0, 0, -gap, sides, radius * (2 + r()), 
            r, 0.3, skip, 0, 0, r() * Math.PI * 2);
        
        skip = Math.round(r() * _sides);
        jelly.drawLoopR(0, 0, gap, sides, radius * (2 + r()), 
            r, 0.3, skip, 0, 0, r() * Math.PI * 2);
        
        skip = Math.round(r() * _sides);
        jelly.drawLoopR(0, 0, 0, sides, radius * (2 + r()), 
            r, 0.3, skip, 0, 0, r() * Math.PI * 2);
        
        skip = Math.round(r() * _sides);
        jelly.drawSwipe(0, 0, -gap, sides, radius + r() * 16, 
            6 + r() * 12, skip, 0, 0, r() * Math.PI * 2);
        
        skip = Math.round(r() * _sides);
        jelly.drawSwipe(0, 0, gap, sides, radius + r() * 16, 
            6 + r() * 12, skip, 0, 0, r() * Math.PI * 2);

        skip = Math.round(r() * _sides);
        jelly.drawSwipe(0, 0, 0, sides, radius + r() * 16, 
            6 + r() * 12, skip, 0, 0, r() * Math.PI * 2);
    },

    drawAnchor: function (r, radius, name) {
        let skip,
            service = new Graph();

        let hub = new THREE.Group();
        hub.position.x = -radius;

        skip = Math.round(r() * 16);
        service.drawSwipe(0, 0, 0, 32, 12 - r() * 2, 4 + r(), skip, 0, 0, r() * Math.PI * 2);
        
        skip = Math.round(r() * 16);
        service.drawSwipe(0, 0, 0, 32, 52, 6 + r(), skip, 0, 0, r() * Math.PI * 2);
        
        skip = Math.round(r() * 16);
        service.drawLoopR(0, 0, 5, 32, 42 + r() * 2, r, 0.3, skip, 0, 0, r() * Math.PI * 2);
        service.drawLoopR(0, 0, -5, 32, 42 + r() * 2, r, 0.3, skip, 0, 0, r() * Math.PI * 2);

        skip = Math.round(r() * 16);
        service.drawLoopR(0, 0, 5, 32, 20 + r() * 2, r, 0.3, skip, 0, 0, r() * Math.PI * 2);
        service.drawLoopR(0, 0, -5, 32, 20 + r() * 2, r, 0.3, skip, 0, 0, r() * Math.PI * 2);
        service.drawLoopR(0, 0, 15, 32, 16 + r() * 2, r, 0.3, skip, 0, 0, r() * Math.PI * 2);
        service.drawLoopR(0, 0, -15, 32, 16 + r() * 2, r, 0.3, skip, 0, 0, r() * Math.PI * 2);
        service.drawLoopR(0, 0, 20, 32, 12 + r() * 2, r, 0.3, skip, 0, 0, r() * Math.PI * 2);
        service.drawLoopR(0, 0, -20, 32, 12 + r() * 2, r, 0.3, skip, 0, 0, r() * Math.PI * 2);
        service.drawLoopR(0, 0, 25, 32, 10 + r() * 2, r, 0.3, skip, 0, 0, r() * Math.PI * 2);
        service.drawLoopR(0, 0, -25, 32, 10 + r() * 2, r, 0.3, skip, 0, 0, r() * Math.PI * 2);

        service = service.build({
            transform: Graph.projectFacePlane(1)
        });
        hub.add(service);
        hub.userData.spinner = service;

        let label = Graph.genText({
            ax: 0.5,
            ay: 0.8,
            scale: 0.85,
            text: name,
            pos: [ 0, 0, 64 ], 
            nudge: [ 0, 0, 0 ],
            font: 'OCRA'
        });
        label.rotation.y = Math.PI * 1.5;
        hub.add(label);

        return hub;
    },

    drawService: function (name, radius) {
        let r = alea('jelly-base-' + name),
            jelly = new Graph();

        this.drawRing(r, jelly, radius);
        jelly = jelly.build({
            transform: Graph.projectPlane(1)
        });

        let hub = this.drawAnchor(r, radius, name);
        jelly.add(hub);
        jelly.userData.hub = hub;

        return jelly;
    },

    render3D: function () {
        let base = new THREE.Group(),
            r = alea('jelly-base-all'),
            names = this.state.exo.services;

        let step = -100,
            astep = (Math.PI * 0.5) / names.length,
            radius = rad => 128 + Math.sin(rad * astep) * 512;

        for (let i=0; i<names.length; ++i) {
            let service = this.drawService(names[i], radius(i));
            service.userData.name = names[i];
            service.userData.yOffset = i * step;
            service.userData.angle = Math.PI * 2 * r();
            service.userData.spinRate = r() <= 0.5 ? r() : -r();
            service.userData.spinRate /= 5;
            base.add(service);
        }

        base.rotation.x = 0.4;
        return base;
    }
});

export default JellyBase;
