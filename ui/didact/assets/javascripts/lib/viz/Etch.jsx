import Glyph from 'lib/viz/Glyph';
import BmFontText from 'lib/threejs/bmfont/text';
import BmFontShader from 'lib/threejs/bmfont/sdf';
import BmFontLoad from 'lib/threejs/bmfont/load';

let fontColor,
    fontData = { },
    fontQueue = { };

function fetchFont (name, retry) {
    if (fontData[name]) {
        return fontData[name];
    }
    if (fontQueue[name] === undefined) {
        fontQueue[name] = [ ];
    }
    fontQueue[name].push(retry());
    return undefined;
}

[ 'OCRA', 'LOGO', 'FIRACODE' ].forEach(name => {
    BmFontLoad({
        font: '/media/lib/' + name + '.fnt',
        image: '/media/lib/' + name + '.png'
    }, (config, texture) => {

        texture.needsUpdate = true;
        texture.minFilter = THREE.LinearMipMapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;
        texture.anisotropy = window.maxAni;

        fontColor = Glyph.baseColor;
        fontData[name] = {
            config: config,
            texture: texture
        };

        if (fontQueue[name] !== undefined) {
            fontQueue[name].forEach(fn => fn());
            delete fontQueue[name];
        }
    });
});

class Etch {
    constructor () {
        this.glyph = new Glyph();
    }

    tessellate (step) {
        return this.glyph.tessellate(step);
    }

    build (transform) {
        return this.glyph.build(transform);
    }

    drawPoints (points) {
        let offset = this.glyph.count;

        points.forEach(vert => {
            this.glyph.addVert(vert.x, vert.y, vert.z);
        });

        for (let i=0; i < points.length; ++i) {
            this.glyph.addPoint(offset + i);
        }
    }

    drawLine (points) {
        let offset = this.glyph.count;

        points.forEach(vert => {
            this.glyph.addVert(vert.x, vert.y, vert.z);
        });

        for (let i=0; i < points.length-1; ++i) {
            this.glyph.addLine(offset + i, offset + i + 1);
        }
    }

    drawLoop (x, y, z, sides, radius, front, back, drift, bump) {
        this.drawLine(Etch.genArc(x, y, z, sides, radius, front, back, drift, bump));
    }

    drawLoopDash (x, y, z, sides, radius, skip, front, back, drift, bump) {
        let points = [ ],
            source = Etch.genArc(x, y, z, sides, radius, front, back, drift, bump);

        skip = skip || 1;
        while (source.length) {
            points.push(source.shift());
            if (points.length > 1) {
                this.drawLine(points);
                if (i % skip === 0) {
                    points = [ ];
                } else {
                    points.shift();
                }
            }
        }
    }

    drawLoopR (x, y, z, sides, radius, r, threshold, front, back, drift, bump) {
        let points = [ ],
            source = Etch.genArc(x, y, z, sides, radius, front, back, drift, bump);

        while (source.length) {
            points.push(source.shift());
            if (points.length > 1) {
                this.drawLine(points);
                if (r() < threshold) {
                    points = [ ];
                } else {
                    points.shift();
                }
            }
        }
    }

    drawRect (x, y, w, h, z, alpha) {
        let offset = this.glyph.count;

        z = z || 0;
        let hw = w * 0.5,
            hh = h * 0.5;

        this.glyph.addVert(x - hw, y - hh, z);
        this.glyph.addVert(x + hw, y - hh, z);
        this.glyph.addVert(x - hw, y + hh, z);
        this.glyph.addVert(x + hw, y + hh, z);

        this.glyph.addFill(offset, offset + 1, offset + 2, alpha);
        this.glyph.addFill(offset + 2, offset + 1, offset + 3, alpha);
    }

    drawCircle (x, y, z, sides, radius, front, back, drift, bump, alpha) {
        let offset = this.glyph.count,
            points = Etch.genArc(x, y, z, sides, radius, front, back, drift, bump);

        let center = offset,
            base = center + 1;

        this.glyph.addVert(x, y, z);
        for (let i=0; i<points.length; ++i) {
            this.glyph.addVert(points[i].x , points[i].y, points[i].z);
        }

        for (let i=0; i<points.length-1; ++i) {
            this.glyph.addFill(center, base + i + 1, base + i, alpha);
        }
    }

    drawSwipe (x, y, z, sides, radius, width, front, back, drift, bump, alpha) {
        let offset = this.glyph.count,
            innerRadius = radius,
            outerRadius = radius + width,
            ipoints = Etch.genArc(x, y, z, sides, innerRadius, front, back, drift, bump),
            opoints = Etch.genArc(x, y, z, sides, outerRadius, front, back, drift, bump);

        ipoints.forEach(vert => { this.glyph.addVert(vert.x , vert.y, vert.z); });
        opoints.forEach(vert => { this.glyph.addVert(vert.x , vert.y, vert.z); });

        let base, len = ipoints.length;
        for (let i=0; i<len-1; ++i) {
            base = offset + i;
            this.glyph.addFill(base, base + 1, base + len, alpha);
            this.glyph.addFill(base + len, base + 1, base + len + 1, alpha);
        }
    }

    drawSwipeAlt (x, y, z, sides, radius, width, front, back, drift, bump, alpha) {
        let offset = this.glyph.count,
            ipoints = Etch.genArc(x, y, z, sides, radius, front, back, drift, bump),
            opoints = Etch.genArc(x, y + width, z, sides, radius, front, back, drift, bump);

        ipoints.forEach(vert => { this.glyph.addVert(vert.x , vert.y, vert.z); });
        opoints.forEach(vert => { this.glyph.addVert(vert.x , vert.y, vert.z); });

        let base, len = ipoints.length;
        for (let i=0; i<len-1; ++i) {
            base = offset + i;
            this.glyph.addFill(base, base + 1, base + len, alpha);
            this.glyph.addFill(base + len, base + 1, base + len + 1, alpha);
        }
    }

    drawSwipeLine (x, y, z, sides, radius, width, front, back, drift, bump) {
        let innerRadius = radius,
            outerRadius = radius + width,
            ipoints = Etch.genArc(x, y, z, sides, innerRadius, front, back, drift, bump),
            opoints = Etch.genArc(x, y, z, sides, outerRadius, front, back, drift, bump);

        this.drawLine(ipoints);
        this.drawLine(opoints);
    }

    drawSwipeWith (ipoints, opoints, alpha) {
        let offset = this.glyph.count;
        ipoints.forEach(vert => { this.glyph.addVert(vert.x , vert.y, vert.z); });
        opoints.forEach(vert => { this.glyph.addVert(vert.x , vert.y, vert.z); });

        let base, len = ipoints.length;
        for (let i=0; i<len-1; ++i) {
            base = offset + i;
            this.glyph.addFill(base, base + 1, base + len, alpha);
            this.glyph.addFill(base + len, base + 1, base + len + 1, alpha);
        }
    }

    static get baseColor () { return Glyph.baseColor; }
    static get deepColor () { return Glyph.deepColor; }

    static projectPlane (scale) {
        return (x, y, z) => {
            let _x = x * scale,
                _y = z * scale,
                _z = y * scale;
            return [ _x, _y, _z ];
        };
    }

    static projectAltPlane (scale) {
        return (x, y, z) => {
            let _x = z * scale,
                _y = x * scale,
                _z = y * scale;
            return [ _x, _y, _z ];
        };
    }

    static projectFacePlane (scale) {
        return (x, y, z) => {
            let _x = x * scale,
                _y = y * scale,
                _z = z * scale;
            return [ _x, _y, _z ];
        };
    }

    static projectColumn (radius, scale) {
        return (x, y, z) => {
            y = y * scale;
            let _radius = radius + z,
                _x = Math.sin(y) * _radius,
                _y = x,
                _z = Math.cos(y) * _radius;
            return [ _x, _y, _z ];
        };
    }

    static projectSphere (radius, scale) {
        return (x, y, z) => {
            x = x * scale;
            y = y * scale;
            let xcos = Math.cos(x),
                xsin = Math.sin(x),
                ycos = Math.cos(y),
                ysin = Math.sin(y),
                height = z + radius,
                _x = -height * xcos * ycos,
                _y = height * xsin,
                _z = height * xcos * ysin;
            return [ _x, _y, _z ];
        };
    }

    static genArc (x, y, z, sides, radius, front, back, drift, bump) {
        let points = [ ],
            step = (Math.PI * 2) / sides;

        front = front || 0;
        back = back || 0;
        drift = drift || 0;
        bump = bump || 0;

        sides -= front + back;

        let angle = (front * step) + bump;
        for (let i=0; i <= sides; ++i) {
            points.push({
                x: x + Math.cos(angle) * radius,
                y: y + Math.sin(angle) * radius,
                z: z
            });
            angle += step;
            radius += drift;
        }

        return points;
    };

    static genTextRetry (temp, opts, callback) {
        let _opts = JSON.parse(JSON.stringify(opts));
        return function() {
            let text = Etch.genText(_opts, callback, true);
            temp.add(text);
            if (callback) callback(temp, text);
        };
    }

    static genText (opts, callback, flat) {
        let temp = new THREE.Object3D(),
            useFont = opts.font || 'OCRA';

        let font = fetchFont(useFont, () => {
            return Etch.genTextRetry(temp, opts, callback);
        });
        if (font === undefined) return temp;
        
        let fopts = {
            text: opts.text,
            font: font.config
        };
        if (opts.mode !== undefined) fopts.mode = opts.mode;
        if (opts.width !== undefined) fopts.width = opts.width;
        
        let geometry = BmFontText(fopts),
            material = new THREE.ShaderMaterial(BmFontShader({
                map: font.texture,
                smooth: 1 / 16,
                transparent: true,
                side: THREE.DoubleSide,
                color: fontColor,
                scramble: 0
            }));

        let mesh = new THREE.Mesh(geometry, material);

        opts.scale = opts.scale || 1;
        let _width = geometry.layout.width * opts.scale,
            _height = geometry.layout.height * opts.scale;

        let flip = opts.flip ? 1 : -1;
        if (opts.ax === undefined) opts.ax = 0.5;
        if (opts.ay === undefined) opts.ay = 0.5;

        mesh.scale.multiplyScalar(opts.scale);
        mesh.scale.x *= flip;
        opts.pos[0] -= _width * opts.ax * -flip;
        opts.pos[1] -= _height * opts.ay;

        if (opts.nudge) {
            for (let i=0; i<3; ++i) opts.pos[i] += opts.nudge[i];
        }
        mesh.position.set(opts.pos[0], opts.pos[1], opts.pos[2]);
        mesh.rotation.z = Math.PI;

        if (flat) return mesh;

        temp.add(mesh);
        if (callback) callback(temp, mesh);
        return temp;
    };
}

export default Etch;
