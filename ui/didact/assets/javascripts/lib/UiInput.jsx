import Graph from 'lib/Graph';
import UiButton from 'lib/UiButton';
import ThreeRender from 'lib/ThreeRender';

var UiInput = React.createClass({
    mixins: [
        UiButton,
        ThreeRender
    ],

    getInitialState: function () {
        return { value: 'Hello!' };
    },

    componentDidMount: function () {
        this.refs.input.style.top = '-10000px';
        this.refs.input.style.left = '-10000px';
        this.refs.input.style.position = 'absolute';
    },

    getScale: function () {
        return this.props.scale || 1.0;
    },

    getWidth: function (targetWidth) {
        let minWidth = this.props.minWidth || 300;
        return Math.max(targetWidth, minWidth);
    },

    sizePlate: function (obj, width) {
        let scale = width / 100;
        obj.scale.set(scale, 1, 1);
    },

    animate3D: function (delta, anim, obj) {
        anim.swap = 1 - (anim.swap || 0);
        anim.cycle = anim.cycle || 0.5;
        anim.tick = anim.tick || 0;
        anim.tick += delta;
        if (anim.tick >= anim.cycle * 2) anim.tick -= anim.cycle * 2;

        let scale = this.getScale(),
            text = obj.userData.text.children[0],
            caret = obj.userData.caret.children[0],
            plate = obj.userData.plate;

        if (anim.offset === undefined) {
            caret.visible = false;
            plate.visible = false;
        } else {
            plate.visible = true;
            caret.position.y = anim.offset;
            caret.visible = anim.focus && (anim.tick < anim.cycle) ||
                (anim.selectionStart !== anim.selectionEnd);
        }

        if (text) {
            let index = (anim.swap ? anim.selectionStart : anim.selectionEnd) || 0,
                glyph = text.geometry.layout.glyphs[index];
            if (glyph) {
                caret.position.x = glyph.position[0] * scale;
                anim.offset = caret.position.y = (glyph.position[1] + 64) * scale;
            } else {
                glyph = text.geometry.layout.glyphs[index - 1];
                if (glyph) {
                    caret.position.x = (glyph.position[0] + glyph.data.xadvance) * scale;
                    anim.offset = caret.position.y = (glyph.position[1] + 64) * scale;
                }
            }
            caret.position.x += text.position.x;
            plate.position.y = anim.offset;
            this.sizePlate(plate, this.getWidth(text.geometry.layout._width + 100 * scale));
        }
    },

    handleButton: function (anim, obj, action, pt) {
        switch (action) {
            case 'out':
                anim.over = false; break;
            case 'over':
            case 'click':
                anim.over = false; break;
            case 'pressed':
                anim.over = false;
                this.refs.input.focus();
                break;
        }
    },

    handleBlur: function (e) {
        if (this._animateState) {
            this._animateState.focus = false;
        }
    },

    handleSelection: function (target) {
        if (this._animateState) {
            this._animateState.tick = 0;
            this._animateState.selectionStart = target.selectionStart;
            this._animateState.selectionEnd = target.selectionEnd;
        }
    },

    handleCaret: function (e) {
        this.handleSelection(e.target);
    },

    handleFocus: function (e) {
        if (this._animateState) {
            this._animateState.focus = true;
        }
        this.handleSelection(e.target);
    },

    handleChange: function (e) {
        this.setState({ value: e.target.value });
        this.handleSelection(e.target);
    },

    render3D: function () {
        let graph,
            scale = this.getScale(),
            value = this.state.value,
            ax = this.props.center ? 0.5 : 0.0;
        this._object3D = new THREE.Group();

        graph = new Graph();
        graph.drawLine([
            { x: 0, y:  1, z: 50 * scale },
            { x: 0, y:  2, z: -32 * scale },
            { x: 0, y: -2, z: 32 * scale },
            { x: 0, y: -1, z: -50 * scale },
        ]);
        this._object3D.userData.caret = graph.build({
            transform: Graph.projectPlane(1)
        });

        this._object3D.userData.text = Graph.genText({
            ax: ax,
            scale: scale,
            text: value,
            pos: [ 0, 0, 0 ],
            nudge: [ 0, 0, 0 ]
        });

        graph = new Graph();
        graph.drawRect(0, 0, 100 * scale, 100, 0, true);
        this._object3D.userData.plate = graph.build({
            transform: Graph.projectFacePlane(1)
        });

        graph = new Graph();
        graph.drawLine([
            { x: 0, y:  50 * scale, z: 0 },
            { x: 0, y:  50 * scale, z: -50 * scale },
            { x: 0, y: -50 * scale, z: -50 * scale },
        ]);
        this._object3D.userData.plate.add(graph.build({
            transform: Graph.projectPlane(1)
        }));

        this._object3D.add(this._object3D.userData.plate);
        this._object3D.add(this._object3D.userData.text);
        this._object3D.add(this._object3D.userData.caret);
        this.sizePlate(this._object3D.userData.plate, this.getWidth(300));

        return <input type="text"
            ref="input"
            value={value}
            onBlur={this.handleBlur}
            onFocus={this.handleFocus}
            onKeyUp={this.handleCaret}
            onKeyDown={this.handleCaret}
            onKeyPress={this.handleCaret}
            onChange={this.handleChange} />;
    }

});

export default UiInput;
