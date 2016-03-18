import Etch from 'lib/viz/Etch';

class Draft {

    constructor () {
        this.etch = new Etch();
    }

    tessellate (step) {
        return this.etch.tessellate(step);
    }

    build (transform) {
        return this.etch.build(transform);
    }

    hexPod (x, y, z, radius, count, step) {
    	for (let i=0; i < count; ++i) {
    		this.etch.drawLoop(x, y, z, 6, radius);
    		radius += step;
    	}
    }

    featherArcR (x, y, z, radius, count, step, r, width, depth, drift) {
    	for (let i=0; i < count; ++i) {
    		let _z = z + (i * -depth),
    			twist = Math.floor((r() - 0.5) * 32),
    			arc = 45 + Math.floor(r() * 20);
    		this.etch.drawSwipe(x, y, _z, 128, radius, width, arc - twist, arc + twist, -drift);
    		radius += width + step;
    	}
    }

	// radial lines - maybe a line sequence along a path ?
	// line edges, swipe edges - I want to draw a circle with multiple radius sizes 
	// line sequences | | | | 
	// repeated chevrons 

}

export default Draft;

/* more complex structures 

recursive squares 


diamond gridded backgrounds
gridded backgrounds
cross hatching fields 
dot fields ( each dot can be scalable )
hex fields ( each hex can be scalable )

vector flows
particle flows ? (next layer up from digram?)


linear auto-rigging for skeleton animation

map contours ??

sphere shells - wtf do I mean here ?

identi glyphs !!!

*/