import Graph from 'lib/Graph';
import ThreeRender from 'lib/ThreeRender';

var UiInput = React.createClass({
    mixins: [
        ThreeRender
    ],

    getInitialState: function () {
        return { value: 'Hello!' };
    },

    componentDidMount: function () {
        this.refs.input.style.top = '-10000px';
        this.refs.input.style.left = '-10000px';
        this.refs.input.style.position = 'absolute';
        this.refs.input.focus();
    },

    getScale: function () {
        return this.props.scale || 1.0;
    },

    animate3D: function (delta, anim, obj) {
        anim.swap = 1 - (anim.swap || 0);
        anim.cycle = anim.cycle || 0.5;
        anim.tick = anim.tick || 0;
        anim.tick += delta;
        if (anim.tick >= anim.cycle * 2) anim.tick -= anim.cycle * 2;

        let caret = obj.children[0];
        if (caret === undefined) return;

        if (anim.offset === undefined) {
            caret.visible = false;
        } else {
            caret.position.y = anim.offset;
            caret.visible = anim.focus && (anim.tick < anim.cycle) ||
                (anim.selectionStart !== anim.selectionEnd);
        }

        let scale = this.getScale(),
            text = obj.children[1].children[0];
        if (text) {
            let index = anim.swap ? anim.selectionStart : anim.selectionEnd,
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
        let input = new Graph(),
            scale = this.getScale(),
            value = this.state.value,
            ax = this.props.center ? 0.5 : 0.0;

        input.drawLine([
            { x: 0, y:  1, z: 64 * scale },
            { x: 0, y:  2, z: -32 * scale },
            { x: 0, y: -2, z: 32 * scale },
            { x: 0, y: -1, z: -64 * scale },
        ]);

        this._object3D = input.build({
            transform: Graph.projectPlane(1)
        });
        this._object3D.add(Graph.genText({
            ax: ax,
            scale: scale,
            text: value,
            pos: [ 0, 0, 0 ],
            nudge: [ 0, 0, 0 ]
        }));

        // let text = this._object3D.children[1].children[0];
        // if (text) console.log(text);

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
