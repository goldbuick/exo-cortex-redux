import ThreeScreen from 'lib/ThreeScreen';

export default {

    applyProps3D: function () {
        let args = Array.prototype.slice.call(arguments);
        args.forEach(prop => {
            if (this.props[prop] === undefined) return;

            let prev,
                lastArg,
                base = this._object3D,
                keys = prop.split('-');

            keys.forEach(arg => {
                prev = base;
                base = base[arg]; 
                lastArg = arg;
            });

            if (prev === undefined || lastArg === undefined) return;
            
            prev[lastArg] = this.props[prop];
        });
    },

    clear3D: function () {
        if (!this._object3D || !this._object3D.parent) return;
        this.props.parent.stopAnimate(this);
        this._object3D.parent.remove(this._object3D);
        this._object3D = undefined;
    },

    animate: function (delta) {
        if (this.props.screenLeft !== undefined) {
            this._object3D.position.x = ThreeScreen.left(parseFloat(this.props.screenLeft));            
        }
        if (this.props.screenRight !== undefined) {
            this._object3D.position.x = ThreeScreen.right(parseFloat(this.props.screenRight));            
        }
        if (this.props.screenMiddle !== undefined) {
            this._object3D.position.x = ThreeScreen.middle(parseFloat(this.props.screenMiddle));            
        }
        if (this.animate3D) {
            this.animate3D(delta, this._animateState, this._object3D);
        }
        if (this._animate3D) {
            this._animate3D.forEach(item => {
                item.animate(delta);
            });
        }
    },

    stopAnimate: function (item) {
        this._animate3D = this._animate3D.filter(child => child !== item);
    },

    shouldAnimate: function (item) {
        if (item._animateState === undefined) {
            item._animateState = { };
        }
        this._animate3D.push(item);
    },

    children3D: function () {
        var parent = this;
        parent._animate3D = [ ];
        return React.Children.map(this.props.children, item => {
            return React.cloneElement(item, { parent: parent });
        });
    },

    render: function () {
        let out = null;
        this.clear3D();
        
        if (this.render3D) {
            out = this.render3D(this.children3D());
            if (out === undefined) {
                this._object3D = new THREE.Object3D();
                out = null;
            } else if (out instanceof THREE.Object3D) {
                this._object3D = out;
                out = null;
            } else if (this._object3D === undefined) {
                this._object3D = new THREE.Object3D();
                this._object3D.name = out.displayName;
                out = React.cloneElement(out, { parent: this });
            }
        }
        
        if (this._object3D) {
            if (this.props.parent &&
                this.props.parent._object3D) {
                this._object3D.name = this.constructor.displayName;
                this.props.parent._object3D.add(this._object3D);
                this.props.parent.shouldAnimate(this);
                this.applyProps3D(
                    'scale-x', 'scale-y', 'scale-z',
                    'rotation-x', 'rotation-y', 'rotation-z',
                    'position-x', 'position-y', 'position-z'
                );
            }
            if (this.handlePointer && !(this._object3D instanceof THREE.Scene)) {
                let placed = false;
                this._object3D.traverse(obj => {
                    if (!placed && obj.geometry) {
                        placed = true;
                        obj.userData.onPointer = this.handlePointer;
                        obj.userData.hasFocusInput = this.hasFocusInput;
                    }
                });
            }
        }

        return out;
    },

    componentWillUnmount: function () {
        this.clear3D();
    }

};
