import ThreeRender from 'lib/three-render';

var Background = React.createClass({
    mixins: [
        ThreeRender
    ],

    animate3D: function (state, delta) {
        // console.log('animate', state, delta);
    },

    render3D: function () {
        return new THREE.Object3D();
    }
});

export default Background;