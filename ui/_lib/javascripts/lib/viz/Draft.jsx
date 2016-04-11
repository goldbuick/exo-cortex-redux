import Etch from 'lib/viz/Etch';
import 'lib/threejs/SimplexNoise';

class Draft extends Etch {

    constructor () {
        super();
    }

    // deco objects

    drawHexPod (x, y, z, radius, count, step) {
    	for (let i=0; i < count; ++i) {
    		this.drawLoop(x, y, z, 6, radius);
    		radius += step;
    	}
    }

    drawFeatherArcR (x, y, z, radius, count, r, width, depth, drift) {
    	for (let i=0; i < count; ++i) {
    		let _z = z + (i * -depth),
    			twist = Math.floor((r() - 0.5) * 32),
    			arc = 45 + Math.floor(r() * 20);
    		this.drawSwipe(x, y, _z, 128, radius, width, arc - twist, arc + twist, -drift);
    		radius += width + 2;
    	}
    }

    drawChevron (x, y, z, radius, angle, spread) {
        this.drawLine(Draft.genChevron(x, y, z, radius, angle, spread));
    }

    drawLinesWith (ipoints, opoints) {
        for (let i=0; i < ipoints.length; ++i) {
            this.drawLine([ipoints[i], opoints[i]]);
        }
    }

    // utils

    static map (points, fn) {
        let result = [ ],
            count = points.length-1;
        for (let i=0; i < points.length; ++i) {
            result.push(fn(points[i], i, count, points));
        }
        return result;
    }

    static noise (seed) {
        let r = alea(seed);
        return new SimplexNoise({ random: r });
    }

    static filterByNoise (points, seed, scale, fn) {
        let r = this.noise(seed);
        return points.filter(pt => {
            let v = r.noise3d(
                pt.x * scale,
                pt.y * scale,
                pt.z * scale);
            return fn(v, pt.x, pt.y, pt.z);
        });
    }

    // generators 

    static genValue (v) {
        return () => v;
    }

    static genTranslate (x, y, z) {
        return pt => {
            return {
                x: pt.x + x,
                y: pt.y + y,
                z: pt.z + z
            };
        };
    }

    static genPoints (x, y, z, count, looped, fn) {
        let points = [];
        for (let i=0; i <= count; ++i) {
            points.push(fn(x, y, z, i, count));
        }
        if (looped) points.push(points[0]);
        return points;
    }

    static genEdge (points, fn) {
        let last1,
            last2,
            radius,
            edge = [ ],
            count = points.length-1,
            a = new THREE.Vector3(),
            b = new THREE.Vector3(),
            turn = new THREE.Vector3(),
            flip = new THREE.Vector3(),
            spin = (v1, v2) => {
                if (v1.y * v2.x > v1.x * v2.y) {
                    return -1;
                }
                return 1;
            },
            project = (v1, v2, v3, value) => {
                a.subVectors(v1, v2).normalize();
                b.subVectors(v3, v2).normalize();
                turn.addVectors(a, b).normalize();
                if (turn.length() === 0) {
                    turn.set(a.y, -a.x, a.z);
                } else {
                    value = Math.abs(value);
                    if (spin(a, b) > 0) value = -value;
                    if (radius < 0) value = -value;
                }
                turn.multiplyScalar(value);
                return {
                    x: v2.x + turn.x,
                    y: v2.y + turn.y,
                    z: v2.z + turn.z                    
                };
            };

        if (points.length) {
            a.set(points[0].x, points[0].y, points[0].z);
            b.set(points[points.length-1].x, points[points.length-1].y, points[points.length-1].z);
            let closed = a.distanceToSquared(b) < 0.0001;

            radius = -fn(0, count);
            if (closed) {
                edge.push(project(points[points.length-2], points[0], points[1], radius));
            } else {
                flip.subVectors(points[0], points[1]).add(points[0]);
                edge.push(project(flip, points[0], points[1], radius));
            }

            for (let i=1; i < points.length-1; ++i) {
                radius = -fn(i, count);
                edge.push(project(points[i-1], points[i], points[i+1], radius));
            }

            radius = -fn(closed ? 0 : count, count);
            last1 = points[points.length-1];
            last2 = points[points.length-2];
            if (closed) {
                edge.push(project(last2, last1, points[1], radius));
            } else {
                flip.subVectors(last1, last2).add(last1);
                edge.push(project(last2, last1, flip, radius));
            }
        }
        return edge;
    }

    static genChevron (x, y, z, radius, angle, spread) {
        let points = [ ];
        // left
        points.push({
            x: x + Math.cos(angle - spread) * radius,
            y: y + Math.sin(angle - spread) * radius,
            z: z
        });
        // center
        points.push({ x: x, y: y, z: z });
        // left
        points.push({
            x: x + Math.cos(angle + spread) * radius,
            y: y + Math.sin(angle + spread) * radius,
            z: z
        });
        return points;        
    }

    static genCircle (x, y, z, count, fn) {
        return Draft.genPoints(x, y, z, count, true, (x, y, z, i, count) => {
            let angle = (i / count) * Math.PI * 2,
                radius = fn(angle, i, count);
            return {
                x: x + Math.cos(angle) * radius,
                y: y + Math.sin(angle) * radius,
                z: z
            };
        });
    }

    static genAngles (points) {
        let result = [],
            a = new THREE.Vector3(),
            b = new THREE.Vector3(),
            c = new THREE.Vector3();

        let lastAngle;
        for (let i=0; i < points.length-1; ++i) {
            a.set(points[i].x, points[i].y, points[i].z);
            b.set(points[i+1].x, points[i+1].y, points[i+1].z);
            c.subVectors(b, a);
            lastAngle = Math.atan2(c.y, c.x);
            result.push({
                x: points[i].x,
                y: points[i].y,
                z: points[i].z,
                angle: lastAngle
            });
        }

        a.set(points[0].x, points[0].y, points[0].z);
        b.set(points[points.length-1].x, points[points.length-1].y, points[points.length-1].z);
        // closed
        if (a.distanceToSquared(b) < 0.0001) {
            let last1 = points[points.length-2],
                last2 = points[0];
            a.set(last1.x, last1.y, last1.z);
            b.set(last2.x, last2.y, last2.z);
            c.subVectors(b, a);
            lastAngle = Math.atan2(c.y, c.x); 
        }

        result.push({
            x: points[points.length-1].x,
            y: points[points.length-1].y,
            z: points[points.length-1].z,
            angle: lastAngle
        });

        return result;
    }

    static genSpaces (x, y, z, wx, wy, fn) {
        let points = [],
            build = (count, left, top, right, bottom) => {
                let cx = left + (right - left) * 0.5,
                    cy = top + (bottom - top) * 0.5;

                points.push({ x: left,  y: top,    z: z});
                points.push({ x: right, y: top,    z: z});
                points.push({ x: left,  y: bottom, z: z});
                points.push({ x: right, y: bottom, z: z});

                // top left
                if (fn(count, left, top)) build(count + 1, left, top, cx, cy);
                // top right
                if (fn(count, right, top)) build(count + 1, cx, top, right, cy);
                // bottom left
                if (fn(count, left, bottom)) build(count + 1, left, cy, cx, bottom);
                // bottom right
                if (fn(count, right, bottom)) build(count + 1, cx, cy, right, bottom);
            };

        build(0, x - wx, y - wy, x + wx, y + wy);

        return points;
    }

    static genGrid (x, y, z, cx, cy, cz, step) {
        let points = [],
            sx = x - ((cx - 1) * step * 0.5),
            sy = y - ((cy - 1) * step * 0.5),
            pz = z - ((cz - 1) * step * 0.5);

        for (let iz=0; iz < cz; ++iz) {
            let py = sy;
            for (let iy=0; iy < cy; ++iy) {
                let px = sx;
                for (let ix=0; ix < cx; ++ix) {
                    points.push({ x: px, y: py, z: pz });
                    px += step; 
                }
                py += step; 
            }
            pz += step; 
        }

        return points;
    }

    static genTriGrid (x, y, z, cx, cy, cz, step) {
        let points = [],
            hstep = step * 0.5,
            sx = x - ((cx - 1) * step * 0.5),
            sy = y - ((cy - 1) * step * 0.5),
            pz = z - ((cz - 1) * step * 0.5);

        for (let iz=0; iz < cz; ++iz) {
            let py = sy;
            for (let iy=0; iy < cy; ++iy) {
                let px = sx;
                for (let ix=0; ix < cx; ++ix) {
                    points.push({
                        x: px,
                        y: py + (ix % 2 === 0 ? 0 : hstep),
                        z: pz
                    });
                    px += step; 
                }
                py += step; 
            }
            pz += step; 
        }

        return points;
    }

    static genTracers (points, cols, rows) {
        let paths = [],
            goals = Array.prototype.slice.call(arguments, 3),
            finder = new PF.AStarFinder({
                heuristic: PF.Heuristic.chebyshev,
                diagonalMovement: PF.DiagonalMovement.IfAtMostOneObstacle
            });

        let grid = new PF.Grid(cols, rows);
        return goals.map(coords => {
            let result = [ ];

            let a, b = [ coords.shift(), coords.shift() ];
            do {
                a = b,
                b = [ coords.shift(), coords.shift() ];
                let path = finder.findPath(a[0], a[1], b[0], b[1], grid);
                paths.push(path);
                if (result.length) path.shift();
                result = result.concat(path);

                // gen grid for next path
                grid = new PF.Grid(cols, rows);
                paths.forEach(pts => {
                    pts.forEach(pt => {
                        grid.setWalkableAt(pt[0], pt[1], false);
                    });
                });
            } while (coords.length);

            return result.map(pt => {
                let offset = pt[0] + pt[1] * cols;
                return {
                    x: points[offset].x,
                    y: points[offset].y,
                    z: points[offset].z
                };
            });
        });
    }

    static genFlow (rr, x, y, z, velocity, steps, toffset) {
        let points = [{ x: x, y: y, z: z }];

        let pscale = 0.002;
        let tscale = 0.003;
        toffset = toffset || 0;
        for (let i=0; i < steps; ++i) {
            x += velocity * rr.noise4d(x * pscale, y * pscale, z * pscale + toffset, i * tscale);
            y += velocity * rr.noise4d(y * pscale, x * pscale, z * pscale + toffset, i * tscale);
            z += velocity * rr.noise4d(z * pscale, y * pscale, x * pscale + toffset, i * tscale);
            points.push({ x: x, y: y, z: z });
        }

        return points;
    }

}

export default Draft;

/* more complex structures 

diamond gridded backgrounds
gridded backgrounds
cross hatching fields 
dot fields ( each dot can be scalable )
hex fields ( each hex can be scalable )

linear auto-rigging for skeleton animation

map contours ??

sphere shells - wtf do I mean here ?

identi glyphs !!!

*/