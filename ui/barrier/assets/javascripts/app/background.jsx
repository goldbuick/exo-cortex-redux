import ThreeRender from 'lib/three-render';

var Background = React.createClass({
    mixins: [
        ThreeRender
    ],

    animate3D: function (delta, anim, obj) {
        // anim.y = (anim.y || 0) + delta;
        // obj.rotation.y = anim.y;
        // console.log('animate', obj.rotation.y);
    },

    render3D: function () {
        return new THREE.Mesh();
    }
});

export default Background;