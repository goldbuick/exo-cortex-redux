export default {

    handlePointer: function (id, pressed, pt) {
        if (pressed === undefined) {
            this.buttonPressed = false;
            this.handleButton(this._animateState, this._object3D, 'out');
        } else if (pressed === false) {
            if (this.buttonPressed) {
                this.buttonPressed = false;
                this.handleButton(this._animateState, this._object3D, 'click', pt);
            } else {
                this.handleButton(this._animateState, this._object3D, 'over', pt);
            }
        } else {
            this.buttonPressed = true;
            this.handleButton(this._animateState, this._object3D, 'pressed', pt);
        }
    }

}