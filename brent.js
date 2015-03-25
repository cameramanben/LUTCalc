/* brent.js
* JS implementation of the Brent's method of root finding
*
* 6th February 2015
*
* The 'findRoot' method tries to find the tightest bracket (sign change) to one side or the other of an initial guess 'I'
* and then performs Brent's method. If a given bracket distance suggests roots on either side of 'I', both brackets are
* evaluated and then the root closest to 'I' is returned. If no root is found, extremes are returned which can then be
* replaced with minimum and maximum values found across the set.
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
	this.fMin = this.func.f(a);
	this.b = b;			// For f(x), maximum value of x
	this.fMax = this.func.f(b);
	this.mid = this.func.f((a+b)/2);
// console.log(this.mid);
}
Brent.prototype.minMax = function(x) {
	if (x < this.a) {
		this.a = x;
		this.fMin = this.o;
	} else if (x > this.b) {
		this.b = x;
		this.fMax = this.o;
	}
}
Brent.prototype.getMinMax = function() {
	return { a: this.a, fMin: this.fMin, b: this.b, fMax: this.fMax };
}
Brent.prototype.findRoot = function(I,O) { // Public single root method, O is the f(x) to match to if not zero (root), finds closest root to I
	var tol = 0.00000001; // tolerence - OK for Float64s, too small for Float32s
	if (typeof O === 'number') {
		this.o = O;
	} else {
		this.o = 0;
	}
	var y0 = this.func.f(I) - this.o;
	if (Math.abs(y0)<tol) {
		this.minMax(I);
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
			this.minMax(I-dx);
			return I-dx;
		} else if (Math.abs(yh)<tol) {
			this.minMax(I+dx);
			return I+dx;
		} else {
			dl = yl*y0;
			dh = yh*y0;
			if (dl<0 && dh<0) { // Bracket on both sides of the first guess
				var rl = this.brent(I, y0, I-dx, yl, tol);
				var rh = this.brent(I, y0, I+dx, yh, tol);
				if (Math.abs(rl - I) < Math.abs(rh - I)) {
					this.minMax(rl);
					return rl;
				} else {
					this.minMax(rh);
					return rh;
				}
			} else if (dl<0) { // Bracket below first guess
				var r = this.brent(I, y0, I-dx, yl, tol);
				this.minMax(r);
				return r;
			} else if (dh<0) { // Bracket above first guess
				var r = this.brent(I, y0, I+dx, yh, tol);
				this.minMax(r);
				return r;
			}
		}
	}
// If a bracket can't be found, set to an extreme based on the f(x) value halfway within a<x<b,
// then when finished, iterate through the arrays swapping the extremes for the min and max
// values of x calculated.
	if (O<this.mid) {
		return -65536;
	} else {
		return 65536;
	}
}
Brent.prototype.brent = function(a,fa,b,fb,rtol) {
	var eps = 2.22e-16; // Machine epsilon for Float64Arrays
	var e = 0;
	var tol1, xm, min, tmp;
	var p, q, r, s;
	var fc = fb;
	for (var j=0; j<80; j++) {
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
console.log('none');
    return b;
}