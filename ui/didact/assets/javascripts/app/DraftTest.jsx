import Draft from 'lib/viz/Draft';
import Animate from 'lib/Animate';
import ThreeRender from 'lib/ThreeRender';

var DraftTest = React.createClass({
    mixins: [
        ThreeRender
    ],

    getFlows: function (t) {
        let flows = [ ],
            count = 256,
            radius = 512,
            rr = Draft.noise('rando-c'),
            step = (Math.PI * 2) / (count-1);

        let angle = t * 2;
        for (let i=0; i < count; ++i) {
            let points = Draft.genFlow(rr, Math.cos(angle) * radius, Math.sin(angle) * radius, 0, 100, 64, t);
            flows.push(points);
            angle += step;
        }

        return flows;
    },

    animate3D: function (delta, anim, obj) {
        //*
        anim.toffset = (anim.toffset || 0) + delta * 0.1;
        let geometry = obj.children[1].geometry,
            position = geometry.getAttribute('position');

        let index = 0;
        this.getFlows(anim.toffset).forEach(points => {
            points.forEach(pt => {
                position.array[index++] = pt.x;
                position.array[index++] = pt.y;
                position.array[index++] = pt.z;
            });
        });
        position.needsUpdate = true;
        anim.angle = (anim.angle || 0) + delta * 0.25;
        obj.rotation.y = anim.angle * 0.5;
        /*/
        anim.angle = (anim.angle || 0) + delta * 0.25;
        // obj.rotation.x = anim.angle;
        obj.rotation.y = anim.angle * 0.25;
        //*/
    },

    render3D: function () {
        let r = alea('rando-b'),
            test = new Draft();

        /*
        let points = Draft.genTriGrid(0, 0, 0, 16, 16, 1, 64);

        points.forEach(pt => {
            let depth = (r() - 0.5) * 128;
            pt.z += depth;
            test.drawHexPod(pt.x, pt.y, pt.z, 8, 1 + Math.floor(r() * 3), 8);
        });

        Draft.genTracers(points, 16, 16, [
            3, 3, 12, 12
        ],[
            4, 3, 12, 15
        ],[
            5, 3, 13, 15
        ]).forEach(path => test.drawLine(path));
        /*/
        let count = 256,
            radius = 512;

        this.getFlows(0).forEach(points => test.drawLine(points));

        let points = Draft.genCircle(0, 0, 0, count, Draft.genValue(radius));
        test.drawSwipeWith(
            Draft.genEdge(points, Draft.genValue(16)),
            Draft.genEdge(points, Draft.genValue(-16)));
        //*/        

        return test.build({
            transform: Draft.projectFacePlane(1)
        });
    }
});

export default DraftTest;
