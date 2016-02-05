import Css from 'lib/Css';
import Glyph from 'lib/Glyph';
import BmFontText from 'lib/threejs/bmfont/text';
import BmFontShader from 'lib/threejs/bmfont/sdf';
import BmFontLoad from 'lib/threejs/bmfont/load';

var fontColor, fontConfig, fontTexture, fontQueue = [ ];
BmFontLoad({
    font: '/media/lib/OCRA.fnt',
    image: '/media/lib/OCRA.png'
}, (font, texture) => {
    fontColor = Css.getStyleRuleValue('.fg-color', 'color');
    fontConfig = font;
    fontTexture = texture;
    fontTexture.needsUpdate = true;
    fontTexture.minFilter = THREE.LinearMipMapLinearFilter;
    fontTexture.magFilter = THREE.LinearFilter;
    fontTexture.generateMipmaps = true;
    fontTexture.anisotropy = window.maxAni;
    fontQueue.forEach(fn => { fn(); });
});

var logoFontConfig, logoFontTexture, logoFontQueue = [ ];
BmFontLoad({
    font: '/media/lib/LOGO.fnt',
    image: '/media/lib/LOGO.png'
}, (font, texture) => {
    fontColor = Css.getStyleRuleValue('.fg-color', 'color');
    logoFontConfig = font;
    logoFontTexture = texture;
    logoFontTexture.needsUpdate = true;
    logoFontTexture.minFilter = THREE.LinearMipMapLinearFilter;
    logoFontTexture.magFilter = THREE.LinearFilter;
    logoFontTexture.generateMipmaps = true;
    logoFontTexture.anisotropy = window.maxAni;
    logoFontQueue.forEach(fn => { fn(); });
});

class Graph {
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
        var offset = this.glyph.count;

        points.forEach(vert => {
            this.glyph.addVert(vert.x, vert.y, vert.z);
        });

        for (var i=0; i < points.length; ++i) {
            this.glyph.addPoint(offset + i);
        }
    }

    drawLine (points) {
        var offset = this.glyph.count;

        points.forEach(vert => {
            this.glyph.addVert(vert.x, vert.y, vert.z);
        });

        for (var i=0; i < points.length-1; ++i) {
            this.glyph.addLine(offset + i, offset + i + 1);
        }
    }

    drawLoop (x, y, z, sides, radius, front, back, drift, bump) {
        this.drawLine(Graph.genArc(x, y, z, sides, radius, front, back, drift, bump));
    }

    drawLoopDash (x, y, z, sides, radius, skip, front, back, drift, bump) {
        var points = [ ],
            source = Graph.genArc(x, y, z, sides, radius, front, back, drift, bump);

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
        var points = [ ],
            source = Graph.genArc(x, y, z, sides, radius, front, back, drift, bump);

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
        var offset = this.glyph.count;

        z = z || 0;
        var hw = w * 0.5,
            hh = h * 0.5;

        this.glyph.addVert(x - hw, y - hh, z);
        this.glyph.addVert(x + hw, y - hh, z);
        this.glyph.addVert(x - hw, y + hh, z);
        this.glyph.addVert(x + hw, y + hh, z);

        this.glyph.addFill(offset, offset + 1, offset + 2, alpha);
        this.glyph.addFill(offset + 2, offset + 1, offset + 3, alpha);
    }

    drawCircle (x, y, z, sides, radius, front, back, drift, bump) {
        var offset = this.glyph.count,
            points = Graph.genArc(x, y, z, sides, radius, front, back, drift, bump);

        var center = offset,
            base = center + 1;

        this.glyph.addVert(x, y, z);
        for (var i=0; i<points.length; ++i) {
            this.glyph.addVert(points[i].x , points[i].y, points[i].z);
        }

        for (var i=0; i<points.length-1; ++i) {
            this.glyph.addFill(center, base + i + 1, base + i);
        }
    }

    drawSwipe (x, y, z, sides, radius, width, front, back, drift, bump) {
        var offset = this.glyph.count,
            innerRadius = radius,
            outerRadius = radius + width,
            ipoints = Graph.genArc(x, y, z, sides, innerRadius, front, back, drift, bump),
            opoints = Graph.genArc(x, y, z, sides, outerRadius, front, back, drift, bump);

        ipoints.forEach(vert => { this.glyph.addVert(vert.x , vert.y, vert.z); });
        opoints.forEach(vert => { this.glyph.addVert(vert.x , vert.y, vert.z); });

        var base, len = ipoints.length;
        for (var i=0; i<len-1; ++i) {
            base = offset + i;
            this.glyph.addFill(base, base + 1, base + len);
            this.glyph.addFill(base + len, base + 1, base + len + 1);
        }
    }

    drawSwipeLine (x, y, z, sides, radius, width, front, back, drift, bump) {
        var innerRadius = radius,
            outerRadius = radius + width,
            ipoints = Graph.genArc(x, y, z, sides, innerRadius, front, back, drift, bump),
            opoints = Graph.genArc(x, y, z, sides, outerRadius, front, back, drift, bump);

        this.drawLine(ipoints);
        this.drawLine(opoints);
    }

}

Graph.baseColor = Glyph.baseColor;
Graph.deepColor = Glyph.deepColor;

Graph.projectPlane = function (scale) {
    return function (x, y, z) {
        var _x = x * scale,
            _y = z * scale,
            _z = y * scale;
        return [ _x, _y, _z ];
    };
}

Graph.projectAltPlane = function (scale) {
    return function (x, y, z) {
        var _x = z * scale,
            _y = x * scale,
            _z = y * scale;
        return [ _x, _y, _z ];
    };
};

Graph.projectFacePlane = function (scale) {
    return function (x, y, z) {
        var _x = x * scale,
            _y = y * scale,
            _z = z * scale;
        return [ _x, _y, _z ];
    };
};

Graph.projectColumn = function (radius, scale) {
    return function (x, y, z) {
        y = y * scale;
        var _radius = radius + z,
            _x = Math.sin(y) * _radius,
            _y = x,
            _z = Math.cos(y) * _radius;
        return [ _x, _y, _z ];
    };
}
    
Graph.projectSphere = function (radius, scale) {
    return function (x, y, z) {
        x = x * scale;
        y = y * scale;
        var xcos = Math.cos(x),
            xsin = Math.sin(x),
            ycos = Math.cos(y),
            ysin = Math.sin(y),
            height = z + radius,
            _x = -height * xcos * ycos,
            _y = height * xsin,
            _z = height * xcos * ysin;
        return [ _x, _y, _z ];
    };
};

Graph.genArc = function (x, y, z, sides, radius, front, back, drift, bump) {
    var points = [ ],
        step = (Math.PI * 2) / sides;

    front = front || 0;
    back = back || 0;
    drift = drift || 0;
    bump = bump || 0;

    sides -= front + back;

    var angle = (front * step) + bump;
    for (var i=0; i <= sides; ++i) {
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

function genTextRetry (temp, opts, callback) {
    let _opts = JSON.parse(JSON.stringify(opts));
    return function() {
        let text = Graph.genText(_opts, callback, true);
        temp.add(text);
        if (callback) callback(temp, text);
    };
}

Graph.genText = function (opts, callback, flat) {
    if (!opts.logo && !fontConfig) {
        let temp = new THREE.Object3D();
        fontQueue.push(genTextRetry(temp, opts, callback));
        return temp;
    }
    if (opts.logo && !logoFontConfig) {
        let temp = new THREE.Object3D();
        logoFontQueue.push(genTextRetry(temp, opts, callback));
        return temp;
    }
    
    var fopts = {
        text: opts.text,
        font: opts.logo ? logoFontConfig : fontConfig
    };
    if (opts.mode !== undefined) fopts.mode = opts.mode;
    if (opts.width !== undefined) fopts.width = opts.width;
    
    var geometry = BmFontText(fopts),
        material = new THREE.ShaderMaterial(BmFontShader({
            map: opts.logo ? logoFontTexture : fontTexture,
            smooth: 1 / 16,
            transparent: true,
            side: THREE.DoubleSide,
            color: fontColor,
            scramble: 0
        }));

    var mesh = new THREE.Mesh(geometry, material);

    opts.scale = opts.scale || 1;
    var _width = geometry.layout.width * opts.scale,
        _height = geometry.layout.height * opts.scale;

    var flip = opts.flip ? 1 : -1;
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

    let temp = new THREE.Object3D();
    temp.add(mesh);
    if (callback) callback(temp, mesh);
    return temp;
};

export default Graph;
