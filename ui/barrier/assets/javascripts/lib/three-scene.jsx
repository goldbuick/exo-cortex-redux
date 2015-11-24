import 'lib/threejs/shaders/FilmShader';
import 'lib/threejs/shaders/CopyShader';
import 'lib/threejs/shaders/DigitalGlitch';
import 'lib/threejs/shaders/ConvolutionShader';
import 'lib/threejs/postprocessing/EffectComposer';
import 'lib/threejs/postprocessing/MaskPass';
import 'lib/threejs/postprocessing/FilmPass';
import 'lib/threejs/postprocessing/BloomPass';
import 'lib/threejs/postprocessing/ShaderPass';
import 'lib/threejs/postprocessing/GlitchPass';
import 'lib/threejs/postprocessing/RenderPass';
import ThreeRender from 'lib/three-render';

var ThreeScene = React.createClass({
    mixins: [
        ThreeRender
    ],

    containerSize: function () {
        return {
            width: this.refs.container.offsetWidth,
            height: this.refs.container.offsetHeight
        };
    },

    create: function () {
        var size = this.containerSize();

        // core rendering objects
        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            preserveDrawingBuffer: true
        });
        this.camera = new THREE.PerspectiveCamera(60, 4 / 3, 0.1, 10000);
        
        // default scene setup
        this._object3D.add(this.camera);
        this.renderer.setSize(size.width, size.height);
        this.renderer.autoClear = false;
        window.maxAni = this.renderer.getMaxAnisotropy();

        this.composer = new THREE.EffectComposer(this.renderer);
        var renderPass = new THREE.RenderPass(this._object3D, this.camera);
        var effectBloom = new THREE.BloomPass(2);
        var effectCopy = new THREE.ShaderPass(THREE.CopyShader);
        var effectFilm = new THREE.FilmPass(2.0, 0.5, size.height * 2, false);
        var effectGlitch = new THREE.GlitchPass(64);

        var passes = [
            renderPass,
            effectBloom,
            effectCopy,
            effectFilm,
            // effectGlitch,
        ];
        for (var i=0; i<passes.length; ++i) {
            this.composer.addPass(passes[i]);
        }
        var lastPass = passes.pop();
        lastPass.renderToScreen = true;

        // add canvas to container
        this.refs.container.appendChild(this.renderer.domElement);

        // onCreate handler
        if (this.props.onCreate) this.props.onCreate(this);

        // start updating
        this.update();
        this.handleResize();
    },

    componentDidMount: function () {
        window.addEventListener('resize', this.handleResize);
        this.create();
    },

    componentWillUnmount: function () {
        window.cancelAnimationFrame(this.renderTimer);
        window.removeEventListener('resize', this.handleResize);
    },

    handleResize: function () {
        var size = this.containerSize();
        this.renderer.setSize(size.width, size.height);
        this.camera.aspect = size.width / size.height;
        this.camera.updateProjectionMatrix();
        this.composer.reset();
    },

    update: function () {
        var delta = (1.0 / 60.0);
        this.animate(delta);
        this.renderer.clear();
        this.composer.render(delta);
        if (this.props.onUpdate) this.props.onUpdate(this, delta);
        this.renderTimer = window.requestAnimationFrame(this.update);
    },

    render3D: function (children) {
        if (this._object3D === undefined) {
            this._object3D = new THREE.Scene();
        }
        return <div ref="container" className="container">{children}</div>;
    }

});

export default ThreeScene;
