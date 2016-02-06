import FacadeActions from 'lib/FacadeActions';
import Background from 'lib/Background';
import ThreeScene from 'lib/ThreeScene';
import TestButton from './TestButton';
import UiInput from 'lib/UiInput';

/*
what do I need from web-didact
generic config editor
start / stop neuros
edit upstream path
*/

FacadeActions.connect.listen(() => {
    FacadeActions.emit('didact', 'neuros');
});

FacadeActions.api.listen(api => console.log(api));
FacadeActions.nodes.listen(nodes => console.log(nodes));
FacadeActions.message.listen(message => console.log(message));

var Page = React.createClass({
    mixins: [
    ],

    getInitialState: function () {
        return { };
    },
    
    render: function () {
        return <ThreeScene onCreate={this.handleCreate}>
            <Background seed="something-else-yeah"/>
            <TestButton position-x="-700" position-y="550"/>
            <TestButton position-x="-400" position-y="300" fill="true"/>
            <TestButton position-x="0" position-y="200"/>
            <TestButton position-x="400" position-y="300" fill="true"/>
            <TestButton position-x="700" position-y="550"/>
            <UiInput minWidth="600" center="true" position-y="-100" scale="2.0"/>
        </ThreeScene>;
    },

    handleCreate: function (render) {
        render.camera.position.z = 1440;
    },

    handlePointer: function (id, pressed, x, y, intersects) {
    }

});

export default Page;