import ThreeRender from 'lib/ThreeRender';

var ThreeGroup = React.createClass({
    mixins: [
        ThreeRender
    ],

    animate3D: function (delta, anim, obj) {
    },

    render3D: function (children) {
        if (this._object3D === undefined) {
            this._object3D = new THREE.Group();
            this._object3D.name = 'ThreeGroup';
        }
        return <div>{children}</div>;
    }
});

export default ThreeGroup;
