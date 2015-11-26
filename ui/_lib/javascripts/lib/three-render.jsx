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
        this._object3D.parent.remove(this._object3D);
        this._object3D = undefined;
    },

    animate: function (delta) {
        if (this.animate3D) {
            this.animate3D(delta, this._animateState, this._object3D);
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
            return React.cloneElement(item, { parent: parent });
        });
    },

    render: function () {
        let out = null;
        
        if (this.render3D) {
            out = this.render3D(this.children3D());
            if (out instanceof THREE.Object3D) {
                this._object3D = out;
                out = null;
            } else if (this._object3D === undefined) {
                this._object3D = new THREE.Object3D();
                this._object3D.name = 'ThreeObject3D';
                out = React.cloneElement(out, { parent: this });
            }
        }

        if (this._object3D &&
            this.props.parent &&
            this.props.parent._object3D) {
            this._object3D.name = this.constructor.displayName;
            this.props.parent._object3D.add(this._object3D);
            this.props.parent.shouldAnimate(this);
            this.applyProps3D('position-x', 'position-y', 'position-z');
        }

        return out;
    },

    componentWillUnmount: function () {
        // tear down scene graph
        this.clear3D();
    }

};
