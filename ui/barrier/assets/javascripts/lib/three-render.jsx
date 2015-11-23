export default {

    clear3D: function () {
        if (!this._object3D || !this._object3D.parent) return;
        this._object3D.parent.remove(this._object3D);
        this._object3D = undefined;
    },

    animate: function (delta) {
        if (this.animate3D) {
            this.animate3D(this._animateState, delta);
        }
        if (this._animate3D) {
            this._animate3D.forEach(item => {
                item.animate(delta);
            });
        }
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
            return React.cloneElement(item, {
                parent: parent
            });
        });
    },

    render: function () {
        let out = null;
        if (this.render3D) {
            out = this.render3D(this.children3D());
            if (out instanceof THREE.Object3D) {
                this._object3D = out;
                if (this.props.parent &&
                    this.props.parent._object3D) {
                    this.props.parent._object3D.add(this._object3D);
                    this.props.parent.shouldAnimate(this);
                }

                return null;

            } else if (this._object3D === undefined) {
                this._object3D = new THREE.Group();
            }
        }
        return out;
    },

    componentWillUnmount: function () {
        // tear down scene graph
        this.clear3D();
    }

};
