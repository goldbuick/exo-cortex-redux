import Css from 'lib/Css';

let vertColor = Css.getStyleRuleValue('.fg-color', 'color');
vertColor = vertColor.substring(4, vertColor.length - 1).split(',').map(str => {
    return parseFloat(str.trim(str)) / 255.0;
});

let pointMaterial = new THREE.PointsMaterial({
    size: 1,
    sizeAttenuation: false,
    vertexColors: THREE.VertexColors
});

let lineMaterial = new THREE.LineBasicMaterial({
    vertexColors: THREE.VertexColors
});

let fillMaterial = new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide,
    vertexColors: THREE.VertexColors
});

let alphaFillMaterial = new THREE.MeshBasicMaterial({
    opacity: 0.05,
    transparent: true,
    side: THREE.DoubleSide,
    vertexColors: THREE.VertexColors
});

let bgColor = Css.getStyleRuleValue('.bg-color', 'color');
let altColor = Css.getStyleRuleValue('.alt-color', 'color');
let baseColor = Css.getStyleRuleValue('.fg-color', 'color');
let deepColor = Css.getStyleRuleValue('.deep-color', 'color');

class Glyph {
    constructor () {
        this.count = 0;
        this.colors = [ ];
        this.positions = [ ];
        this.points = [ ];
        this.lines = [ ];
        this.fills = [ ];
        this.alphaFills = [ ];
    }

    static get bgColor () { return bgColor; }
    static get altColor () { return altColor; }
    static get baseColor () { return baseColor; }
    static get deepColor () { return deepColor; }

    addVert (x, y, z) {
        // 00D8FF
        this.colors.push(vertColor[0], vertColor[1], vertColor[2]);
        this.positions.push(-y, x, z);
        return this.count++;
    }

    splitVert (x, y, z) {
        this.colors.push(vertColor[0], vertColor[1], vertColor[2]);
        this.positions.push(x, y, z);
        return this.count++;
    }

    addPoint (v1) {
        this.points.push(v1);
    }

    addLine (v1, v2) {
        this.lines.push(v1, v2);
    }

    addFill (v1, v2, v3, alpha) {
        if (alpha) {
            this.alphaFills.push(v1, v2, v3);
        } else {
            this.fills.push(v1, v2, v3);
        }
    }

    getPosition (index, vec) {
        index *= 3;
        vec.set(this.positions[index], this.positions[index+1], this.positions[index+2]);
    }

    tessellateLines (step) {
        var done = true,
            lines = [ ];

        var len,
            index,
            dist = new THREE.Vector3(),
            v1 = new THREE.Vector3(),
            v2 = new THREE.Vector3(),
            v3 = new THREE.Vector3();

        for (var i=0; i < this.lines.length; i += 2) {
            this.getPosition(this.lines[i], v1);
            this.getPosition(this.lines[i+1], v2);
            dist.subVectors(v2, v1);
            len = dist.length();
            if (len > step) {
                dist.multiplyScalar(0.5);
                v3.addVectors(v1, dist);
                index = this.splitVert(v3.x, v3.y, v3.z);
                lines.push(this.lines[i], index);
                lines.push(index, this.lines[i+1]);
                done = false;
            } else {
                lines.push(this.lines[i], this.lines[i+1]);
            }
        }

        this.lines = lines;
        return !done;
    }

    tessellateFills (step) {
        var done = true,
            fills = [ ];

        var len = [ 0, 0, 0 ],
            index = [ 0, 0, 0 ],
            dist = [
                new THREE.Vector3(),
                new THREE.Vector3(),
                new THREE.Vector3()
            ],
            vec = [
                new THREE.Vector3(),
                new THREE.Vector3(),
                new THREE.Vector3() 
            ],
            mid = [
                new THREE.Vector3(),
                new THREE.Vector3(),
                new THREE.Vector3() 
            ];

        var v;
        for (var i=0; i < this.fills.length; i += 3) {
            for (v=0; v < 3; ++v)
                this.getPosition(this.fills[i+v], vec[v]);

            dist[0].subVectors(vec[1], vec[0]);
            dist[1].subVectors(vec[2], vec[1]);
            dist[2].subVectors(vec[2], vec[0]);
            for (v=0; v < 3; ++v) 
                len[v] = dist[v].length();

            if (len[0] > step ||
                len[1] > step ||
                len[2] > step) {
                for (v=0; v < 3; ++v)
                    dist[v].multiplyScalar(0.5);
                mid[0].addVectors(vec[0], dist[0]);
                mid[1].addVectors(vec[1], dist[1]);
                mid[2].addVectors(vec[0], dist[2]);
                for (v=0; v < 3; ++v)
                    index[v] = this.splitVert(mid[v].x, mid[v].y, mid[v].z);

                fills.push(this.fills[i], index[0], index[2]);
                fills.push(index[0], this.fills[i+1], index[1]);
                fills.push(index[1], this.fills[i+2], index[2]);
                fills.push(index[0], index[1], index[2]);

                done = false;
            } else {
                fills.push(this.fills[i], this.fills[i+1], this.fills[i+2]);
            }
        }

        this.fills = fills;
        return !done;
    }

    tessellateAlphaFills (step) {
        var done = true,
            alphaFills = [ ];

        var len = [ 0, 0, 0 ],
            index = [ 0, 0, 0 ],
            dist = [
                new THREE.Vector3(),
                new THREE.Vector3(),
                new THREE.Vector3()
            ],
            vec = [
                new THREE.Vector3(),
                new THREE.Vector3(),
                new THREE.Vector3() 
            ],
            mid = [
                new THREE.Vector3(),
                new THREE.Vector3(),
                new THREE.Vector3() 
            ];

        var v;
        for (var i=0; i < this.alphaFills.length; i += 3) {
            for (v=0; v < 3; ++v)
                this.getPosition(this.alphaFills[i+v], vec[v]);

            dist[0].subVectors(vec[1], vec[0]);
            dist[1].subVectors(vec[2], vec[1]);
            dist[2].subVectors(vec[2], vec[0]);
            for (v=0; v < 3; ++v) 
                len[v] = dist[v].length();

            if (len[0] > step ||
                len[1] > step ||
                len[2] > step) {
                for (v=0; v < 3; ++v)
                    dist[v].multiplyScalar(0.5);
                mid[0].addVectors(vec[0], dist[0]);
                mid[1].addVectors(vec[1], dist[1]);
                mid[2].addVectors(vec[0], dist[2]);
                for (v=0; v < 3; ++v)
                    index[v] = this.splitVert(mid[v].x, mid[v].y, mid[v].z);

                alphaFills.push(this.alphaFills[i], index[0], index[2]);
                alphaFills.push(index[0], this.alphaFills[i+1], index[1]);
                alphaFills.push(index[1], this.alphaFills[i+2], index[2]);
                alphaFills.push(index[0], index[1], index[2]);

                done = false;
            } else {
                alphaFills.push(this.alphaFills[i], this.alphaFills[i+1], this.alphaFills[i+2]);
            }
        }

        this.alphaFills = alphaFills;
        return !done;
    }

    tessellate (step) {
        while (this.tessellateLines(step));
        while (this.tessellateFills(step));
        while (this.tessellateAlphaFills(step));
    }

    build (opts) {
        var group = new THREE.Group();

        var positions = [ ];
        for (var i=0; i<this.positions.length; i+=3) {
            var result = opts.transform(this.positions[i], this.positions[i+1], this.positions[i+2]);
            positions.push(result[0], result[1], result[2]);
        }

        if (this.fills.length) {
            var fillGeometry = new THREE.BufferGeometry();
            fillGeometry.setIndex(new THREE.BufferAttribute(new Uint16Array(this.fills), 1));
            fillGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
            fillGeometry.addAttribute('color', new THREE.BufferAttribute(new Float32Array(this.colors), 3));
            fillGeometry.computeBoundingSphere();

            var fillMesh = new THREE.Mesh(fillGeometry, fillMaterial);
            group.add(fillMesh);
        }

        if (this.alphaFills.length) {
            var alphaFillGeometry = new THREE.BufferGeometry();
            alphaFillGeometry.setIndex(new THREE.BufferAttribute(new Uint16Array(this.alphaFills), 1));
            alphaFillGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
            alphaFillGeometry.addAttribute('color', new THREE.BufferAttribute(new Float32Array(this.colors), 3));
            alphaFillGeometry.computeBoundingSphere();

            var alphaFillMesh = new THREE.Mesh(alphaFillGeometry, alphaFillMaterial);
            group.add(alphaFillMesh);
        }

        if (this.points.length) {
            var pointGeometry = new THREE.BufferGeometry();
            pointGeometry.setIndex(new THREE.BufferAttribute(new Uint16Array(this.points), 1));
            pointGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
            pointGeometry.addAttribute('color', new THREE.BufferAttribute(new Float32Array(this.colors), 3));
            pointGeometry.computeBoundingSphere();

            var pointMesh = new THREE.Points(pointGeometry, pointMaterial);
            group.add(pointMesh);
        }

        if (this.lines.length) {
            var lineGeometry = new THREE.BufferGeometry();
            lineGeometry.setIndex(new THREE.BufferAttribute(new Uint16Array(this.lines), 1));
            lineGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
            lineGeometry.addAttribute('color', new THREE.BufferAttribute(new Float32Array(this.colors), 3));
            lineGeometry.computeBoundingSphere();

            var lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
            group.add(lineMesh);
        }

        return group;
    }
}

export default Glyph;
