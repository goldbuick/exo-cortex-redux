import ThreeScene from 'lib/three-scene';
import Background from 'app/background';

var Page = React.createClass({
    mixins: [
    ],
    
    render: function () {
        return <ThreeScene>
            <Background/>
        </ThreeScene>;
    }

});

export default Page;
