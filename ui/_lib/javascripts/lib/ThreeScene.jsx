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
import ThreeRender from 'lib/ThreeRender';

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
        let size = this.containerSize();

        // core rendering objects
        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            preserveDrawingBuffer: true
        });
        this.camera = new THREE.PerspectiveCamera(60, 4 / 3, 0.1, 10000);
        // this.renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
        
        // default scene setup
        this._object3D.add(this.camera);
        this.renderer.setSize(size.width, size.height);
        this.renderer.autoClear = false;
        window.maxAni = this.renderer.getMaxAnisotropy();

        this.composer = new THREE.EffectComposer(this.renderer);
        let renderPass = new THREE.RenderPass(this._object3D, this.camera);
        let effectBloom = new THREE.BloomPass(2);
        let effectCopy = new THREE.ShaderPass(THREE.CopyShader);
        let effectFilm = new THREE.FilmPass(2.0, 0.5, size.height * 2, false);
        let effectGlitch = new THREE.GlitchPass(64);

        let passes = [
            renderPass,
            effectBloom,
            effectCopy,
            effectFilm,
            // effectGlitch,
        ];
        for (let i=0; i<passes.length; ++i) {
            this.composer.addPass(passes[i]);
        }
        let lastPass = passes.pop();
        lastPass.renderToScreen = true;

        // add canvas to container
        this.refs.container.appendChild(this.renderer.domElement);

        // add picker 
        this.mousePressed = false;
        this.lastPointerObject = { };
        this.ray = new THREE.Raycaster();
        this.rayCoords = new THREE.Vector2();

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
        let size = this.containerSize();
        this.renderer.setSize(size.width, size.height);
        this.camera.aspect = size.width / size.height;
        this.camera.updateProjectionMatrix();
        this.composer.reset();
    },

    update: function () {
        let delta = (1.0 / 60.0);
        TWEEN.update();
        this.animate(delta);
        this.renderer.clear();
        this.composer.render(delta);
        if (this.props.onUpdate) this.props.onUpdate(this, delta);
        this.renderTimer = window.requestAnimationFrame(this.update);
    },

    render3D: function (children) {
        if (this._object3D === undefined) {
            this._object3D = new THREE.Scene();
            this._object3D.name = 'ThreeScene';
        }

        return <div ref="container" className="container"
            onWheel={this.handleWheel}
            onTouchStart={this.handleTouchStart}
            onTouchMove={this.handleTouchMove}
            onTouchEnd={this.handleTouchEnd}
            onMouseDown={this.handleMouseDown}
            onMouseMove={this.handleMouseMove}
            onMouseUp={this.handleMouseUp}>{children}</div>;
    },

    handleWheel: function (event) {
        event.preventDefault();
        if (!this.props.onWheel) return;
        this.props.onWheel(event.deltaX, event.deltaY);
    },

    handlePointer: function (id, pressed, x, y) {
        if (!this._object3D) return;
        let current,
            size = this.containerSize(),
            last = this.lastPointerObject[id];

        if (pressed !== undefined) {
            this.rayCoords.x = (x / size.width) * 2 - 1;
            this.rayCoords.y = -(y / size.height) * 2 + 1;
            this.ray.setFromCamera(this.rayCoords, this.camera);

            let intersects = this.ray.intersectObjects(this._object3D.children, true);
            for (let i=0; i<intersects.length; ++i) {
                let obj = intersects[i].object;
                if (obj && obj.userData && obj.userData.onPointer) {
                    current = intersects[i];
                    break;
                }
            }
        }

        if (last && (!current || last !== current.object)) {
            last.userData.onPointer(id);
            delete this.lastPointerObject[id];
        }

        if (current) {
            this.lastPointerObject[id] = current.object;
            current.object.userData.onPointer(id, pressed, current.point);
        }
    },

    handleTouchStart: function (event) {
        event.preventDefault();
        for (let i=0; i<event.changedTouches.length; ++i) {
            let touch = event.changedTouches[i];
            this.handlePointer(touch.identifier, true, touch.clientX, touch.clientY);
        }
    },

    handleTouchMove: function (event) {
        event.preventDefault();
        for (let i=0; i<event.changedTouches.length; ++i) {
            let touch = event.changedTouches[i];
            this.handlePointer(touch.identifier, true, touch.clientX, touch.clientY);
        }
    },

    handleTouchEnd: function (event) {
        event.preventDefault();
        for (let i=0; i<event.changedTouches.length; ++i) {
            let touch = event.changedTouches[i];
            this.handlePointer(touch.identifier, false, touch.clientX, touch.clientY);
            this.handlePointer(touch.identifier);
        }
    },

    handleMouseDown: function (event) {
        event.preventDefault();
        this.mousePressed = true;
        this.handlePointer(-1, true, event.clientX, event.clientY);
    },

    handleMouseMove: function (event) {
        event.preventDefault();
        this.handlePointer(-1, this.mousePressed, event.clientX, event.clientY);
    },

    handleMouseUp: function (event) {
        event.preventDefault();
        this.mousePressed = false;
        this.handlePointer(-1, false, event.clientX, event.clientY);
    },

});

export default ThreeScene;
