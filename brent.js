/* brent.js
* JS implementation of the Brent's method of root finding
*
* 6th February 2015
*
* The 'findRoot' method tries to find the tightest bracket (sign change) to one side or the other of an initial guess 'I'
* and then performs Brent's method. If a given bracket distance suggests roots on either side of 'I', both brackets are
* evaluated and then the root closest to 'I' is returned.
*
* Sources of information:
*	Wikipedia: http://en.wikipedia.org/wiki/Brent%27s_method
*	Matlab Script by David Eagle: http://uk.mathworks.com/matlabcentral/fileexchange/39973-a-matlab-script-for-earth-to-mars-mission-design/content/brent.m
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
*/
function Brent(func, a, b) {
	this.func = func;		// Object providing function / data set for analysis - requires a method 'f' which supplies f(x)
	if (typeof a === 'number' && typeof b === 'number') {
		this.setRange(a,b);
	} else {
		this.setRange(0,1);
	}
}
Brent.prototype.setRange = function(a,b) {
	this.a = a;			// For f(x), minimum value of x
	this.b = b;			// For f(x), maximum value of x
}
Brent.prototype.findRoot = function(I,O) { // Public single root method, O is the f(x) to match to if not zero (root), finds closest root to I
	var tol = 0.0000001; // tolerence
	if (typeof O === 'number') {
		this.o = O;
	} else {
		this.o = 0;
	}
	var y0 = this.func.f(I) - this.o;
	if (Math.abs(y0)<tol) {
		return I;
	}
	var dx;
	var yl,yh;
	var dl,dh;
	for (var j=1; j<25; j++) {
		dx = Math.pow(1.04,j) - 1;
		yl = this.func.f(I-dx) - this.o;
		yh = this.func.f(I+dx) - this.o;
		if (Math.abs(yl)<tol) {
			return yl;
		} else if (Math.abs(yh)<tol) {
			return yh;
		} else {
			dl = yl*y0;
			dh = yh*y0;
			if (dl<0 && dh<0) { // Bracket on both sides of the first guess
				var rl = this.brent(I, y0, I-dx, yl, tol);
				var rh = this.brent(I, y0, I+dx, yh, tol);
				if (Math.abs(rl - I) < Math.abs(rh - I)) {
					return rl;
				} else {
					return rh;
				}
			} else if (dl<0) { // Bracket below first guess
				return this.brent(I, y0, I-dx, yl, tol);
			} else if (dh<0) { // Bracket above first guess
				return this.brent(I, y0, I+dx, yh, tol);
			}
		}
	}
	if (I<0.5) {
		return 0;
	} else {
		return 1;
	}
}
Brent.prototype.brent = function(a,fa,b,fb,rtol) {
	var eps = 2.22e-16;
	var e = 0;
	var tol1, xm, min, tmp;
	var p, q, r, s;
	var fc = fb;
	for (var j=0; j<60; j++) {
		if (fb * fc > 0) {
    		c = a;
    		fc = fa;
    		d = b - a;
    		e = d;
    	}
    	if (Math.abs(fc) < Math.abs(fb)) {
    		a = b;
    		b = c;
    		c = a;
    		fa = fb;
    		fb = fc;
    		fc = fa;
    	}
    	tol1 = (2*eps*Math.abs(b))+(0.5*rtol);
    	xm = 0.5 * (c - b);
    	if (Math.abs(xm) <= tol1 || fb === 0) {
    		return b;
    	}
    	if (Math.abs(e) >= tol1 && Math.abs(fa) > Math.abs(fb)) {
    		s = fb / fa;
    		if (a === c) {
    			p = 2*xm*s;
    			q = 1-s;
    		} else {
    			q = fa/fc;
    			r = fb/fc;
    			p = s*((2*xm*q*(q - r))-((b - a)*(r - 1)));
    			q = (q - 1)*(r - 1)*(s - 1);
    		}
    		if (p > 0) {
    			q = -q;
    		}
    		p = Math.abs(p);
    		min = Math.abs(e * q);
    		tmp = (3*xm*q) - Math.abs(tol1*q);
    		if (min < tmp) {
    			min = tmp;
    		}
    		if (2*p < min) {
    			e = d;
    			d = p / q;
    		} else {
    			d = xm;
    			e = d;
    		}
    	} else {
    		d = xm;
    		e = d;
    	}
    	a = b;
    	fa = fb;
    	if (Math.abs(d) > tol1) {
    		b = b + d;
    	} else {
    		if (xm >=0) {
    			b = b + tol1;
    		} else {
    			b = b - tol1;
    		}
    	}
    	fb = this.func.f(b) - this.o;
    }
    return b;
}