/* lut.js
* LUT handling object for the LUTCalc Web App.
* 31st December 2014
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function LUTs() {
}
LUTs.prototype.newLUT = function(d) {
	var params = {};
	if (typeof d.title === 'string') {
		params.title = d.title;
	}
	if (typeof d.format === 'string') {
		params.format = d.format;
	}
	if (typeof d.dims === 'number') {
		this.dims = d.dims;
	} else {
		dims = 1;
	}
	if (typeof d.min !== 'undefined' && (d.min[0] !== 0 || d.min[1] !== 0 || d.min[2] !== 0)) {
		params.fL = d.min[0];
		params.fLR = d.min[0];
		params.fLG = d.min[1];
		params.fLB = d.min[2];
	}
	if (typeof d.max !== 'undefined' && (d.max[0] !== 1 || d.max[1] !== 1 || d.max[2] !== 1)) {
		params.fH = d.max[0];
		params.fHR = d.max[0];
		params.fHG = d.max[1];
		params.fHB = d.max[2];
	}
	if (typeof d.fL === 'number') {
		params.fL = d.fL;
	}
	if (typeof d.fH === 'number') {
		params.fH = d.fH;
	}
	if (typeof d.fLR === 'number') {
		params.fLR = d.fLR;
	}
	if (typeof d.fLG === 'number') {
		params.fLG = d.fLG;
	}
	if (typeof d.fLB === 'number') {
		params.fLB = d.fLB;
	}
	if (typeof d.fHR === 'number') {
		params.fHR = d.fHR;
	}
	if (typeof d.fHG === 'number') {
		params.fHG = d.fHG;
	}
	if (typeof d.fHB === 'number') {
		params.fHB = d.fHB;
	}
	if (typeof d.spline !== 'undefined') {
		params.inSpline = d.spline;
	}
	if (typeof d.meta !== 'undefined') {
		params.meta = d.meta;
	}
	if (d.C.length === 3) {
		params.buffR = d.C[0].slice(0);
		params.buffG = d.C[1].slice(0);
		params.buffB = d.C[2].slice(0);
		if (this.dims === 3) {
			return new LUTVolume(params);
		} else {
			return new LUTRGBSpline(params);
		}
	} else {
		params.buff = d.C[0].slice(0);
		return new LUTSpline(params);
	}
};
// LUTSpline - base spline object; forward only but with arbitrary input range
function LUTSpline(params) {
	// Metadata
	if (typeof params.title === 'string') {
		this.title = params.title;
	} else {
		this.title = '';
	}
	if (typeof params.format === 'string') {
		this.format = params.format;
	} else {
		this.format = '';
	}
	if (typeof params.meta !== 'undefined') {
		this.meta = params.meta;
	} else {
		this.meta = {};
	}
	// Precalculate forward parameters
	this.FD = new Float64Array(params.buff);
	var fm = this.FD.length;
	var mono = this.FD[fm-1]-this.FD[0];
	if (mono >= 0) {
		mono = 1;
	} else if (mono < 0) {
		mono = -1;
	}
	this.FA = new Float64Array(fm);
	this.FB = new Float64Array(fm);
	this.FC = new Float64Array(fm);
	var FP1 = new Float64Array(fm);
	var FD1 = new Float64Array(fm);
	for (var j=0; j<fm; j++) {
		if (j === 0) {
			FP1[0] = this.FD[1];
//			this.FC[0] = (0.1*this.FD[3]) - (0.8*this.FD[2]) + (2.3*this.FD[1]) - (1.6*this.FD[0]);
//			if (this.FC[0]*mono <= 0) { // opposite slope to monotonic
				this.FC[0] = -(0.5*this.FD[2]) + (2*this.FD[1]) - (1.5*this.FD[0]);
				if (this.FC[0]*mono <= 0) { // still opposite slope to monotonic
					this.FC[0] = 0.0075 * mono / (fm-1);
				}
//			}
			FD1[0] = (this.FD[2] - this.FD[0])/2;
		} else if (j < fm-1) {
			FP1[j] = this.FD[j+1];
			this.FC[j] = (this.FD[j+1] - this.FD[j-1])/2;
			if (j === fm-2) {
//				FD1[j] = (-0.1*this.FD[j-2]) + (0.8*this.FD[j-1]) - (2.3*this.FD[j]) + (1.6*this.FD[j+1]);
//				if (FD1[j]*mono <= 0) { // opposite slope to monotonic
					FD1[j] = (0.5*this.FD[j-1]) - (2*this.FD[j]) + (1.5*this.FD[j+1]);
					if (FD1[j]*mono <= 0) { // still opposite slope to monotonic - give up!
						FD1[j] = 0.0075 * mono / (fm-1);
					}
//				}
			} else {
				FD1[j] = (this.FD[j+2] - this.FD[j])/2;
			}
		} else {
			FP1[j] = this.FD[j];
			this.FC[j] = FD1[j-1];
			FD1[j] = FD1[j-1];
		}
		this.FA[j] = (2*this.FD[j]) + this.FC[j] - (2*FP1[j]) + FD1[j];
		this.FB[j] = (-3*this.FD[j]) - (2*this.FC[j]) + (3*FP1[j]) - FD1[j];
	}
	this.FM = fm-1;
	// Set forward range
	this.fS = false;
	if (typeof params.fL === 'undefined' && typeof params.min !== 'undefined' && params.min[0] !== 0) {
		params.fL = params.min[0];
	}
	if (typeof params.fH === 'undefined' && typeof params.max !== 'undefined' && params.max[0] !== 1) {
		params.fH = params.max[0];
	}
	if (typeof params.fH === 'number') {
		this.fH = params.fH;
		if (typeof params.fL === 'number') {
			this.fL = params.fL;
		} else {
			this.fL = 0;
		}
	} else {
		this.fH = 1;
		this.fL = 0;
	}
	this.fLH = this.fH-this.fL;
	if (this.fL !== 0 || this.fH !==1) {
		this.fS = true;
	}
	// Allow for spline input (a bit nuts for 1D, but being robust)
	if (typeof params.inSpline !== 'undefined') {
		this.sin = true;
		this.ins = new LUTQSpline(params.inSpline);
	} else {
		this.sin = false;
	}
}
LUTSpline.prototype.buildL = function() {
	var fm = this.FD.length;
	var mono = this.FD[fm-1]-this.FD[0];
	if (mono >= 0) {
		mono = 1;
	} else if (mono < 0) {
		mono = -1;
	}
	var FP1 = new Float64Array(fm);
	var FD1 = new Float64Array(fm);
	for (var j=0; j<fm; j++) {
		if (j === 0) {
			FP1[0] = this.FD[1];
				this.FC[0] = -(0.5*this.FD[2]) + (2*this.FD[1]) - (1.5*this.FD[0]);
				if (this.FC[0]*mono <= 0) { // still opposite slope to monotonic
					this.FC[0] = 0.0075 * mono / (fm-1);
				}
			FD1[0] = (this.FD[2] - this.FD[0])/2;
		} else if (j < fm-1) {
			FP1[j] = this.FD[j+1];
			this.FC[j] = (this.FD[j+1] - this.FD[j-1])/2;
			if (j === fm-2) {
					FD1[j] = (0.5*this.FD[j-1]) - (2*this.FD[j]) + (1.5*this.FD[j+1]);
					if (FD1[j]*mono <= 0) { // still opposite slope to monotonic - give up!
						FD1[j] = 0.0075 * mono / (fm-1);
					}
			} else {
				FD1[j] = (this.FD[j+2] - this.FD[j])/2;
			}
		} else {
			FP1[j] = this.FD[j];
			this.FC[j] = FD1[j-1];
			FD1[j] = FD1[j-1];
		}
		this.FA[j] = (2*this.FD[j]) + this.FC[j] - (2*FP1[j]) + FD1[j];
		this.FB[j] = (-3*this.FD[j]) - (2*this.FC[j]) + (3*FP1[j]) - FD1[j];
	}
	this.FM = fm-1;
};
LUTSpline.prototype.f = function(L) {
	var s = this.FM;
	var r,l;
	if (this.fS) {
		L = (L - this.fL)/(this.fLH);
	}
	if (this.sin) {
		L = this.ins.f(L);
	}
	L *= s;
	if (L <= 0) {
		return (L * this.FC[0]) + this.FD[0];
	} else if (L >= s) {
		return ((L-s) * this.FC[s]) + this.FD[s];
	} else {
		l = Math.floor(L);
		r = L-l;
		return (((((this.FA[l] * r) + this.FB[l]) * r) + this.FC[l]) * r) + this.FD[l];
	}
};
LUTSpline.prototype.df = function(L) {
	var s = this.FM;
	var o;
	var r,l;
	if (this.fS) {
		L = (L - this.fL)/(this.fLH);
	}
	if (this.sin) {
		L = this.ins.f(L);
	}
	L *= s;
	if (L <= 0) {
		o = s*this.FC[0];
	} else if (L >= s) {
		o = s*this.FC[s];
	} else {
		l = Math.floor(L);
		r = L-l;
		o = s*((((3*this.FA[l] * r) + (2*this.FB[l])) * r) + this.FC[l]);
	}
	// Allow for nonlinear inputs
	if (this.sin) {
		var dO = this.ins.df(L);
		o *= dO;
	}
	if (this.fS) {
		o /= this.fLH;
	}
	return o;
};
LUTSpline.prototype.fCub = function(L) {
	var s = this.FM;
	var r,l;
	if (this.fS) {
		L = (L - this.fL)/(this.fLH);
	}
	if (this.sin) {
		L = this.ins.f(L);
	}
	L *= s;
	if (L <= 0) {
		return (L * this.FC[0]) + this.FD[0];
	} else if (L >= s) {
		return ((L-s) * this.FC[s]) + this.FD[s];
	} else {
		l = Math.floor(L);
		r = L-l;
		return (((((this.FA[l] * r) + this.FB[l]) * r) + this.FC[l]) * r) + this.FD[l];
	}
};
LUTSpline.prototype.fTet = function(L) {
	var s = this.FM;
	var r,l;
	if (this.fS) {
		L = (L - this.fL)/(this.fLH);
	}
	if (this.sin) {
		L = this.ins.f(L);
	}
	L *= s;
	if (L <= 0) {
		return (L * this.FC[0]) + this.FD[0];
	} else if (L >= s) {
		return ((L-s) * this.FC[s]) + this.FD[s];
	} else {
		l = Math.floor(L);
		r = L-l;
		return ((1-r)*this.FD[l]) + (r*this.FD[l+1]);
	}
};
LUTSpline.prototype.fLin = function(L) {
	var s = this.FM;
	var r,l;
	if (this.fS) {
		L = (L - this.fL)/(this.fLH);
	}
	if (this.sin) {
		L = this.ins.f(L);
	}
	L *= s;
	if (L <= 0) {
		return (L * this.FC[0]) + this.FD[0];
	} else if (L >= s) {
		return ((L-s) * this.FC[s]) + this.FD[s];
	} else {
		l = Math.floor(L);
		r = L-l;
		return ((1-r)*this.FD[l]) + (r*this.FD[l+1]);
	}
};
LUTSpline.prototype.FCub = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	var s = this.FM;
	var r,l;
	if (this.fS) {
		for (var j=0; j<m; j++) {
			c[j] = (c[j] - this.fL)/(this.fLH);
		}
	}
	if (this.sin) {
		this.ins.FCub(buff);
	}
	for (var j=0; j<m; j++) {
		c[j] *= s;
		if (c[j] <= 0) {
			c[j] = (c[j] * this.FC[0]) + this.FD[0];
		} else if (c[j] >= s) {
			c[j] = ((c[j]-s) * this.FC[s]) + this.FD[s];
		} else {
			l = Math.floor(c[j]);
			r = c[j]-l;
			c[j] = (((((this.FA[l] * r) + this.FB[l]) * r) + this.FC[l]) * r) + this.FD[l];
		}
	}
};
LUTSpline.prototype.FTet = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	var s = this.FM;
	var r,l;
	if (this.fS) {
		for (var j=0; j<m; j++) {
			c[j] = (c[j] - this.fL)/(this.fLH);
		}
	}
	if (this.sin) {
		this.ins.FCub(buff);
	}
	for (var j=0; j<m; j++) {
		c[j] *= s;
		if (c[j] <= 0) {
			c[j] = (c[j] * this.FC[0]) + this.FD[0];
		} else if (c[j] >= s) {
			c[j] = ((c[j]-s) * this.FC[s]) + this.FD[s];
		} else {
			l = Math.floor(c[j]);
			r = c[j]-l;
			c[j] = ((1-r)*this.FD[l]) + (r*this.FD[l+1]);
		}
	}
};
LUTSpline.prototype.FLin = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	var s = this.FM;
	var r,l;
	if (this.fS) {
		for (var j=0; j<m; j++) {
			c[j] = (c[j] - this.fL)/(this.fLH);
		}
	}
	if (this.sin) {
		this.ins.FCub(buff);
	}
	for (var j=0; j<m; j++) {
		c[j] *= s;
		if (c[j] <= 0) {
			c[j] = (c[j] * this.FC[0]) + this.FD[0];
		} else if (c[j] >= s) {
			c[j] = ((c[j]-s) * this.FC[s]) + this.FD[s];
		} else {
			l = Math.floor(c[j]);
			r = c[j]-l;
			c[j] = ((1-r)*this.FD[l]) + (r*this.FD[l+1]);
		}
	}
};
LUTSpline.prototype.fRGBCub = function(L) {
	var s = this.FM;
	var r,l;
	if (this.fS) {
		L = (L - this.fL)/(this.fLH);
	}
	if (this.sin) {
		L = this.ins.f(L);
	}
	L *= s;
	if (L <= 0) {
		L = (L * this.FC[0]) + this.FD[0];
	} else if (L >= s) {
		L = ((L-s) * this.FC[s]) + this.FD[s];
	} else {
		l = Math.floor(L);
		r = L-l;
		L = (((((this.FA[l] * r) + this.FB[l]) * r) + this.FC[l]) * r) + this.FD[l];
	}
	return new Float64Array([L,L,L]);
};
LUTSpline.prototype.fRGBTet = function(L) {
	var s = this.FM;
	var r,l;
	if (this.fS) {
		L = (L - this.fL)/(this.fLH);
	}
	if (this.sin) {
		L = this.ins.f(L);
	}
	L *= s;
	if (L <= 0) {
		L = (L * this.FC[0]) + this.FD[0];
	} else if (L >= s) {
		L = ((L-s) * this.FC[s]) + this.FD[s];
	} else {
		l = Math.floor(L);
		r = L-l;
		L = ((1-r)*this.FD[l]) + (r*this.FD[l+1]);
	}
	return new Float64Array([L,L,L]);
};
LUTSpline.prototype.fRGBLin = function(L) {
	var s = this.FM;
	var r,l;
	if (this.fS) {
		L = (L - this.fL)/(this.fLH);
	}
	if (this.sin) {
		L = this.ins.f(L);
	}
	L *= s;
	if (L <= 0) {
		L = (L * this.FC[0]) + this.FD[0];
	} else if (L >= s) {
		L = ((L-s) * this.FC[s]) + this.FD[s];
	} else {
		l = Math.floor(L);
		r = L-l;
		L = ((1-r)*this.FD[l]) + (r*this.FD[l+1]);
	}
	return new Float64Array([L,L,L]);
};
LUTSpline.prototype.rgbCub = function(rgb) {
	var out = new Float64Array(rgb.buffer.slice(0));
	this.FCub(out.buffer);
	return out;
};
LUTSpline.prototype.rgbTet = function(rgb) {
	var out = new Float64Array(rgb.buffer.slice(0));
	this.FTet(out.buffer);
	return out;
};
LUTSpline.prototype.rgbLin = function(rgb) {
	var out = new Float64Array(rgb.buffer.slice(0));
	this.FLin(out.buffer);
	return out;
};
LUTSpline.prototype.RGBCub = function(buff) {
	this.FCub(out);
};
LUTSpline.prototype.RGBLin = function(buff) {
	this.FTet(out);
};
LUTSpline.prototype.RGBLin = function(buff) {
	this.FLin(out);
};
LUTSpline.prototype.J = function(rgbIn) {
	// calculate the Jacobian matrix at rgbIn
	if (rgbIn.length === 3) {
		var c = new Float64Array(rgbIn.buffer.slice(0));
		var J = new Float64Array(9);
		var s = this.FM;
		var r,l;
		if (this.fS) {
			c[0] = (c[0] - this.fL)/(this.fLH);
			c[1] = (c[1] - this.fL)/(this.fLH);
			c[2] = (c[2] - this.fL)/(this.fLH);
		}
		if (this.sin) {
			c[0] = this.ins.f(c[0]);
			c[1] = this.ins.f(c[1]);
			c[2] = this.ins.f(c[2]);
		}
		c[0] *= s;
		c[1] *= s;
		c[2] *= s;
		if (c[0] <= 0) {
			J[0] = this.FC[0];
		} else if (c[0] >= s) {
			J[0] = this.FC[s];
		} else {
			l = Math.floor(c[0]);
			r = c[0]-l;
			J[0] = ((((3*this.FA[l] * r) + (2*this.FB[l])) * r) + this.FC[l]);
		}
		if (c[1] <= 0) {
			J[4] = this.FC[0];
		} else if (c[1] >= s) {
			J[4] = this.FC[s];
		} else {
			l = Math.floor(c[1]);
			r = c[1]-l;
			J[4] = ((((3*this.FA[l] * r) + (2*this.FB[l])) * r) + this.FC[l]);
		}
		if (c[2] <= 0) {
			J[8] = this.FC[0];
		} else if (c[2] >= s) {
			J[8] = this.FC[s];
		} else {
			l = Math.floor(c[2]);
			r = c[2]-l;
			J[8] = ((((3*this.FA[l] * r) + (2*this.FB[l])) * r) + this.FC[l]);
		}
		return J;
	} else {
		return false;
	}
};
LUTSpline.prototype.JInv = function(rgbIn) {
	var M = this.J(rgbIn);
	if (M[0] !== 0 && M[4] !== 0 && M[8] !== 0) {
		return new Float64Array([
			1/M[0],	0,		0,
			0,		1/M[4],	0,
			0,		0,		1/M[8]
		]);
	} else {
		return false;
	}
};
LUTSpline.prototype.getDetails = function() {
	var out = {
		title: this.title,
		format: this.format,
		dims: 1,
		s: this.FM+1,
		min: new Float64Array([this.fL,this.fL,this.fL]),
		max: new Float64Array([this.fH,this.fH,this.fH]),
		C: [this.FD.buffer],
		meta: this.meta
	};
	return out;
};
LUTSpline.prototype.getL = function() {
	return this.FD.buffer;
};
LUTSpline.prototype.getRGB = function() {
	return [this.FD.buffer];
};
LUTSpline.prototype.getSize = function() {
	return this.FM+1;
};
LUTSpline.prototype.is1D = function() {
	return true;
};
LUTSpline.prototype.is3D = function() {
	return false;
};
LUTSpline.prototype.getTitle = function() {
	return this.title;
};
LUTSpline.prototype.getMetadata = function() {
	return this.meta;
};
LUTSpline.prototype.isClamped = function() {
	if (typeof this.clamped === 'undefined') {
		var mm = this.minMax();
		if ((mm[0] === 0 && mm[1] <= 1) || (mm[0] >= 0 && mm[1] === 1)) {
			this.clamped = true;
		} else {
			this.clamped = false;
		}
	}
	return this.clamped;
};
LUTSpline.prototype.deClamp = function() {
	if (this.isClamped()) {
		var m,c,C,L,H,LH,S;
		var fL,fH,fLH;
		var FD = this.FD;
		m = FD.length;
		var C = false;
		var L = 0;
		var H = m-1;
		for (var j=0; j<m; j++) {
			if (j>0) {
				if (FD[j] === 0) {
					C = true;
					L = j+1;
				}
			}
		}
		for (var j=m-2; j>=0; j--) {
			if (FD[j] === 1) {
				C = true;
				H = j-1;
			}
		}
		if (C) {
			if (L > H) {
				var low = H;
				var H = Math.min(L-2,m-1);
				var L = Math.max(low+2,0);
			}
			var LH = H-L;
			var S = new LUTQSpline(new Float64Array(c.subarray(L,LH+1)).buffer);
			var fL = this.fL;
			var fH = this.fH;
			var fLH= fH-fL;
			for (var j=0; j<m; j++) {
				if (j===L) {
					j = H;
				}
				// pass through the splines
				FD[j] = S.fCub((j - L)/LH);
			}
		}
		this.buildL();
		this.clamped = false;
	}
};
LUTSpline.prototype.minMax = function() {
	var x = new Float64Array([
		 9999,	// Absolute min value
		-9999	// Absolute max value
	]);
	var FD = this.FD;
	var m = FD.length;
	for (var j=0; j<m; j++) {
		if (FD[j] < x[0]) {
			x[0] = FD[j];
		}
		if (FD[j] > x[1]) {
			x[1] = FD[j];
		}
	}
	return x;
};
// LUTRSpline - spline object with arbitrary input range and inverse automatically calculated
function LUTRSpline(params) {
	this.method = 0; // choose which approach to use on 'f(x)', cubic, or linear - used by brent to calculate the reverse
	// Metadata
	if (typeof params.title === 'string') {
		this.title = params.title;
	} else {
		this.title = '';
	}
	if (typeof params.format === 'string') {
		this.format = params.format;
	} else {
		this.format = '';
	}
	if (typeof params.meta !== 'undefined') {
		this.meta = params.meta;
	} else {
		this.meta = {};
	}
	// Precalculate forward parameters
	this.FD = new Float64Array(params.buff);
	var fm = this.FD.length;
	var mono = this.FD[fm-1]-this.FD[0];
	if (mono >= 0) {
		mono = 1;
	} else if (mono < 0) {
		mono = -1;
	}
	this.FA = new Float64Array(fm);
	this.FB = new Float64Array(fm);
	this.FC = new Float64Array(fm);
	var FP1 = new Float64Array(fm);
	var FD1 = new Float64Array(fm);
	for (var j=0; j<fm; j++) {
		if (j === 0) {
			FP1[0] = this.FD[1];
//			this.FC[0] = (0.1*this.FD[3]) - (0.8*this.FD[2]) + (2.3*this.FD[1]) - (1.6*this.FD[0]);
//			if (this.FC[0]*mono <= 0) { // opposite slope to monotonic
				this.FC[0] = -(0.5*this.FD[2]) + (2*this.FD[1]) - (1.5*this.FD[0]);
				if (this.FC[0]*mono <= 0) { // still opposite slope to monotonic
					this.FC[0] = 0.0075 * mono / (fm-1);
				}
//			}
			FD1[0] = (this.FD[2] - this.FD[0])/2;
		} else if (j < fm-1) {
			FP1[j] = this.FD[j+1];
			this.FC[j] = (this.FD[j+1] - this.FD[j-1])/2;
			if (j === fm-2) {
//				FD1[j] = (-0.1*this.FD[j-2]) + (0.8*this.FD[j-1]) - (2.3*this.FD[j]) + (1.6*this.FD[j+1]);
//				if (FD1[j]*mono <= 0) { // opposite slope to monotonic
					FD1[j] = (0.5*this.FD[j-1]) - (2*this.FD[j]) + (1.5*this.FD[j+1]);
					if (FD1[j]*mono <= 0) { // still opposite slope to monotonic - give up!
						FD1[j] = 0.0075 * mono / (fm-1);
					}
//				}
			} else {
				FD1[j] = (this.FD[j+2] - this.FD[j])/2;
			}
		} else {
			FP1[j] = this.FD[j];
			this.FC[j] = FD1[j-1];
			FD1[j] = FD1[j-1];
		}
		this.FA[j] = (2*this.FD[j]) + this.FC[j] - (2*FP1[j]) + FD1[j];
		this.FB[j] = (-3*this.FD[j]) - (2*this.FC[j]) + (3*FP1[j]) - FD1[j];
	}
	this.FM = fm-1;
	// Allow for spline input (a bit nuts for 1D, but being robust)
	if (typeof params.inSpline !== 'undefined') {
		this.sin = true;
		this.ins = new LUTQSpline(params.inSpline);
	} else {
		this.sin = false;
	}
	// Set forward range
	this.fS = false;
	if (typeof params.fL === 'undefined' && typeof params.min !== 'undefined' && params.min[0] !== 0) {
		params.fL = params.min[0];
	}
	if (typeof params.fH === 'undefined' && typeof params.max !== 'undefined' && params.max[0] !== 1) {
		params.fH = params.max[0];
	}
	if (typeof params.fH === 'number') {
		this.fH = params.fH;
		if (typeof params.fL === 'number') {
			this.fL = params.fL;
		} else {
			this.fL = 0;
		}
	} else {
		this.fH = 1;
		this.fL = 0;
	}
	this.fLH = this.fH-this.fL;
	if (this.fL !== 0 || this.fH !==1) {
		this.fS = true;
	}
	// Set reverse range
	if (typeof params.rL === 'undefined' && typeof params.rmin !== 'undefined' && params.rmin[0] !== 0) {
		params.rL = params.rmin[0];
	}
	if (typeof params.rH === 'undefined' && typeof params.rmax !== 'undefined' && params.rmax[0] !== 1) {
		params.rH = params.rmax[0];
	}
	if (typeof params.rH === 'number') {
		this.rH = rH;
		if (typeof params.rL === 'number') {
			this.rL = rL;
		} else {
			this.rL = this.fL;
		}
	} else {
		this.rH = this.FD[fm - 1];
		this.rL = this.FD[0];
	}
	this.rLH = this.rH-this.rL;
	// Create reverse data points
	var rm;
	if (typeof params.minRM === 'number') {
		rm = Math.max(fm, minRM);
	} else {
		rm = Math.max(fm, 1024);
	}
	this.RM = rm-1;
	this.brent = new Brent(this);
	this.buildReverse();
}
LUTRSpline.prototype.f = function(L) {
	var s = this.FM;
	var r,l;
	if (this.fS) {
		L = (L - this.fL)/(this.fLH);
	}
	if (this.sin) {
		L = this.ins.f(L);
	}
	L *= s;
	if (L <= 0) {
		return (L * this.FC[0]) + this.FD[0];
	} else if (L >= s) {
		return ((L-s) * this.FC[s]) + this.FD[s];
	} else {
		l = Math.floor(L);
		r = L-l;
		if (this.method === 0) { // cubic
			return (((((this.FA[l] * r) + this.FB[l]) * r) + this.FC[l]) * r) + this.FD[l];
		} else { // tetrahedral or linear
			return ((1-r)*this.FD[l]) + (r*this.FD[l+1]);
		}
	}
};
LUTRSpline.prototype.df = function(L) {
	var s = this.FM;
	var o;
	var r,l;
	if (this.fS) {
		L = (L - this.fL)/(this.fLH);
	}
	if (this.sin) {
		L = this.ins.f(L);
	}
	L *= s;
	if (L <= 0) {
		o = s*this.FC[0];
	} else if (L >= s) {
		o = s*this.FC[s];
	} else {
		l = Math.floor(L);
		r = L-l;
		if (this.method === 0) { // cubic
			o = s*((((3*this.FA[l] * r) + (2*this.FB[l])) * r) + this.FC[l]);
		} else { // tetrahedral or linear
			return s*(this.FD[l+1]-this.FD[l]);
		}
	}
	// Allow for nonlinear inputs
	if (this.sin) {
		var dO = this.ins.df(L);
		o *= dO;
	}
	if (this.fS) {
		o /= this.fLH;
	}
	return o;
};
LUTRSpline.prototype.fCub = function(L) {
	var s = this.FM;
	var r,l;
	if (this.fS) {
		L = (L - this.fL)/(this.fLH);
	}
	if (this.sin) {
		L = this.ins.f(L);
	}
	L *= s;
	if (L <= 0) {
		return (L * this.FC[0]) + this.FD[0];
	} else if (L >= s) {
		return ((L-s) * this.FC[s]) + this.FD[s];
	} else {
		l = Math.floor(L);
		r = L-l;
		return (((((this.FA[l] * r) + this.FB[l]) * r) + this.FC[l]) * r) + this.FD[l];
	}
};
LUTRSpline.prototype.fTet = function(L) {
	var s = this.FM;
	var r,l;
	if (this.fS) {
		L = (L - this.fL)/(this.fLH);
	}
	if (this.sin) {
		L = this.ins.f(L);
	}
	L *= s;
	if (L <= 0) {
		return (L * this.FC[0]) + this.FD[0];
	} else if (L >= s) {
		return ((L-s) * this.FC[s]) + this.FD[s];
	} else {
		l = Math.floor(L);
		r = L-l;
		return ((1-r)*this.FD[l]) + (r*this.FD[l+1]);
	}
};
LUTRSpline.prototype.fLin = function(L) {
	var s = this.FM;
	var r,l;
	if (this.fS) {
		L = (L - this.fL)/(this.fLH);
	}
	if (this.sin) {
		L = this.ins.f(L);
	}
	L *= s;
	if (L <= 0) {
		return (L * this.FC[0]) + this.FD[0];
	} else if (L >= s) {
		return ((L-s) * this.FC[s]) + this.FD[s];
	} else {
		l = Math.floor(L);
		r = L-l;
		return ((1-r)*this.FD[l]) + (r*this.FD[l+1]);
	}
};
LUTRSpline.prototype.FCub = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	var s = this.FM;
	var r,l;
	if (this.fS) {
		for (var j=0; j<m; j++) {
			c[j] = (c[j] - this.fL)/(this.fLH);
		}
	}
	if (this.sin) {
		this.ins.FCub(buff);
	}
	for (var j=0; j<m; j++) {
		c[j] *= s;
		if (c[j] <= 0) {
			c[j] = (c[j] * this.FC[0]) + this.FD[0];
		} else if (c[j] >= s) {
			c[j] = ((c[j]-s) * this.FC[s]) + this.FD[s];
		} else {
			l = Math.floor(c[j]);
			r = c[j]-l;
			c[j] = (((((this.FA[l] * r) + this.FB[l]) * r) + this.FC[l]) * r) + this.FD[l];
		}
	}
};
LUTRSpline.prototype.FTet = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	var s = this.FM;
	var r,l;
	if (this.fS) {
		for (var j=0; j<m; j++) {
			c[j] = (c[j] - this.fL)/(this.fLH);
		}
	}
	if (this.sin) {
		this.ins.FCub(buff);
	}
	for (var j=0; j<m; j++) {
		c[j] *= s;
		if (c[j] <= 0) {
			c[j] = (c[j] * this.FC[0]) + this.FD[0];
		} else if (c[j] >= s) {
			c[j] = ((c[j]-s) * this.FC[s]) + this.FD[s];
		} else {
			l = Math.floor(c[j]);
			r = c[j]-l;
			c[j] = ((1-r)*this.FD[l]) + (r*this.FD[l+1]);
		}
	}
};
LUTRSpline.prototype.FLin = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	var s = this.FM;
	var r,l;
	if (this.fS) {
		for (var j=0; j<m; j++) {
			c[j] = (c[j] - this.fL)/(this.fLH);
		}
	}
	if (this.sin) {
		this.ins.FCub(buff);
	}
	for (var j=0; j<m; j++) {
		c[j] *= s;
		if (c[j] <= 0) {
			c[j] = (c[j] * this.FC[0]) + this.FD[0];
		} else if (c[j] >= s) {
			c[j] = ((c[j]-s) * this.FC[s]) + this.FD[s];
		} else {
			l = Math.floor(c[j]);
			r = c[j]-l;
			c[j] = ((1-r)*this.FD[l]) + (r*this.FD[l+1]);
		}
	}
};
LUTRSpline.prototype.fRGBCub = function(L) {
	L = this.f(L);
	return new Float64Array([L,L,L]);
};
LUTRSpline.prototype.fRGBTet = function(L) {
	L = this.fLin(L);
	return new Float64Array([L,L,L]);
};
LUTRSpline.prototype.fRGBLin = function(L) {
	L = this.fLin(L);
	return new Float64Array([L,L,L]);
};
LUTRSpline.prototype.rgbCub = function(rgb) {
	var out = new Float64Array(rgb.buffer.slice(0));
	this.FCub(out.buffer);
	return out;
};
LUTRSpline.prototype.rgbTet = function(rgb) {
	var out = new Float64Array(rgb.buffer.slice(0));
	this.FLin(out.buffer);
	return out;
};
LUTRSpline.prototype.rgbLin = function(rgb) {
	var out = new Float64Array(rgb.buffer.slice(0));
	this.FLin(out.buffer);
	return out;
};
LUTRSpline.prototype.RGBCub = function(buff) {
	this.FCub(out);
};
LUTRSpline.prototype.RGBTet = function(buff) {
	this.FLin(out);
};
LUTRSpline.prototype.RGBLin = function(buff) {
	this.FLin(out);
};
LUTRSpline.prototype.J = function(rgbIn) {
	// calculate the Jacobian matrix at rgbIn
	if (rgbIn.length === 3) {
		var c = new Float64Array(rgbIn.buffer.slice(0));
		var J = new Float64Array(9);
		var s = this.FM;
		var r,l;
		if (this.fS) {
			c[0] = (c[0] - this.fL)/(this.fLH);
			c[1] = (c[1] - this.fL)/(this.fLH);
			c[2] = (c[2] - this.fL)/(this.fLH);
		}
		if (this.sin) {
			c[0] = this.ins.f(c[0]);
			c[1] = this.ins.f(c[1]);
			c[2] = this.ins.f(c[2]);
		}
		c[0] *= s;
		c[1] *= s;
		c[2] *= s;
		if (c[0] <= 0) {
			J[0] = this.FC[0];
		} else if (c[0] >= s) {
			J[0] = this.FC[s];
		} else {
			l = Math.floor(c[0]);
			r = c[0]-l;
			J[0] = ((((3*this.FA[l] * r) + (2*this.FB[l])) * r) + this.FC[l]);
		}
		if (c[1] <= 0) {
			J[4] = this.FC[0];
		} else if (c[1] >= s) {
			J[4] = this.FC[s];
		} else {
			l = Math.floor(c[1]);
			r = c[1]-l;
			J[4] = ((((3*this.FA[l] * r) + (2*this.FB[l])) * r) + this.FC[l]);
		}
		if (c[2] <= 0) {
			J[8] = this.FC[0];
		} else if (c[2] >= s) {
			J[8] = this.FC[s];
		} else {
			l = Math.floor(c[2]);
			r = c[2]-l;
			J[8] = ((((3*this.FA[l] * r) + (2*this.FB[l])) * r) + this.FC[l]);
		}
		return J;
	} else {
		return false;
	}
};
LUTRSpline.prototype.JInv = function(rgbIn) {
	var M = this.J(rgbIn);
	if (M[0] !== 0 && M[4] !== 0 && M[8] !== 0) {
		return new Float64Array([
			1/M[0],	0,		0,
			0,		1/M[4],	0,
			0,		0,		1/M[8]
		]);
	} else {
		return false;
	}
};
LUTRSpline.prototype.getDetails = function() {
	var out = {
		title: this.title,
		format: this.format,
		dims: 1,
		s: this.FM+1,
		min: new Float64Array([this.fL,this.fL,this.fL]),
		max: new Float64Array([this.fH,this.fH,this.fH]),
		C: [this.FD.buffer],
		meta: this.meta
	};
	return out;
};
LUTRSpline.prototype.getL = function() {
	return this.FD.buffer;
};
LUTRSpline.prototype.getRGB = function() {
	return [this.FD.buffer];
};
LUTRSpline.prototype.getSize = function() {
	return this.FM+1;
};
LUTRSpline.prototype.is1D = function() {
	return true;
};
LUTRSpline.prototype.is3D = function() {
	return false;
};
LUTRSpline.prototype.getTitle = function() {
	return this.title;
};
LUTRSpline.prototype.getMetadata = function() {
	return this.meta;
};
//
LUTRSpline.prototype.r = function(L) {
	var s = this.RM;
	var r,l;
	L = s * (L - this.rL)/(this.rLH);
	if (L <= 0) {
		return (L * this.RC[0]) + this.RD[0];
	} else if (L >= s) {
		return ((L-s) * this.RC[s]) + this.RD[s];
	} else {
		l = Math.floor(L);
		r = L-l;
		if (this.method === 0) { // cubic
			return (((((this.RA[l] * r) + this.RB[l]) * r) + this.RC[l]) * r) + this.RD[l];
		} else { // tetrahedral or linear
			return ((1-r)*this.RD[l]) + (r*this.RD[l+1]);
		}
	}
};
LUTRSpline.prototype.R = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	var s = this.RM;
	var r,l;
	for (var j=0; j<m; j++) {
		c[j] = s * (c[j] - this.rL)/(this.rLH);
		if (c[j] <= 0) {
			c[j] = (c[j] * this.RC[0]) + this.RD[0];
		} else if (c[j] >= s) {
			c[j] = ((c[j]-s) * this.RC[s]) + this.RD[s];
		} else {
			l = Math.floor(c[j]);
			r = c[j]-l;
			if (this.method === 0) { // cubic
				c[j] = (((((this.RA[l] * r) + this.RB[l]) * r) + this.RC[l]) * r) + this.RD[l];
			} else { // tetrahedral or linear
				c[j] = ((1-r)*this.RD[l]) + (r*this.RD[l+1]);
			}
		}
	}
};
LUTRSpline.prototype.buildReverse = function() {
	var rm = this.RM + 1;
	this.RD = new Float64Array(rm);
	var x;
	for (var j=0; j<rm; j++) {
		x = ((j/(rm-1))*(this.rLH)) + this.rL;
		if (j === 0 || x <= 0 || isNaN(this.RD[j-1]) || this.RD[j-1] <= -65534 || this.RD[j-1] >= 65534) {
			this.RD[j] = this.brent.findRoot(x,x);
		} else {
			this.RD[j] = this.brent.findRoot(this.RD[j-1],x);
		}
		if (this.RD[j] < -65534) {
			this.RD[j] = -65534;
		} else if (this.RD[j] > 65534) {
			this.RD[j] = 65534;
		}
	}
	if (isNaN(this.RD[0])) {
		for (var j=0; j<rm; j++) {
			if (!isNaN(this.RD[j])) {
				this.RD[0] = this.RD[j];
				break;
			}
		}
	}
	for (var j=1; j<rm; j++) {
		if (isNaN(this.RD[j])) {
			this.RD[j] = this.RD[j-1];
		}
	}
	for (var j=1; j<rm; j++) {
		this.RD[j] = (this.RD[j] * this.fLH) + this.fL;
	}
	mono = this.RD[rm-1]-this.RD[0]; // If things are working, should be unchanged, but belt and braces....
	if (mono >= 0) {
		mono = 1;
	} else if (mono < 0) {
		mono = -1;
	}
	// Precalculate reverse parameters
	this.RA = new Float64Array(rm);
	this.RB = new Float64Array(rm);
	this.RC = new Float64Array(rm);
	var RP1 = new Float64Array(rm);
	var RD1 = new Float64Array(rm);
	for (var j=0; j<rm; j++) {
		if (j === 0) {
			RP1[0] = this.RD[1];
//			this.RC[0] = (0.1*this.RD[3]) - (0.8*this.RD[2]) + (2.3*this.RD[1]) - (1.6*this.RD[0]);
//			if (this.RC[0]*mono <= 0) { // opposite slope to monotonic
				this.RC[0] = -(0.5*this.RD[2]) + (2*this.RD[1]) - (1.5*this.RD[0]);
				if (this.RC[0]*mono <= 0) { // still opposite slope to monotonic
					this.RC[0] = 0.0075 * mono / (rm-1);
				}
//			}
			RD1[0] = (this.RD[2] - this.RD[0])/2;
		} else if (j < rm-1) {
			RP1[j] = this.RD[j+1];
			this.RC[j] = (this.RD[j+1] - this.RD[j-1])/2
			if (j === rm-2) {
//				RD1[j] = (-0.1*this.RD[j-2]) + (0.8*this.RD[j-1]) - (2.3*this.RD[j]) + (1.6*this.RD[j+1]);
//				if (RD1[j]*mono <= 0) { // opposite slope to monotonic
					RD1[j] = (0.5*this.RD[j-1]) - (2*this.RD[j]) + (1.5*this.RD[j+1]);
					if (RD1[j]*mono <= 0) { // still opposite slope to monotonic - give up!
						RD1[j] = 0.0075 * mono / (rm-1);
					}
//				}
			} else {
				RD1[j] = (this.RD[j+2] - this.RD[j])/2;
			}
		} else {
			RP1[j] = this.RD[j];
			this.RC[j] = RD1[j-1];
			RD1[j] = RD1[j-1];
		}
		this.RA[j] = (2*this.RD[j]) + this.RC[j] - (2*RP1[j]) + RD1[j];
		this.RB[j] = (-3*this.RD[j]) - (2*this.RC[j]) + (3*RP1[j]) - RD1[j];
	}
};
LUTRSpline.prototype.setMethod = function(idx) {
	if (typeof idx === 'number') {
		this.method = idx;
		this.buildReverse();
		return true;
	} else {
		return false;
	}
};
LUTRSpline.prototype.getMethod = function() {
	return this.method;
};
LUTRSpline.prototype.getReverse = function() {
	return this.RD.buffer;
};
LUTRSpline.prototype.getMinMax = function() {
	var a=0;
	var b=1;
	var m = this.RD.length;
	for (var j=0; j<m; j++) {
		if (this.RD[j] > b) {
			b = this.RD[j];
		} else if (this.RD[j] < a) {
			a = this.RD[j];
		}
	}
	return {a: a, b: b};
};
LUTRSpline.prototype.getHighLow = function() {
	return {forH:this.fH,forL:this.fL,revH:this.rH,revL:this.rL}
};
LUTRSpline.prototype.getRM = function() {
	return this.RM + 1;
};
LUTRSpline.prototype.getR = function() {
	return this.RD.buffer;
};
// LUTQSpline - spline object paired down to forward only and mesh over 0-1.0
function LUTQSpline(buff) {
	this.meta = {};
	// Precalculate forward parameters
	this.FD = new Float64Array(buff);
	var fm = this.FD.length;
	var mono = this.FD[fm-1]-this.FD[0];
	if (mono >= 0) {
		mono = 1;
	} else if (mono < 0) {
		mono = -1;
	}
	this.FA = new Float64Array(fm);
	this.FB = new Float64Array(fm);
	this.FC = new Float64Array(fm);
	var FP1 = new Float64Array(fm);
	var FD1 = new Float64Array(fm);
	for (var j=0; j<fm; j++) {
		if (j === 0) {
			FP1[0] = this.FD[1];
//			this.FC[0] = (0.1*this.FD[3]) - (0.8*this.FD[2]) + (2.3*this.FD[1]) - (1.6*this.FD[0]);
//			if (this.FC[0]*mono <= 0) { // opposite slope to monotonic
				this.FC[0] = -(0.5*this.FD[2]) + (2*this.FD[1]) - (1.5*this.FD[0]);
				if (this.FC[0]*mono <= 0) { // still opposite slope to monotonic
					this.FC[0] = 0.0075 * mono / (fm-1);
				}
//			}
			FD1[0] = (this.FD[2] - this.FD[0])/2;
		} else if (j < fm-1) {
			FP1[j] = this.FD[j+1];
			this.FC[j] = (this.FD[j+1] - this.FD[j-1])/2;
			if (j === fm-2) {
//				FD1[j] = (-0.1*this.FD[j-2]) + (0.8*this.FD[j-1]) - (2.3*this.FD[j]) + (1.6*this.FD[j+1]);
//				if (FD1[j]*mono <= 0) { // opposite slope to monotonic
					FD1[j] = (0.5*this.FD[j-1]) - (2*this.FD[j]) + (1.5*this.FD[j+1]);
					if (FD1[j]*mono <= 0) { // still opposite slope to monotonic - give up!
						FD1[j] = 0.0075 * mono / (fm-1);
					}
//				}
			} else {
				FD1[j] = (this.FD[j+2] - this.FD[j])/2;
			}
		} else {
			FP1[j] = this.FD[j];
			this.FC[j] = FD1[j-1];
			FD1[j] = FD1[j-1];
		}
		this.FA[j] = (2*this.FD[j]) + this.FC[j] - (2*FP1[j]) + FD1[j];
		this.FB[j] = (-3*this.FD[j]) - (2*this.FC[j]) + (3*FP1[j]) - FD1[j];
	}
	this.FM = fm-1;
}
LUTQSpline.prototype.f = function(L) {
	var s = this.FM;
	var r,l;
	L *= s;
	if (L <= 0) {
		return (L * this.FC[0]) + this.FD[0];
	} else if (L >= s) {
		return ((L-s) * this.FC[s]) + this.FD[s];
	} else {
		l = Math.floor(L);
		r = L-l;
		return (((((this.FA[l] * r) + this.FB[l]) * r) + this.FC[l]) * r) + this.FD[l];
	}
};
LUTQSpline.prototype.df = function(L) {
	var s = this.FM;
	var o;
	var r,l;
	L *= s;
	if (L <= 0) {
		return s*this.FC[0];
	} else if (L >= s) {
		return s*this.FC[s];
	} else {
		l = Math.floor(L);
		r = L-l;
		return s*((((3*this.FA[l] * r) + (2*this.FB[l])) * r) + this.FC[l]);
	}
};
LUTQSpline.prototype.fCub = function(L) {
	var s = this.FM;
	var r,l;
	L *= s;
	if (L <= 0) {
		return (L * this.FC[0]) + this.FD[0];
	} else if (L >= s) {
		return ((L-s) * this.FC[s]) + this.FD[s];
	} else {
		l = Math.floor(L);
		r = L-l;
		return (((((this.FA[l] * r) + this.FB[l]) * r) + this.FC[l]) * r) + this.FD[l];
	}
};
LUTQSpline.prototype.fTet = function(L) {
	var s = this.FM;
	var r,l;
	L *= s;
	if (L <= 0) {
		return (L * this.FC[0]) + this.FD[0];
	} else if (L >= s) {
		return ((L-s) * this.FC[s]) + this.FD[s];
	} else {
		l = Math.floor(L);
		r = L-l;
		return ((1-r)*this.FD[l]) + (r*this.FD[l+1]);
	}
};
LUTQSpline.prototype.fLin = function(L) {
	var s = this.FM;
	var r,l;
	L *= s;
	if (L <= 0) {
		return (L * this.FC[0]) + this.FD[0];
	} else if (L >= s) {
		return ((L-s) * this.FC[s]) + this.FD[s];
	} else {
		l = Math.floor(L);
		r = L-l;
		return ((1-r)*this.FD[l]) + (r*this.FD[l+1]);
	}
};
LUTQSpline.prototype.FCub = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	var s = this.FM;
	var r,l;
	for (var j=0; j<m; j++) {
		c[j] *= s;
		if (c[j] <= 0) {
			c[j] = (c[j] * this.FC[0]) + this.FD[0];
		} else if (c[j] >= s) {
			c[j] = ((c[j]-s) * this.FC[s]) + this.FD[s];
		} else {
			l = Math.floor(c[j]);
			r = c[j]-l;
			c[j] = (((((this.FA[l] * r) + this.FB[l]) * r) + this.FC[l]) * r) + this.FD[l];
		}
	}
};
LUTQSpline.prototype.FTet = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	var s = this.FM;
	var r,l;
	for (var j=0; j<m; j++) {
		c[j] *= s;
		if (c[j] <= 0) {
			c[j] = (c[j] * this.FC[0]) + this.FD[0];
		} else if (c[j] >= s) {
			c[j] = ((c[j]-s) * this.FC[s]) + this.FD[s];
		} else {
			l = Math.floor(c[j]);
			r = c[j]-l;
			c[j] = ((1-r)*this.FD[l]) + (r*this.FD[l+1]);
		}
	}
};
LUTQSpline.prototype.FLin = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	var s = this.FM;
	var r,l;
	for (var j=0; j<m; j++) {
		c[j] *= s;
		if (c[j] <= 0) {
			c[j] = (c[j] * this.FC[0]) + this.FD[0];
		} else if (c[j] >= s) {
			c[j] = ((c[j]-s) * this.FC[s]) + this.FD[s];
		} else {
			l = Math.floor(c[j]);
			r = c[j]-l;
			c[j] = ((1-r)*this.FD[l]) + (r*this.FD[l+1]);
		}
	}
};
LUTQSpline.prototype.fRGBCub = function(L) {
	L = this.f(L);
	return new Float64Array([L,L,L]);
};
LUTQSpline.prototype.fRGBTet = function(L) {
	L = this.fLin(L);
	return new Float64Array([L,L,L]);
};
LUTQSpline.prototype.fRGBLin = function(L) {
	L = this.fLin(L);
	return new Float64Array([L,L,L]);
};
LUTQSpline.prototype.rgbCub = function(rgb) {
	var out = new Float64Array(rgb.buffer.slice(0));
	this.FCub(out.buffer);
	return out;
};
LUTQSpline.prototype.rgbTet = function(rgb) {
	var out = new Float64Array(rgb.buffer.slice(0));
	this.FLin(out.buffer);
	return out;
};
LUTQSpline.prototype.rgbLin = function(rgb) {
	var out = new Float64Array(rgb.buffer.slice(0));
	this.FLin(out.buffer);
	return out;
};
LUTQSpline.prototype.RGBCub = function(buff) {
	this.FCub(out);
};
LUTQSpline.prototype.RGBTet = function(buff) {
	this.FLin(out);
};
LUTQSpline.prototype.RGBLin = function(buff) {
	this.FLin(out);
};
LUTQSpline.prototype.J = function(rgbIn) {
	// calculate the Jacobian matrix at rgbIn
	if (rgbIn.length === 3) {
		var c = new Float64Array(rgbIn.buffer.slice(0));
		var J = new Float64Array(9);
		var s = this.FM;
		var r,l;
		c[0] *= s;
		c[1] *= s;
		c[2] *= s;
		if (c[0] <= 0) {
			J[0] = this.FC[0];
		} else if (c[0] >= s) {
			J[0] = this.FC[s];
		} else {
			l = Math.floor(c[0]);
			r = c[0]-l;
			J[0] = ((((3*this.FA[l] * r) + (2*this.FB[l])) * r) + this.FC[l]);
		}
		if (c[1] <= 0) {
			J[4] = this.FC[0];
		} else if (c[1] >= s) {
			J[4] = this.FC[s];
		} else {
			l = Math.floor(c[1]);
			r = c[1]-l;
			J[4] = ((((3*this.FA[l] * r) + (2*this.FB[l])) * r) + this.FC[l]);
		}
		if (c[2] <= 0) {
			J[8] = this.FC[0];
		} else if (c[2] >= s) {
			J[8] = this.FC[s];
		} else {
			l = Math.floor(c[2]);
			r = c[2]-l;
			J[8] = ((((3*this.FA[l] * r) + (2*this.FB[l])) * r) + this.FC[l]);
		}
		J[0] *= s;
		J[4] *= s;
		J[8] *= s;
		return J;
	} else {
		return false;
	}
};
LUTQSpline.prototype.JInv = function(rgbIn) {
	var M = this.J(rgbIn);
	if (M[0] !== 0 && M[4] !== 0 && M[8] !== 0) {
		return new Float64Array([
			1/M[0],	0,		0,
			0,		1/M[4],	0,
			0,		0,		1/M[8]
		]);
	} else {
		return false;
	}
};
LUTQSpline.prototype.getDetails = function() {
	return {
		title: '',
		format: '',
		dims: 1,
		s: this.FM+1,
		min: new Float64Array([0,0,0]),
		max: new Float64Array([1,1,1]),
		C: [this.FD.buffer],
		meta: this.meta
	};
};
LUTQSpline.prototype.getL = function() {
	return this.FD.buffer;
};
LUTQSpline.prototype.getRGB = function() {
	return [this.FD.buffer];
};
LUTQSpline.prototype.getSize = function() {
	return this.FM+1;
};
LUTQSpline.prototype.is1D = function() {
	return true;
};
LUTQSpline.prototype.is3D = function() {
	return false;
};
LUTQSpline.prototype.getTitle = function() {
	return '';
};
LUTQSpline.prototype.getMetadata = function() {
	return this.meta;
};
//
LUTQSpline.prototype.dRGB = function(rgbIn) {
	// no point in a full, square Jacobian matrix for a 1D LUT
	if (rgbIn.length === 3) {
		var c = new Float64Array(rgbIn.buffer.slice(0));
		var o = new Float64Array(3);
		var s = this.FM;
		var r,l;
		c[0] *= s;
		c[1] *= s;
		c[2] *= s;
		if (c[0] <= 0) {
			o[0] = this.FC[0];
		} else if (c[0] >= s) {
			o[0] = this.FC[s];
		} else {
			l = Math.floor(c[0]);
			r = c[0]-l;
			o[0] = ((((3*this.FA[l] * r) + (2*this.FB[l])) * r) + this.FC[l]);
		}
		if (c[1] <= 0) {
			o[1] = this.FC[0];
		} else if (c[1] >= s) {
			o[1] = this.FC[s];
		} else {
			l = Math.floor(c[1]);
			r = c[1]-l;
			o[1] = ((((3*this.FA[l] * r) + (2*this.FB[l])) * r) + this.FC[l]);
		}
		if (c[2] <= 0) {
			o[2] = this.FC[0];
		} else if (c[2] >= s) {
			o[2] = this.FC[s];
		} else {
			l = Math.floor(c[2]);
			r = c[2]-l;
			o[2] = ((((3*this.FA[l] * r) + (2*this.FB[l])) * r) + this.FC[l]);
		}
		o[0] *= s;
		o[1] *= s;
		o[2] *= s;
		return o;
	} else {
		return false;
	}
};
// LUTRGBSpline - spline object with different 1D splines for each RGB channel
function LUTRGBSpline(params) {
	// Metadata
	if (typeof params.title === 'string') {
		this.title = params.title;
	} else {
		this.title = '';
	}
	if (typeof params.format === 'string') {
		this.format = params.format;
	} else {
		this.format = '';
	}
	if (typeof params.meta !== 'undefined') {
		this.meta = params.meta;
	} else {
		this.meta = {};
	}
	this.Y = new Float64Array([0.2126,0.7152,0.0722]); // Rec709 luma coefficients
	// Set forward range
	this.fL = new Float64Array(4);
	this.fH = new Float64Array(4);
	this.fS = false;
	if (typeof params.min !== 'undefined' && (params.min[0] !== 0 || params.min[1] !== 0 || params.min[2] !== 0)) {
		params.fL = params.min[0];
		params.fLR = params.min[0];
		params.fLG = params.min[1];
		params.fLB = params.min[2];
	}
	if (typeof params.max !== 'undefined' && (params.max[0] !== 1 || params.max[1] !== 1 || params.max[2] !== 1)) {
		params.fH = params.max[0];
		params.fHR = params.max[0];
		params.fHG = params.max[1];
		params.fHB = params.max[2];
	}
	if (typeof params.fH === 'number') {
		this.fH[0] = params.fH;
		this.fH[1] = params.fH;
		this.fH[2] = params.fH;
	} else {
		this.fH[0] = 1;
		this.fH[1] = 1;
		this.fH[2] = 1;
	}
	if (typeof params.fL === 'number') {
		this.fL[0] = params.fL;
		this.fL[1] = params.fL;
		this.fL[2] = params.fL;
	} else {
		this.fL[0] = 0;
		this.fL[1] = 0;
		this.fL[2] = 0;
	}
	if (typeof params.fLR === 'number' &&
		typeof params.fHR === 'number' &&
		typeof params.fLG === 'number' &&
		typeof params.fHG === 'number' &&
		typeof params.fLB === 'number' &&
		typeof params.fHB === 'number') {
		this.fL[0] = params.fLR;
		this.fH[0] = params.fHR;
		this.fL[1] = params.fLG;
		this.fH[1] = params.fHG;
		this.fL[2] = params.fLB;
		this.fH[2] = params.fHB;
	}
	this.fLH = new Float64Array([this.fH[0]-this.fL[0],this.fH[1]-this.fL[1],this.fH[2]-this.fL[2],0]);
	if (this.fL[0] !== 0 || this.fL[1] !== 0 || this.fL[2] !== 0 || this.fH[0] !== 1 || this.fH[1] !== 1 || this.fH[2] !== 1) {
		this.fS = true;
	}
	// Allow for spline input (a bit nuts for 1D, but being robust)
	if (typeof params.inSpline !== 'undefined') {
		this.sin = true;
		this.ins = new LUTQSpline(params.inSpline);
	} else {
		this.sin = false;
	}
	// Create three separate splines for the red, green and blue channels.
	this.FA = [];
	this.FB = [];
	this.FC = [];
	this.FD = [];
	this.FM = [];
	this.FD[0] = new Float64Array(params.buffR);
	this.FD[1] = new Float64Array(params.buffG);
	this.FD[2] = new Float64Array(params.buffB);
	var fm;
	for (var i=0; i<3; i++) {
		fm = this.FD[i].length;
		this.FA[i] = new Float64Array(fm);
		this.FB[i] = new Float64Array(fm);
		this.FC[i] = new Float64Array(fm);
		this.FM[i] = fm-1;
	}
	this.buildMesh();
	// Precalculate Luma arrays
	this.buildL();
}
LUTRGBSpline.prototype.buildMesh = function() {
	var buff,fm,mono;
	var FP1,FD1;
	// Precalculate forward parameters
	for (var i=0; i<3; i++) {
		fm = this.FD[i].length;
		mono = this.FD[i][fm-1]-this.FD[i][0];
		if (mono >= 0) {
			mono = 1;
		} else if (mono < 0) {
			mono = -1;
		}
		FP1 = new Float64Array(fm);
		FD1 = new Float64Array(fm);
		for (var j=0; j<fm; j++) {
			if (j === 0) {
				FP1[0] = this.FD[i][1];
//				this.FC[i][0] = (0.1*this.FD[i][3]) - (0.8*this.FD[i][2]) + (2.3*this.FD[i][1]) - (1.6*this.FD[i][0]);
//				if (this.FC[i][0]*mono <= 0) { // opposite slope to monotonic
					this.FC[i][0] = -(0.5*this.FD[i][2]) + (2*this.FD[i][1]) - (1.5*this.FD[i][0]);
					if (this.FC[i][0]*mono <= 0) { // still opposite slope to monotonic
						this.FC[i][0] = 0.0075 * mono / (fm-1);
					}
//				}
				FD1[0] = (this.FD[i][2] - this.FD[i][0])/2;
			} else if (j < fm-1) {
				FP1[j] = this.FD[i][j+1];
				this.FC[i][j] = (this.FD[i][j+1] - this.FD[i][j-1])/2;
				if (j === fm-2) {
//					FD1[j] = (-0.1*this.FD[i][j-2]) + (0.8*this.FD[i][j-1]) - (2.3*this.FD[i][j]) + (1.6*this.FD[i][j+1]);
//					if (FD1[j]*mono <= 0) { // opposite slope to monotonic
						FD1[j] = (0.5*this.FD[i][j-1]) - (2*this.FD[i][j]) + (1.5*this.FD[i][j+1]);
						if (FD1[j]*mono <= 0) { // still opposite slope to monotonic - give up!
							FD1[j] = 0.0075 * mono / (fm-1);
						}
//					}
				} else {
					FD1[j] = (this.FD[i][j+2] - this.FD[i][j])/2;
				}
			} else {
				FP1[j] = this.FD[i][j];
				this.FC[i][j] = FD1[j-1];
				FD1[j] = FD1[j-1];
			}
			this.FA[i][j] = (2*this.FD[i][j]) + this.FC[i][j] - (2*FP1[j]) + FD1[j];
			this.FB[i][j] = (-3*this.FD[i][j]) - (2*this.FC[i][j]) + (3*FP1[j]) - FD1[j];
		}
	}
};
LUTRGBSpline.prototype.buildL = function() {
	this.fL[3] = Math.min(this.fL[0],this.fL[1],this.fL[2]);
	this.fH[3] = Math.max(this.fH[0],this.fH[1],this.fH[2]);
	this.fLH[3]= this.fH[3]-this.fL[3];
	this.FM[3] = Math.max(this.FM[0],this.FM[1],this.FM[2]);
	if (this.FM[3] < 64) {
		this.FM[3] = 64;
	}
	var m = this.FM[3] + 1;
	this.FD[3] = new Float64Array(m);
	var input,L,s,r,l,mono;
	// First build array of luma values from RGB splines
	for (var j=0; j<m; j++) {
		input = (j*(this.fLH[3])/(m-1))+this.fL[3];
		for (var i=0; i<3; i++) {
			s = this.FM[i];
			L = (input - this.fL[i])/(this.fLH[i]);
			if (this.sin) {
				L = this.ins.f(L);
			}
			L *= s;
			if (L <= 0) {
				L = (L * this.FC[i][0]) + this.FD[i][0];
			} else if (L >= s) {
				L = ((L-s) * this.FC[i][s]) + this.FD[i][s];
			} else {
				l = Math.floor(L);
				r = L-l;
				L = (((((this.FA[i][l] * r) + this.FB[i][l]) * r) + this.FC[i][l]) * r) + this.FD[i][l];
			}
			this.FD[3][j] += L * this.Y[i];
		}
	}
	// Now precalculate forward parameters
	this.FA[3] = new Float64Array(m);
	this.FB[3] = new Float64Array(m);
	this.FC[3] = new Float64Array(m);
	var FP1 = new Float64Array(m);
	var FD1 = new Float64Array(m);
	mono = this.FD[3][m-1]-this.FD[3][0];
	if (mono >= 0) {
		mono = 1;
	} else if (mono < 0) {
		mono = -1;
	}
	for (var j=0; j<m; j++) {
		if (j === 0) {
			FP1[0] = this.FD[3][1];
//			this.FC[3][0] = (0.1*this.FD[3][3]) - (0.8*this.FD[3][2]) + (2.3*this.FD[3][1]) - (1.6*this.FD[3][0]);
//			if (this.FC[3][0]*mono <= 0) { // opposite slope to monotonic
				this.FC[3][0] = -(0.5*this.FD[3][2]) + (2*this.FD[3][1]) - (1.5*this.FD[3][0]);
				if (this.FC[3][0]*mono <= 0) { // still opposite slope to monotonic
					this.FC[3][0] = 0.0075 * mono / (m-1);
				}
//			}
			FD1[0] = (this.FD[3][2] - this.FD[3][0])/2;
		} else if (j < m-1) {
			FP1[j] = this.FD[3][j+1];
			this.FC[3][j] = (this.FD[3][j+1] - this.FD[3][j-1])/2;
			if (j === m-2) {
//				FD1[j] = (-0.1*this.FD[3][j-2]) + (0.8*this.FD[3][j-1]) - (2.3*this.FD[3][j]) + (1.6*this.FD[3][j+1]);
//				if (FD1[j]*mono <= 0) { // opposite slope to monotonic
					FD1[j] = (0.5*this.FD[3][j-1]) - (2*this.FD[3][j]) + (1.5*this.FD[3][j+1]);
					if (FD1[j]*mono <= 0) { // still opposite slope to monotonic - give up!
						FD1[j] = 0.0075 * mono / (m-1);
					}
//				}
			} else {
				FD1[j] = (this.FD[3][j+2] - this.FD[3][j])/2;
			}
		} else {
			FP1[j] = this.FD[3][j];
			this.FC[3][j] = FD1[j-1];
			FD1[j] = FD1[j-1];
		}
		this.FA[3][j] = (2*this.FD[3][j]) + this.FC[3][j] - (2*FP1[j]) + FD1[j];
		this.FB[3][j] = (-3*this.FD[3][j]) - (2*this.FC[3][j]) + (3*FP1[j]) - FD1[j];
	}
};
LUTRGBSpline.prototype.f = function(L) {
	var s = this.FM[3];
	var r,l;
	if (this.fS) {
		L = s * (L - this.fL[3])/(this.fLH[3]);
	} else {
		L *= s;
	}
	if (L <= 0) {
		return (L * this.FC[3][0]) + this.FD[3][0];
	} else if (L >= s) {
		return ((L-s) * this.FC[3][s]) + this.FD[3][s];
	} else {
		l = Math.floor(L);
		r = L-l;
		return (((((this.FA[3][l] * r) + this.FB[3][l]) * r) + this.FC[3][l]) * r) + this.FD[3][l];
	}
};
LUTRGBSpline.prototype.df = function(L) {
	var s = this.FM[3];
	var o;
	var r,l;
	if (this.fS) {
		L = s * (L - this.fL[3])/(this.fLH[3]);
	} else {
		L *= s;
	}
	if (L <= 0) {
		o = s*this.FC[3][0];
	} else if (L >= s) {
		o = s*this.FC[3][s];
	} else {
		l = Math.floor(L);
		r = L-l;
		o = s*((((3*this.FA[3][l] * r) + (2*this.FB[3][l])) * r) + this.FC[3][l]);
	}
	// Allow for scaled inputs
	if (this.fS) {
		o /= this.fLH[3];
	}
	return o;
};
LUTRGBSpline.prototype.fCub = function(L) {
	var s = this.FM[3];
	var r,l;
	if (this.fS) {
		L = s * (L - this.fL[3])/(this.fLH[3]);
	} else {
		L *= s;
	}
	if (L <= 0) {
		return (L * this.FC[3][0]) + this.FD[3][0];
	} else if (L >= s) {
		return ((L-s) * this.FC[3][s]) + this.FD[3][s];
	} else {
		l = Math.floor(L);
		r = L-l;
		return (((((this.FA[3][l] * r) + this.FB[3][l]) * r) + this.FC[3][l]) * r) + this.FD[3][l];
	}
};
LUTRGBSpline.prototype.fTet = function(L) {
	var s = this.FM[3];
	var r,l;
	if (this.fS) {
		L = s * (L - this.fL[3])/(this.fLH[3]);
	} else {
		L *= s;
	}
	if (L <= 0) {
		return (L * this.FC[3][0]) + this.FD[3][0];
	} else if (L >= s) {
		return ((L-s) * this.FC[3][s]) + this.FD[3][s];
	} else {
		l = Math.floor(L);
		r = L-l;
		return ((1-r)*this.FD[3][l]) + (r*this.FD[3][l+1]);
	}
};
LUTRGBSpline.prototype.fLin = function(L) {
	var s = this.FM[3];
	var r,l;
	if (this.fS) {
		L = s * (L - this.fL[3])/(this.fLH[3]);
	} else {
		L *= s;
	}
	if (L <= 0) {
		return (L * this.FC[3][0]) + this.FD[3][0];
	} else if (L >= s) {
		return ((L-s) * this.FC[3][s]) + this.FD[3][s];
	} else {
		l = Math.floor(L);
		r = L-l;
		return ((1-r)*this.FD[3][l]) + (r*this.FD[3][l+1]);
	}
};
LUTRGBSpline.prototype.FCub = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	var s = this.FM[3];
	var fL = this.fL[3];
	var fLH = this.fLH[3];
	var r,l;
	if (this.fS) {
		for (var j=0; j<m; j++) {
			c[j] = (c[j] - fL)/(fLH);
		}
	}
	for (var j=0; j<m; j++) {
		c[j] *= s;
		if (c[j] <= 0) {
			c[j] = (c[j] * this.FC[3][0]) + this.FD[3][0];
		} else if (c[j] >= s) {
			c[j] = ((c[j]-s) * this.FC[3][s]) + this.FD[3][s];
		} else {
			l = Math.floor(c[j]);
			r = c[j]-l;
			c[j] = (((((this.FA[3][l] * r) + this.FB[3][l]) * r) + this.FC[3][l]) * r) + this.FD[3][l];
		}
	}
};
LUTRGBSpline.prototype.FTet = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	var s = this.FM[3];
	var fL = this.fL[3];
	var fLH = this.fLH[3];
	var r,l;
	if (this.fS) {
		for (var j=0; j<m; j++) {
			c[j] = s * (c[j] - fL)/(fLH);
		}
	}
	for (var j=0; j<m; j++) {
		c[j] *= s;
		if (c[j] <= 0) {
			c[j] = (c[j] * this.FC[3][0]) + this.FD[3][0];
		} else if (c[j] >= s) {
			c[j] = ((c[j]-s) * this.FC[3][s]) + this.FD[3][s];
		} else {
			l = Math.floor(c[j]);
			r = c[j]-l;
			c[j] = ((1-r)*this.FD[3][l]) + (r*this.FD[3][l+1]);
		}
	}
};
LUTRGBSpline.prototype.FLin = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	var s = this.FM[3];
	var fL = this.fL[3];
	var fLH = this.fLH[3];
	var r,l;
	if (this.fS) {
		for (var j=0; j<m; j++) {
			c[j] = s * (c[j] - fL)/(fLH);
		}
	}
	for (var j=0; j<m; j++) {
		c[j] *= s;
		if (c[j] <= 0) {
			c[j] = (c[j] * this.FC[3][0]) + this.FD[3][0];
		} else if (c[j] >= s) {
			c[j] = ((c[j]-s) * this.FC[3][s]) + this.FD[3][s];
		} else {
			l = Math.floor(c[j]);
			r = c[j]-l;
			c[j] = ((1-r)*this.FD[3][l]) + (r*this.FD[3][l+1]);
		}
	}
};
LUTRGBSpline.prototype.fRGBCub = function(L) {
	var s;
	var r,l;
	var o = new Float64Array(3);
	if (this.fS) {
		o[0] = (L - this.fL[0])/(this.fLH[0]);
		o[1] = (L - this.fL[1])/(this.fLH[1]);
		o[2] = (L - this.fL[2])/(this.fLH[2]);
	}
	if (this.sin) {
		this.ins.FCub(o.buffer);
	}
	for (var i=0; i<3; i++) {
		s = this.FM[i];
		o[i] *= s;
		if (o[i] <= 0) {
			o[i] = (o[i] * this.FC[i][0]) + this.FD[i][0];
		} else if (o[i] >= s) {
			o[i] = ((o[i]-s) * this.FC[i][s]) + this.FD[i][s];
		} else {
			l = Math.floor(o[i]);
			r = o[i]-l;
			o[i] = (((((this.FA[i][l] * r) + this.FB[i][l]) * r) + this.FC[i][l]) * r) + this.FD[i][l];
		}
	}
	return o;
};
LUTRGBSpline.prototype.fRGBTet = function(L) {
	var s;
	var r,l;
	var o = new Float64Array(3);
	if (this.fS) {
		o[0] = (L - this.fL[0])/(this.fLH[0]);
		o[1] = (L - this.fL[1])/(this.fLH[1]);
		o[2] = (L - this.fL[2])/(this.fLH[2]);
	}
	if (this.sin) {
		this.ins.FCub(o.buffer);
	}
	for (var i=0; i<3; i++) {
		s = this.FM[i];
		o[i] *= s;
		if (o[i] <= 0) {
			o[i] = (o[i] * this.FC[i][0]) + this.FD[i][0];
		} else if (o[i] >= s) {
			o[i] = ((o[i]-s) * this.FC[i][s]) + this.FD[i][s];
		} else {
			l = Math.floor(o[i]);
			r = o[i]-l;
			o[j] = ((1-r)*this.FD[i][l]) + (r*this.FD[i][l+1]);
		}
	}
	return o;
};
LUTRGBSpline.prototype.fRGBLin = function(L) {
	var s;
	var r,l;
	var o = new Float64Array(3);
	if (this.fS) {
		o[0] = (L - this.fL[0])/(this.fLH[0]);
		o[1] = (L - this.fL[1])/(this.fLH[1]);
		o[2] = (L - this.fL[2])/(this.fLH[2]);
	}
	if (this.sin) {
		this.ins.FCub(o.buffer);
	}
	for (var i=0; i<3; i++) {
		s = this.FM[i];
		o[i] *= s;
		if (o[i] <= 0) {
			o[i] = (o[i] * this.FC[i][0]) + this.FD[i][0];
		} else if (o[i] >= s) {
			o[i] = ((o[i]-s) * this.FC[i][s]) + this.FD[i][s];
		} else {
			l = Math.floor(o[i]);
			r = o[i]-l;
			o[j] = ((1-r)*this.FD[i][l]) + (r*this.FD[i][l+1]);
		}
	}
	return o;
};
LUTRGBSpline.prototype.rgbCub = function(rgb) {
	var out = new Float64Array(rgb.buffer.slice(0));
	this.RGBCub(out.buffer);
	return out;
};
LUTRGBSpline.prototype.rgbTet = function(rgb) {
	var out = new Float64Array(rgb.buffer.slice(0));
	this.RGBLin(out.buffer);
	return out;
};
LUTRGBSpline.prototype.rgbLin = function(rgb) {
	var out = new Float64Array(rgb.buffer.slice(0));
	this.RGBLin(out.buffer);
	return out;
};
LUTRGBSpline.prototype.RGBCub = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	var fL = this.fL;
	var fLH = this.fLH;
	var s,k,l,r;
	if (this.fS) {
		for (var j=0; j<m; j+=3) {
			c[ j ] = (c[ j ] - fL[0])/(fLH[0]);
			c[j+1] = (c[j+1] - fL[1])/(fLH[1]);
			c[j+2] = (c[j+2] - fL[2])/(fLH[2]);
		}
	}
	if (this.sin) {
		this.ins.FCub(buff);
	}
	for (var i=0; i<3; i++) {
		s = this.FM[i];
		for (var j=0; j<m; j+=3) {
			k = j+i;
			c[k] *= s;
			if (c[k] <= 0) {
				c[k] = (c[k] * this.FC[i][0]) + this.FD[i][0];
			} else if (c[k] >= s) {
				c[k] = ((c[k]-s) * this.FC[i][s]) + this.FD[i][s];
			} else {
				l = Math.floor(c[k]);
				r = c[k]-l;
				c[k] = (((((this.FA[i][l] * r) + this.FB[i][l]) * r) + this.FC[i][l]) * r) + this.FD[i][l];
			}
		}
	}
};
LUTRGBSpline.prototype.RGBTet = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	var fL = this.fL;
	var fLH = this.fLH;
	var s,k,l,r;
	if (this.fS) {
		for (var j=0; j<m; j+=3) {
			c[ j ] = (c[ j ] - fL[0])/(fLH[0]);
			c[j+1] = (c[j+1] - fL[1])/(fLH[1]);
			c[j+2] = (c[j+2] - fL[2])/(fLH[2]);
		}
	}
	if (this.sin) {
		this.ins.FCub(buff);
	}
	for (var i=0; i<3; i++) {
		s = this.FM[i];
		for (var j=0; j<m; j+=3) {
			k = j+i;
			c[k] *= s;
			if (c[k] <= 0) {
				c[k] = (c[k] * this.FC[i][0]) + this.FD[i][0];
			} else if (c[k] >= s) {
				c[k] = ((c[k]-s) * this.FC[i][s]) + this.FD[i][s];
			} else {
				l = Math.floor(c[k]);
				r = c[k]-l;
				c[j] = ((1-r)*this.FD[i][l]) + (r*this.FD[i][l+1]);
			}
		}
	}
};
LUTRGBSpline.prototype.RGBLin = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	var fL = this.fL;
	var fLH = this.fLH;
	var s,k,l,r;
	if (this.fS) {
		for (var j=0; j<m; j+=3) {
			c[ j ] = (c[ j ] - fL[0])/(fLH[0]);
			c[j+1] = (c[j+1] - fL[1])/(fLH[1]);
			c[j+2] = (c[j+2] - fL[2])/(fLH[2]);
		}
	}
	if (this.sin) {
		this.ins.FCub(buff);
	}
	for (var i=0; i<3; i++) {
		s = this.FM[i];
		for (var j=0; j<m; j+=3) {
			k = j+i;
			c[k] *= s;
			if (c[k] <= 0) {
				c[k] = (c[k] * this.FC[i][0]) + this.FD[i][0];
			} else if (c[k] >= s) {
				c[k] = ((c[k]-s) * this.FC[i][s]) + this.FD[i][s];
			} else {
				l = Math.floor(c[k]);
				r = c[k]-l;
				c[j] = ((1-r)*this.FD[i][l]) + (r*this.FD[i][l+1]);
			}
		}
	}
};
LUTRGBSpline.prototype.J = function(rgbIn) {
	// calculate the Jacobian matrix at rgbIn
	if (rgbIn.length === 3) {
		var c = new Float64Array(rgbIn.buffer.slice(0));
		var J = new Float64Array(9);
		var s;
		var r,l;
		if (this.fS) {
			c[0] = (c[0] - this.fL[0])/(this.fLH[0]);
			c[1] = (c[1] - this.fL[1])/(this.fLH[1]);
			c[2] = (c[2] - this.fL[2])/(this.fLH[2]);
		}
		if (this.sin) {
			c[0] = this.ins.f(c[0]);
			c[1] = this.ins.f(c[1]);
			c[2] = this.ins.f(c[2]);
		}
		s = this.FM[0];
		c[0] *= s;
		if (c[0] <= 0) {
			J[0] = this.FC[0][0];
		} else if (c[0] >= s) {
			J[0] = this.FC[0][s];
		} else {
			l = Math.floor(c[0]);
			r = c[0]-l;
			J[0] = ((((3*this.FA[0][l] * r) + (2*this.FB[0][l])) * r) + this.FC[0][l]);
		}
		s = this.FM[1];
		c[1] *= s;
		if (c[1] <= 0) {
			J[4] = this.FC[1][0];
		} else if (c[1] >= s) {
			J[4] = this.FC[1][s];
		} else {
			l = Math.floor(c[1]);
			r = c[1]-l;
			J[4] = ((((3*this.FA[1][l] * r) + (2*this.FB[1][l])) * r) + this.FC[1][l]);
		}
		s = this.FM[2];
		c[2] *= s;
		if (c[2] <= 0) {
			J[8] = this.FC[2][0];
		} else if (c[2] >= s) {
			J[8] = this.FC[2][s];
		} else {
			l = Math.floor(c[2]);
			r = c[2]-l;
			J[8] = ((((3*this.FA[2][l] * r) + (2*this.FB[2][l])) * r) + this.FC[2][l]);
		}
		// Scale to 0-1 range (from 0-s)
		J[0] *= s;
		J[1] *= s;
		J[2] *= s;
		J[3] *= s;
		J[4] *= s;
		J[5] *= s;
		J[6] *= s;
		J[7] *= s;
		J[8] *= s;
		if (this.sin) {
			var dRGB = this.ins.dRGB(rgbIn.buffer);
			J[0] *= dRGB[0];
			J[1] *= dRGB[1];
			J[2] *= dRGB[2];
			J[3] *= dRGB[0];
			J[4] *= dRGB[1];
			J[5] *= dRGB[2];
			J[6] *= dRGB[0];
			J[7] *= dRGB[1];
			J[8] *= dRGB[2];
		}
		if (this.fS) {
			J[0] /= fLH[0];
			J[1] /= fLH[1];
			J[2] /= fLH[2];
			J[3] /= fLH[0];
			J[4] /= fLH[1];
			J[5] /= fLH[2];
			J[6] /= fLH[0];
			J[7] /= fLH[1];
			J[8] /= fLH[2];
		}
		return J;
	} else {
		return false;
	}
};
LUTRGBSpline.prototype.JInv = function(rgbIn) {
	var M = this.J(rgbIn);
	if (M[0] !== 0 && M[4] !== 0 && M[8] !== 0) {
		return new Float64Array([
			1/M[0],	0,		0,
			0,		1/M[4],	0,
			0,		0,		1/M[8]
		]);
	} else {
		return false;
	}
};
LUTRGBSpline.prototype.getDetails = function(L) {
	var out;
	if (typeof L !== 'undefined' && L ) {
		out = {
			title: this.title,
			format: this.format,
			dims: 1,
			s: this.FM[3]+1,
			min: new Float64Array([this.fL[3],this.fL[3],this.fL[3]]),
			max: new Float64Array([this.fH[3],this.fH[3],this.fH[3]]),
			C: [this.FD[3].buffer],
			meta: this.meta
		};
	} else {
		out = {
			title: this.title,
			format: this.format,
			dims: 1,
			s: this.FM[3]+1,
			min: new Float64Array([this.fL[0],this.fL[1],this.fL[2]]),
			max: new Float64Array([this.fH[0],this.fH[1],this.fH[2]]),
			C: [this.FD[0].buffer,this.FD[1].buffer,this.FD[2].buffer],
			meta: this.meta
		};
	}
	return out;
};
LUTRGBSpline.prototype.getL = function() {
	return this.FD[3].buffer;
};
LUTRGBSpline.prototype.getRGB = function() {
	return [this.FD[0].buffer,this.FD[1].buffer,this.FD[2].buffer];
};
LUTRGBSpline.prototype.getSize = function() {
	return this.FM[3]+1;
};
LUTRGBSpline.prototype.is1D = function() {
	return true;
};
LUTRGBSpline.prototype.is3D = function() {
	return false;
};
LUTRGBSpline.prototype.getTitle = function() {
	return this.title;
};
LUTRGBSpline.prototype.getMetadata = function() {
	return this.meta;
};
LUTRGBSpline.prototype.isClamped = function() {
	if (typeof this.clamped === 'undefined') {
		var mm = this.minMax();
		var min = Math.min(mm[0],mm[1],mm[2]);
		var max = Math.max(mm[3],mm[4],mm[5]);
		if ((min === 0 && max <= 1) || (min >= 0 && max === 1)) {
			this.clamped = true;
		} else {
			this.clamped = false;
		}
	}
	return this.clamped;
};
LUTRGBSpline.prototype.deClamp = function() {
	if (this.isClamped()) {
		var m,c,C,L,H,LH,S;
		var fL,fH,fLH;
		for (var i=0; i<3; i++) {
			c = this.FD[i];
			m = c.length;
			C = false;
			L = 0;
			H = m-1;
			for (var j=0; j<m; j++) {
				if (j>0) {
					if (c[j] === 0) {
						C = true;
						L = j+1;
					}
				}
			}
			for (var j=m-2; j>=0; j--) {
				if (c[j] === 1) {
					C = true;
					H = j-1;
				}
			}
			if (C) {
				if (L > H) {
					var low = H;
					H = Math.min(L-2,m-1);
					L = Math.max(low+2,0);
				}
				LH = H-L;
				S = new LUTQSpline(new Float64Array(c.subarray(L,LH+1)).buffer);
				fL = this.fL[i];
				fH = this.fH[i];
				fLH= fH-fL;
				for (var j=0; j<m; j++) {
					if (j===L) {
						j = H;
					}
					// pass through the splines
					c[j] = S.fCub((j - L)/LH);
				}
			}
		}
		this.buildMesh();
		this.buildL();
		this.clamped = false;
	}
};
//
LUTRGBSpline.prototype.getColourSpace = function() {
	var d = this.d;
	var fL = this.fL;
	var fH = this.fH;
	var fLH = this.fLH;
	var out = {
		title: this.title + 'CS',
		format: this.format,
		fLR: fL[0],
		fLG: fL[1],
		fLB: fL[2],
		fHR: fH[0],
		fHG: fH[1],
		fHB: fH[2]
	};
	var reverse = new LUTRSpline({ buff:this.L.getL(), fH:fH[3], fL:fL[3] });
	var base = this.getRGB();
	reverse.R(base[0]);
	reverse.R(base[1]);
	reverse.R(base[2]);
	out.buffR = base[0];
	out.buffG = base[1];
	out.buffB = base[2];
	return new LUTRGBSpline(out);
};
LUTRGBSpline.prototype.compare = function(tgtBuff,tstBuff,method) {
	// returns the RMS differences in the red channels between a target dataset (tgt) and a test dataset (tst) which 'compare' passes through the lut
	// method sets the interpolation method used on the test set, currently trilinear (1, 'lin' or 'linear') or tricubic (anything else or the default if 'method' is not present.
	var tgt = new Float64Array(tgtBuff.slice(0));
	var tst = new Float64Array(tstBuff.slice(0));
	var m = tgt.length;
	if (m !== tst.length) {
		return false;
	}
	if (typeof method !== 'undefined') {
		method = method.toString().toLowerCase();
		if (method === '1' || method === 'tet') {
			this.RGBTet(tst.buffer);
		} else if (method === '2' || method === 'lin') {
			this.RGBLin(tst.buffer);
		} else {
			this.RGBCub(tst.buffer);
		}
	} else {
		this.RGBCub(tst.buffer);
	} 
	var e = new Float64Array(3);
	for (var j=0; j<m; j += 3) {
		e[0]  += Math.pow(tst[ j ] - tgt[ j ],2);
		e[1]  += Math.pow(tst[j+1] - tgt[j+1],2);
		e[2]  += Math.pow(tst[j+2] - tgt[j+2],2);
	}
	e[0] = Math.pow(e[0]*3/m,0.5);
	e[1] = Math.pow(e[1]*3/m,0.5);
	e[2] = Math.pow(e[2]*3/m,0.5);
	return e;
};
LUTRGBSpline.prototype.minMax = function() {
	var x = new Float64Array([
		 9999, 9999, 9999,	// Absolute min values
		-9999,-9999,-9999	// Absolute max values
	]);
	var c,m;
	for (var i=0; i<3; i++) {
		c = this.FD[i];
		m = c.length;
		for (var j=0; j<m; j++) {
			if (c[j] < x[i]) {
				x[i] = c[j];
			}
			if (c[j] > x[i+3]) {
				x[i+3] = c[j];
			}
		}
	}
	return x;
};
// LUTVolume - 3D mesh object
function LUTVolume(params) {
	// Metadata
	if (typeof params.title === 'string') {
		this.title = params.title;
	} else {
		this.title = '';
	}
	if (typeof params.format === 'string') {
		this.format = params.format;
	} else {
		this.format = '';
	}
	if (typeof params.meta !== 'undefined') {
		this.meta = params.meta;
	} else {
		this.meta = {};
	}
	this.Y = new Float64Array([0.2126,0.7152,0.0722]); // Rec709 luma coefficients
	// Set forward range
	this.fL = new Float64Array(4);
	this.fH = new Float64Array(4);
	this.fS = false;
	if (typeof params.min !== 'undefined' && (params.min[0] !== 0 || params.min[1] !== 0 || params.min[2] !== 0)) {
		params.fL = params.min[0];
		params.fLR = params.min[0];
		params.fLG = params.min[1];
		params.fLB = params.min[2];
	}
	if (typeof params.max !== 'undefined' && (params.max[0] !== 1 || params.max[1] !== 1 || params.max[2] !== 1)) {
		params.fH = params.max[0];
		params.fHR = params.max[0];
		params.fHG = params.max[1];
		params.fHB = params.max[2];
	}
	if (typeof params.fH === 'number') {
		this.fH[0] = params.fH;
		this.fH[1] = params.fH;
		this.fH[2] = params.fH;
	} else {
		this.fH[0] = 1;
		this.fH[1] = 1;
		this.fH[2] = 1;
	}
	if (typeof params.fL === 'number') {
		this.fL[0] = params.fL;
		this.fL[1] = params.fL;
		this.fL[2] = params.fL;
	} else {
		this.fL[0] = 0;
		this.fL[1] = 0;
		this.fL[2] = 0;
	}
	if (typeof params.fLR === 'number' &&
		typeof params.fHR === 'number' &&
		typeof params.fLG === 'number' &&
		typeof params.fHG === 'number' &&
		typeof params.fLB === 'number' &&
		typeof params.fHB === 'number') {
		this.fL[0] = params.fLR;
		this.fH[0] = params.fHR;
		this.fL[1] = params.fLG;
		this.fH[1] = params.fHG;
		this.fL[2] = params.fLB;
		this.fH[2] = params.fHB;
	}
	this.fL[3] = Math.min(this.fL[0],this.fL[1],this.fL[2]);
	this.fH[3] = Math.max(this.fH[0],this.fH[1],this.fH[2]);
	this.fLH = new Float64Array([this.fH[0]-this.fL[0],this.fH[1]-this.fL[1],this.fH[2]-this.fL[2],0]);
	if (this.fL[0] !== 0 || this.fL[1] !== 0 || this.fL[2] !== 0 || this.fH[0] !== 1 || this.fH[1] !== 1 || this.fH[2] !== 1) {
		this.fS = true;
	}
	// Allow for spline input (a bit nuts for 1D, but being robust)
	if (typeof params.inSpline !== 'undefined') {
		this.sin = true;
		this.ins = new LUTQSpline(params.inSpline);
	} else {
		this.sin = false;
	}
	// create a 'mesh' object to do the 3D interpolation
	this.pR = new Float64Array(4);
	this.pG = new Float64Array(4);
	this.pB = new Float64Array(4);
	this.buildMesh(params.buffR,params.buffG,params.buffB);
	// Precalculate Luma arrays
	this.buildL();
	// Store some typed arrays for repeat use to minimise garbage collection
	this.extVars= {
		dc: new Float64Array(this.d),
		r: new Float64Array(this.d),
		J: new Float64Array(this.d*3),
		JtJ: new Float64Array(9),
		JtJI: new Float64Array(9),
		Jtr: new Float64Array(3),
		del: new Float64Array(3)
	};
	this.ABab = new Float64Array([1,0,1,0]);
}
LUTVolume.prototype.buildMesh = function(buffR,buffG,buffB) {
	var red = new Float64Array(buffR);
	var green = new Float64Array(buffG);
	var blue = new Float64Array(buffB);
	var Y = new Float64Array([0.2126,0.7152,0.0722]); // Rec709 luma coefficients
	this.d = Math.round(Math.pow(red.length,1/3)); // dimensions of the base mesh
	var d = this.d;
	this.s = d-1;
	var d2 = d*d;
	var d3 = red.length;
	var nd = d + 2;
	this.nd = nd;
	var nd2 = nd * nd;
	var nd3 = nd2 * nd;
	var sG = nd3;
	var sB = 2 * sG;
	this.mesh = new Float64Array(nd3*3); // the new mesh is two points larger per side, with all three channels in one array for speed
	var k = nd2 + nd + 1; // first point in the new mesh at which to place mesh values
	var l=0;
	// create 4x4x4 array of offsets for quickly getting cubic control points;
	this.off = new Float64Array(64);
	for (var b=0; b<4; b++) {
		for (var g=0; g<4; g++) {
			for (var r=0; r<4; r++) {
				this.off[r + (g*4) + (b*16)] = r + (g*nd) + (b*nd2);
			}
		}
	}
	// populate the core of the new mesh with the old one
	for (var b=0; b<d; b++) {
		for (var g=0; g<d; g++) {
			for (var r=0; r<d; r++) { // typedarray slice and copywithin would allow block copying, but are not generally available in IE and Safari JS
				this.mesh[ k  ] = red[l];
				this.mesh[k+sG] = green[l];
				this.mesh[k+sB] = blue[l];
				l++;
				k++;
			}
			k += 2;
		}
		k += 2 * nd;
	}
	// Fill in the gaps around the larger mesh for quicker extrapolation
	this.fillEdges();
	// create object-scope typed arrays to minimise garbage collection
	this.rgb = new Float64Array(18);
	this.R = new Float64Array(8);
	this.G = new Float64Array(8);
	this.B = new Float64Array(8);
};
LUTVolume.prototype.buildL = function() {
	var fL = this.fL[3];
	var fH = this.fH[3];
	var fLH= fH-fL;
	var m = this.getSize();
	if (m < 65) {
		m = 65;
	}
	var FD = new Float64Array(m);
	var rgb = new Float64Array(m*3);
	var m2 = rgb.length;
	var k;
	for (var j=0; j<m; j++) { // create rgb array of input values
		k = j*3;
		rgb[ k ] = (j*(fLH)/(m-1))+fL;
		rgb[k+1] = rgb[k];
		rgb[k+2] = rgb[k];
	}
	// apply input scaling as required
	if (this.fS) {
		for (var j=0; j<m2; j += 3) {
			rgb[ j ] = (rgb[ j ] - this.fL[0])/(this.fLH[0]);
			rgb[j+1] = (rgb[j+1] - this.fL[1])/(this.fLH[1]);
			rgb[j+2] = (rgb[j+2] - this.fL[2])/(this.fLH[2]);
		}
	}
	if (this.sin) {
		this.ins.FCub(rgb.buffer);
	}
	this.RGBCub(rgb.buffer); // calculate output rgb values
	for (var j=0; j<m; j++) {
		k = j*3;
		FD[j] = (rgb[ k ]*this.Y[0]) + (rgb[k+1]*this.Y[1]) + (rgb[k+2]*this.Y[2]);
	}
	this.L = new LUTSpline({ buff:FD.buffer, fH:fH, fL:fL });
};
LUTVolume.prototype.f = function(L) {
	return this.L.f(L);
};
LUTVolume.prototype.df = function(L) {
	return this.L.df(L);
};
LUTVolume.prototype.fCub = function(L) {
	return this.L.fCub(L);
};
LUTVolume.prototype.fTet = function(L) {
	return this.L.fLin(L);
};
LUTVolume.prototype.fLin = function(L) {
	return this.L.fLin(L);
};
LUTVolume.prototype.FCub = function(buff) {
	this.L.FCub(buff);
};
LUTVolume.prototype.FTet = function(buff) {
	this.L.FLin(buff);
};
LUTVolume.prototype.FLin = function(buff) {
	this.L.FLin(buff);
};
LUTVolume.prototype.fRGBCub = function(L) {
	var o = new Float64Array([L,L,L]);
	this.RGBCub(o.buffer);
	return o;
};
LUTVolume.prototype.fRGBTet = function(L) {
	var o = new Float64Array([L,L,L]);
	this.RGBTet(o.buffer);
	return o;
};
LUTVolume.prototype.fRGBLin = function(L) {
	var o = new Float64Array([L,L,L]);
	this.RGBLin(o.buffer);
	return o;
};
LUTVolume.prototype.rgbCub = function(rgbIn) {
	var rgb = new Float64Array(rgbIn.buffer.slice(0));
	this.RGBCub(rgb.buffer);
	return rgb;
};
LUTVolume.prototype.rgbTet = function(rgbIn) {
	var rgb = new Float64Array(rgbIn.buffer.slice(0));
	this.RGBTet(rgb.buffer);
	return rgb;
};
LUTVolume.prototype.rgbLin = function(rgbIn) {
	var rgb = new Float64Array(rgbIn.buffer.slice(0));
	this.RGBLin(rgb.buffer);
	return rgb;
};
LUTVolume.prototype.RGBCub = function(buff) {
	var c = new Float64Array(buff);
	var p = this.mesh;
	var o = this.off;
	var rgb = this.rgb;
	var m = c.length;
	var mm = Math.round(this.mesh.length/3);
	var s = this.s;
	var nd = s + 2;
	var nd1 = nd + 1;
	var k,b;
	var R = this.R;
	var G = this.G;
	var B = this.B;
	var E = false;
	var rE = false;
	var gE = false;
	var bE = false;
	if (this.fS) {
		var fL = this.fL;
		var fLH = this.fLH;
		for (var j=0; j<m; j+=3) {
			c[ j ] = (c[ j ] - fL[0])/(fLH[0]);
			c[j+1] = (c[j+1] - fL[1])/(fLH[1]);
			c[j+2] = (c[j+2] - fL[2])/(fLH[2]);
		}
	}
	if (this.sin) {
		this.ins.FCub(buff);
	}
	for (var j=0; j<m; j +=3) {
		c[ j ] *= s;
		c[j+1] *= s;
		c[j+2] *= s;
		rgb[ 9] = Math.max(0,Math.min(s-1,Math.floor(c[ j ])));
		rgb[10] = Math.max(0,Math.min(s-1,Math.floor(c[j+1])));
		rgb[11] = Math.max(0,Math.min(s-1,Math.floor(c[j+2])));
		c[ j ] -= rgb[ 9];
		c[j+1] -= rgb[10];
		c[j+2] -= rgb[11];
		// clamp values between 0-1.0 for interpolation
		rgb[0] = Math.max(0,Math.min(1,c[ j ]));
		rgb[1] = Math.max(0,Math.min(1,c[j+1]));
		rgb[2] = Math.max(0,Math.min(1,c[j+2]));
		// note that extrapolation will be needed if values were clamped
		if (rgb[0] !== c[ j ]) {
			rE = true;
			E = true;
		}
		if (rgb[1] !== c[j+1]) {
			gE = true;
			E = true;
		}
		if (rgb[2] !== c[j+2]) {
			bE = true;
			E = true;
		}
		// Prep all the squares, cubes and cubics
		rgb[3] = rgb[0]*rgb[0];
		rgb[4] = rgb[1]*rgb[1];
		rgb[5] = rgb[2]*rgb[2];
		rgb[6] = rgb[3]*rgb[0];
		rgb[7] = rgb[4]*rgb[1];
		rgb[8] = rgb[5]*rgb[2];
		R[0] = (-0.5*rgb[6]) + rgb[3] - (0.5*rgb[0]);
		R[1] = (1.5*rgb[6]) - (2.5*rgb[3]) + 1;
		R[2] = (-1.5*rgb[6]) + (2*rgb[3]) + (0.5*rgb[0]);
		R[3] = (0.5*rgb[6]) - (0.5*rgb[3]);
		G[0] = (-0.5*rgb[7]) + rgb[4] - (0.5*rgb[1]);
		G[1] = (1.5*rgb[7]) - (2.5*rgb[4]) + 1;
		G[2] = (-1.5*rgb[7]) + (2*rgb[4]) + (0.5*rgb[1]);
		G[3] = (0.5*rgb[7]) - (0.5*rgb[4]);
		B[0] = (-0.5*rgb[8]) + rgb[5] - (0.5*rgb[2]);
		B[1] = (1.5*rgb[8]) - (2.5*rgb[5]) + 1;
		B[2] = (-1.5*rgb[8]) + (2*rgb[5]) + (0.5*rgb[2]);
		B[3] = (0.5*rgb[8]) - (0.5*rgb[5]);
		// if any or all channels need extrapolation find out the scaling
		if (rE) {
			rgb[12] = c[ j ] - rgb[0];
		}
		if (gE) {
			rgb[13] = c[j+1] - rgb[1];
		}
		if (bE) {
			rgb[14] = c[j+2] - rgb[2];
		}
		// set value for first control point in the mesh - P[-1,-1,-1]
		b = (rgb[9]) + ((rgb[10] + (rgb[11]*nd1))*nd1);
		k = b;
		// multiply and add the cubics and the control points
		c[ j ]  = (((((R[0]*p[k+o[ 0]])+(R[1]*p[k+o[ 1]])+(R[2]*p[k+o[ 2]])+(R[3]*p[k+o[ 3]]))*G[0])+
					(((R[0]*p[k+o[ 4]])+(R[1]*p[k+o[ 5]])+(R[2]*p[k+o[ 6]])+(R[3]*p[k+o[ 7]]))*G[1])+
					(((R[0]*p[k+o[ 8]])+(R[1]*p[k+o[ 9]])+(R[2]*p[k+o[10]])+(R[3]*p[k+o[11]]))*G[2])+
					(((R[0]*p[k+o[12]])+(R[1]*p[k+o[13]])+(R[2]*p[k+o[14]])+(R[3]*p[k+o[15]]))*G[3]))*B[0])+
				  (((((R[0]*p[k+o[16]])+(R[1]*p[k+o[17]])+(R[2]*p[k+o[18]])+(R[3]*p[k+o[19]]))*G[0])+
					(((R[0]*p[k+o[20]])+(R[1]*p[k+o[21]])+(R[2]*p[k+o[22]])+(R[3]*p[k+o[23]]))*G[1])+
					(((R[0]*p[k+o[24]])+(R[1]*p[k+o[25]])+(R[2]*p[k+o[26]])+(R[3]*p[k+o[27]]))*G[2])+
					(((R[0]*p[k+o[28]])+(R[1]*p[k+o[29]])+(R[2]*p[k+o[30]])+(R[3]*p[k+o[31]]))*G[3]))*B[1])+
				  (((((R[0]*p[k+o[32]])+(R[1]*p[k+o[33]])+(R[2]*p[k+o[34]])+(R[3]*p[k+o[35]]))*G[0])+
					(((R[0]*p[k+o[36]])+(R[1]*p[k+o[37]])+(R[2]*p[k+o[38]])+(R[3]*p[k+o[39]]))*G[1])+
					(((R[0]*p[k+o[40]])+(R[1]*p[k+o[41]])+(R[2]*p[k+o[42]])+(R[3]*p[k+o[43]]))*G[2])+
					(((R[0]*p[k+o[44]])+(R[1]*p[k+o[45]])+(R[2]*p[k+o[46]])+(R[3]*p[k+o[47]]))*G[3]))*B[2])+
				  (((((R[0]*p[k+o[48]])+(R[1]*p[k+o[49]])+(R[2]*p[k+o[50]])+(R[3]*p[k+o[51]]))*G[0])+
					(((R[0]*p[k+o[52]])+(R[1]*p[k+o[53]])+(R[2]*p[k+o[54]])+(R[3]*p[k+o[55]]))*G[1])+
					(((R[0]*p[k+o[56]])+(R[1]*p[k+o[57]])+(R[2]*p[k+o[58]])+(R[3]*p[k+o[59]]))*G[2])+
					(((R[0]*p[k+o[60]])+(R[1]*p[k+o[61]])+(R[2]*p[k+o[62]])+(R[3]*p[k+o[63]]))*G[3]))*B[3]);
		k += mm;
		c[j+1]  = (((((R[0]*p[k+o[ 0]])+(R[1]*p[k+o[ 1]])+(R[2]*p[k+o[ 2]])+(R[3]*p[k+o[ 3]]))*G[0])+
					(((R[0]*p[k+o[ 4]])+(R[1]*p[k+o[ 5]])+(R[2]*p[k+o[ 6]])+(R[3]*p[k+o[ 7]]))*G[1])+
					(((R[0]*p[k+o[ 8]])+(R[1]*p[k+o[ 9]])+(R[2]*p[k+o[10]])+(R[3]*p[k+o[11]]))*G[2])+
					(((R[0]*p[k+o[12]])+(R[1]*p[k+o[13]])+(R[2]*p[k+o[14]])+(R[3]*p[k+o[15]]))*G[3]))*B[0])+
				  (((((R[0]*p[k+o[16]])+(R[1]*p[k+o[17]])+(R[2]*p[k+o[18]])+(R[3]*p[k+o[19]]))*G[0])+
					(((R[0]*p[k+o[20]])+(R[1]*p[k+o[21]])+(R[2]*p[k+o[22]])+(R[3]*p[k+o[23]]))*G[1])+
					(((R[0]*p[k+o[24]])+(R[1]*p[k+o[25]])+(R[2]*p[k+o[26]])+(R[3]*p[k+o[27]]))*G[2])+
					(((R[0]*p[k+o[28]])+(R[1]*p[k+o[29]])+(R[2]*p[k+o[30]])+(R[3]*p[k+o[31]]))*G[3]))*B[1])+
				  (((((R[0]*p[k+o[32]])+(R[1]*p[k+o[33]])+(R[2]*p[k+o[34]])+(R[3]*p[k+o[35]]))*G[0])+
					(((R[0]*p[k+o[36]])+(R[1]*p[k+o[37]])+(R[2]*p[k+o[38]])+(R[3]*p[k+o[39]]))*G[1])+
					(((R[0]*p[k+o[40]])+(R[1]*p[k+o[41]])+(R[2]*p[k+o[42]])+(R[3]*p[k+o[43]]))*G[2])+
					(((R[0]*p[k+o[44]])+(R[1]*p[k+o[45]])+(R[2]*p[k+o[46]])+(R[3]*p[k+o[47]]))*G[3]))*B[2])+
				  (((((R[0]*p[k+o[48]])+(R[1]*p[k+o[49]])+(R[2]*p[k+o[50]])+(R[3]*p[k+o[51]]))*G[0])+
					(((R[0]*p[k+o[52]])+(R[1]*p[k+o[53]])+(R[2]*p[k+o[54]])+(R[3]*p[k+o[55]]))*G[1])+
					(((R[0]*p[k+o[56]])+(R[1]*p[k+o[57]])+(R[2]*p[k+o[58]])+(R[3]*p[k+o[59]]))*G[2])+
					(((R[0]*p[k+o[60]])+(R[1]*p[k+o[61]])+(R[2]*p[k+o[62]])+(R[3]*p[k+o[63]]))*G[3]))*B[3]);
		k += mm;
		c[j+2]  = (((((R[0]*p[k+o[ 0]])+(R[1]*p[k+o[ 1]])+(R[2]*p[k+o[ 2]])+(R[3]*p[k+o[ 3]]))*G[0])+
					(((R[0]*p[k+o[ 4]])+(R[1]*p[k+o[ 5]])+(R[2]*p[k+o[ 6]])+(R[3]*p[k+o[ 7]]))*G[1])+
					(((R[0]*p[k+o[ 8]])+(R[1]*p[k+o[ 9]])+(R[2]*p[k+o[10]])+(R[3]*p[k+o[11]]))*G[2])+
					(((R[0]*p[k+o[12]])+(R[1]*p[k+o[13]])+(R[2]*p[k+o[14]])+(R[3]*p[k+o[15]]))*G[3]))*B[0])+
				  (((((R[0]*p[k+o[16]])+(R[1]*p[k+o[17]])+(R[2]*p[k+o[18]])+(R[3]*p[k+o[19]]))*G[0])+
					(((R[0]*p[k+o[20]])+(R[1]*p[k+o[21]])+(R[2]*p[k+o[22]])+(R[3]*p[k+o[23]]))*G[1])+
					(((R[0]*p[k+o[24]])+(R[1]*p[k+o[25]])+(R[2]*p[k+o[26]])+(R[3]*p[k+o[27]]))*G[2])+
					(((R[0]*p[k+o[28]])+(R[1]*p[k+o[29]])+(R[2]*p[k+o[30]])+(R[3]*p[k+o[31]]))*G[3]))*B[1])+
				  (((((R[0]*p[k+o[32]])+(R[1]*p[k+o[33]])+(R[2]*p[k+o[34]])+(R[3]*p[k+o[35]]))*G[0])+
					(((R[0]*p[k+o[36]])+(R[1]*p[k+o[37]])+(R[2]*p[k+o[38]])+(R[3]*p[k+o[39]]))*G[1])+
					(((R[0]*p[k+o[40]])+(R[1]*p[k+o[41]])+(R[2]*p[k+o[42]])+(R[3]*p[k+o[43]]))*G[2])+
					(((R[0]*p[k+o[44]])+(R[1]*p[k+o[45]])+(R[2]*p[k+o[46]])+(R[3]*p[k+o[47]]))*G[3]))*B[2])+
				  (((((R[0]*p[k+o[48]])+(R[1]*p[k+o[49]])+(R[2]*p[k+o[50]])+(R[3]*p[k+o[51]]))*G[0])+
					(((R[0]*p[k+o[52]])+(R[1]*p[k+o[53]])+(R[2]*p[k+o[54]])+(R[3]*p[k+o[55]]))*G[1])+
					(((R[0]*p[k+o[56]])+(R[1]*p[k+o[57]])+(R[2]*p[k+o[58]])+(R[3]*p[k+o[59]]))*G[2])+
					(((R[0]*p[k+o[60]])+(R[1]*p[k+o[61]])+(R[2]*p[k+o[62]])+(R[3]*p[k+o[63]]))*G[3]))*B[3]);
		// find slopes and perform extrapolation as needed
		if (E) {
			if (rE) {
				R[4] = (-1.5*rgb[3]) + (2*rgb[0]) - 0.5;
				R[5] = (4.5*rgb[3]) - (5*rgb[0]);
				R[6] = (-4.5*rgb[3]) + (4*rgb[0]) + 0.5;
				R[7] = (1.5*rgb[3] - rgb[0]);
				k = b;
				rgb[15] = (((((R[4]*p[k+o[ 0]])+(R[5]*p[k+o[ 1]])+(R[6]*p[k+o[ 2]])+(R[7]*p[k+o[ 3]]))*G[0])+
							(((R[4]*p[k+o[ 4]])+(R[5]*p[k+o[ 5]])+(R[6]*p[k+o[ 6]])+(R[7]*p[k+o[ 7]]))*G[1])+
							(((R[4]*p[k+o[ 8]])+(R[5]*p[k+o[ 9]])+(R[6]*p[k+o[10]])+(R[7]*p[k+o[11]]))*G[2])+
							(((R[4]*p[k+o[12]])+(R[5]*p[k+o[13]])+(R[6]*p[k+o[14]])+(R[7]*p[k+o[15]]))*G[3]))*B[0])+
				  		  (((((R[4]*p[k+o[16]])+(R[5]*p[k+o[17]])+(R[6]*p[k+o[18]])+(R[7]*p[k+o[19]]))*G[0])+
							(((R[4]*p[k+o[20]])+(R[5]*p[k+o[21]])+(R[6]*p[k+o[22]])+(R[7]*p[k+o[23]]))*G[1])+
							(((R[4]*p[k+o[24]])+(R[5]*p[k+o[25]])+(R[6]*p[k+o[26]])+(R[7]*p[k+o[27]]))*G[2])+
							(((R[4]*p[k+o[28]])+(R[5]*p[k+o[29]])+(R[6]*p[k+o[30]])+(R[7]*p[k+o[31]]))*G[3]))*B[1])+
						  (((((R[4]*p[k+o[32]])+(R[5]*p[k+o[33]])+(R[6]*p[k+o[34]])+(R[7]*p[k+o[35]]))*G[0])+
							(((R[4]*p[k+o[36]])+(R[5]*p[k+o[37]])+(R[6]*p[k+o[38]])+(R[7]*p[k+o[39]]))*G[1])+
							(((R[4]*p[k+o[40]])+(R[5]*p[k+o[41]])+(R[6]*p[k+o[42]])+(R[7]*p[k+o[43]]))*G[2])+
							(((R[4]*p[k+o[44]])+(R[5]*p[k+o[45]])+(R[6]*p[k+o[46]])+(R[7]*p[k+o[47]]))*G[3]))*B[2])+
						  (((((R[4]*p[k+o[48]])+(R[5]*p[k+o[49]])+(R[6]*p[k+o[50]])+(R[7]*p[k+o[51]]))*G[0])+
							(((R[4]*p[k+o[52]])+(R[5]*p[k+o[53]])+(R[6]*p[k+o[54]])+(R[7]*p[k+o[55]]))*G[1])+
							(((R[4]*p[k+o[56]])+(R[5]*p[k+o[57]])+(R[6]*p[k+o[58]])+(R[7]*p[k+o[59]]))*G[2])+
							(((R[4]*p[k+o[60]])+(R[5]*p[k+o[61]])+(R[6]*p[k+o[62]])+(R[7]*p[k+o[63]]))*G[3]))*B[3]);
				k += mm;
				rgb[16] = (((((R[4]*p[k+o[ 0]])+(R[5]*p[k+o[ 1]])+(R[6]*p[k+o[ 2]])+(R[7]*p[k+o[ 3]]))*G[0])+
							(((R[4]*p[k+o[ 4]])+(R[5]*p[k+o[ 5]])+(R[6]*p[k+o[ 6]])+(R[7]*p[k+o[ 7]]))*G[1])+
							(((R[4]*p[k+o[ 8]])+(R[5]*p[k+o[ 9]])+(R[6]*p[k+o[10]])+(R[7]*p[k+o[11]]))*G[2])+
							(((R[4]*p[k+o[12]])+(R[5]*p[k+o[13]])+(R[6]*p[k+o[14]])+(R[7]*p[k+o[15]]))*G[3]))*B[0])+
				  		  (((((R[4]*p[k+o[16]])+(R[5]*p[k+o[17]])+(R[6]*p[k+o[18]])+(R[7]*p[k+o[19]]))*G[0])+
							(((R[4]*p[k+o[20]])+(R[5]*p[k+o[21]])+(R[6]*p[k+o[22]])+(R[7]*p[k+o[23]]))*G[1])+
							(((R[4]*p[k+o[24]])+(R[5]*p[k+o[25]])+(R[6]*p[k+o[26]])+(R[7]*p[k+o[27]]))*G[2])+
							(((R[4]*p[k+o[28]])+(R[5]*p[k+o[29]])+(R[6]*p[k+o[30]])+(R[7]*p[k+o[31]]))*G[3]))*B[1])+
						  (((((R[4]*p[k+o[32]])+(R[5]*p[k+o[33]])+(R[6]*p[k+o[34]])+(R[7]*p[k+o[35]]))*G[0])+
							(((R[4]*p[k+o[36]])+(R[5]*p[k+o[37]])+(R[6]*p[k+o[38]])+(R[7]*p[k+o[39]]))*G[1])+
							(((R[4]*p[k+o[40]])+(R[5]*p[k+o[41]])+(R[6]*p[k+o[42]])+(R[7]*p[k+o[43]]))*G[2])+
							(((R[4]*p[k+o[44]])+(R[5]*p[k+o[45]])+(R[6]*p[k+o[46]])+(R[7]*p[k+o[47]]))*G[3]))*B[2])+
						  (((((R[4]*p[k+o[48]])+(R[5]*p[k+o[49]])+(R[6]*p[k+o[50]])+(R[7]*p[k+o[51]]))*G[0])+
							(((R[4]*p[k+o[52]])+(R[5]*p[k+o[53]])+(R[6]*p[k+o[54]])+(R[7]*p[k+o[55]]))*G[1])+
							(((R[4]*p[k+o[56]])+(R[5]*p[k+o[57]])+(R[6]*p[k+o[58]])+(R[7]*p[k+o[59]]))*G[2])+
							(((R[4]*p[k+o[60]])+(R[5]*p[k+o[61]])+(R[6]*p[k+o[62]])+(R[7]*p[k+o[63]]))*G[3]))*B[3]);
				k += mm;
				rgb[27] = (((((R[4]*p[k+o[ 0]])+(R[5]*p[k+o[ 1]])+(R[6]*p[k+o[ 2]])+(R[7]*p[k+o[ 3]]))*G[0])+
							(((R[4]*p[k+o[ 4]])+(R[5]*p[k+o[ 5]])+(R[6]*p[k+o[ 6]])+(R[7]*p[k+o[ 7]]))*G[1])+
							(((R[4]*p[k+o[ 8]])+(R[5]*p[k+o[ 9]])+(R[6]*p[k+o[10]])+(R[7]*p[k+o[11]]))*G[2])+
							(((R[4]*p[k+o[12]])+(R[5]*p[k+o[13]])+(R[6]*p[k+o[14]])+(R[7]*p[k+o[15]]))*G[3]))*B[0])+
				  		  (((((R[4]*p[k+o[16]])+(R[5]*p[k+o[17]])+(R[6]*p[k+o[18]])+(R[7]*p[k+o[19]]))*G[0])+
							(((R[4]*p[k+o[20]])+(R[5]*p[k+o[21]])+(R[6]*p[k+o[22]])+(R[7]*p[k+o[23]]))*G[1])+
							(((R[4]*p[k+o[24]])+(R[5]*p[k+o[25]])+(R[6]*p[k+o[26]])+(R[7]*p[k+o[27]]))*G[2])+
							(((R[4]*p[k+o[28]])+(R[5]*p[k+o[29]])+(R[6]*p[k+o[30]])+(R[7]*p[k+o[31]]))*G[3]))*B[1])+
						  (((((R[4]*p[k+o[32]])+(R[5]*p[k+o[33]])+(R[6]*p[k+o[34]])+(R[7]*p[k+o[35]]))*G[0])+
							(((R[4]*p[k+o[36]])+(R[5]*p[k+o[37]])+(R[6]*p[k+o[38]])+(R[7]*p[k+o[39]]))*G[1])+
							(((R[4]*p[k+o[40]])+(R[5]*p[k+o[41]])+(R[6]*p[k+o[42]])+(R[7]*p[k+o[43]]))*G[2])+
							(((R[4]*p[k+o[44]])+(R[5]*p[k+o[45]])+(R[6]*p[k+o[46]])+(R[7]*p[k+o[47]]))*G[3]))*B[2])+
						  (((((R[4]*p[k+o[48]])+(R[5]*p[k+o[49]])+(R[6]*p[k+o[50]])+(R[7]*p[k+o[51]]))*G[0])+
							(((R[4]*p[k+o[52]])+(R[5]*p[k+o[53]])+(R[6]*p[k+o[54]])+(R[7]*p[k+o[55]]))*G[1])+
							(((R[4]*p[k+o[56]])+(R[5]*p[k+o[57]])+(R[6]*p[k+o[58]])+(R[7]*p[k+o[59]]))*G[2])+
							(((R[4]*p[k+o[60]])+(R[5]*p[k+o[61]])+(R[6]*p[k+o[62]])+(R[7]*p[k+o[63]]))*G[3]))*B[3]);
				c[ j ] += rgb[12] * rgb[15];
				c[j+1] += rgb[12] * rgb[16];
				c[j+2] += rgb[12] * rgb[17];
			}
			if (gE) {
				G[4] = (-1.5*rgb[4]) + (2*rgb[1]) - 0.5;
				G[5] = (4.5*rgb[4]) - (5*rgb[1]);
				G[6] = (-4.5*rgb[4]) + (4*rgb[1]) + 0.5;
				G[7] = (1.5*rgb[4] - rgb[1]);
				k = b;
				rgb[15] = (((((R[0]*p[k+o[ 0]])+(R[1]*p[k+o[ 1]])+(R[2]*p[k+o[ 2]])+(R[3]*p[k+o[ 3]]))*G[4])+
							(((R[0]*p[k+o[ 4]])+(R[1]*p[k+o[ 5]])+(R[2]*p[k+o[ 6]])+(R[3]*p[k+o[ 7]]))*G[5])+
							(((R[0]*p[k+o[ 8]])+(R[1]*p[k+o[ 9]])+(R[2]*p[k+o[10]])+(R[3]*p[k+o[11]]))*G[6])+
							(((R[0]*p[k+o[12]])+(R[1]*p[k+o[13]])+(R[2]*p[k+o[14]])+(R[3]*p[k+o[15]]))*G[7]))*B[0])+
				  		  (((((R[0]*p[k+o[16]])+(R[1]*p[k+o[17]])+(R[2]*p[k+o[18]])+(R[3]*p[k+o[19]]))*G[4])+
							(((R[0]*p[k+o[20]])+(R[1]*p[k+o[21]])+(R[2]*p[k+o[22]])+(R[3]*p[k+o[23]]))*G[5])+
							(((R[0]*p[k+o[24]])+(R[1]*p[k+o[25]])+(R[2]*p[k+o[26]])+(R[3]*p[k+o[27]]))*G[6])+
							(((R[0]*p[k+o[28]])+(R[1]*p[k+o[29]])+(R[2]*p[k+o[30]])+(R[3]*p[k+o[31]]))*G[7]))*B[1])+
						  (((((R[0]*p[k+o[32]])+(R[1]*p[k+o[33]])+(R[2]*p[k+o[34]])+(R[3]*p[k+o[35]]))*G[4])+
							(((R[0]*p[k+o[36]])+(R[1]*p[k+o[37]])+(R[2]*p[k+o[38]])+(R[3]*p[k+o[39]]))*G[5])+
							(((R[0]*p[k+o[40]])+(R[1]*p[k+o[41]])+(R[2]*p[k+o[42]])+(R[3]*p[k+o[43]]))*G[6])+
							(((R[0]*p[k+o[44]])+(R[1]*p[k+o[45]])+(R[2]*p[k+o[46]])+(R[3]*p[k+o[47]]))*G[7]))*B[2])+
						  (((((R[0]*p[k+o[48]])+(R[1]*p[k+o[49]])+(R[2]*p[k+o[50]])+(R[3]*p[k+o[51]]))*G[4])+
							(((R[0]*p[k+o[52]])+(R[1]*p[k+o[53]])+(R[2]*p[k+o[54]])+(R[3]*p[k+o[55]]))*G[5])+
							(((R[0]*p[k+o[56]])+(R[1]*p[k+o[57]])+(R[2]*p[k+o[58]])+(R[3]*p[k+o[59]]))*G[6])+
							(((R[0]*p[k+o[60]])+(R[1]*p[k+o[61]])+(R[2]*p[k+o[62]])+(R[3]*p[k+o[63]]))*G[7]))*B[3]);
				k += mm;
				rgb[16] = (((((R[0]*p[k+o[ 0]])+(R[1]*p[k+o[ 1]])+(R[2]*p[k+o[ 2]])+(R[3]*p[k+o[ 3]]))*G[4])+
							(((R[0]*p[k+o[ 4]])+(R[1]*p[k+o[ 5]])+(R[2]*p[k+o[ 6]])+(R[3]*p[k+o[ 7]]))*G[5])+
							(((R[0]*p[k+o[ 8]])+(R[1]*p[k+o[ 9]])+(R[2]*p[k+o[10]])+(R[3]*p[k+o[11]]))*G[6])+
							(((R[0]*p[k+o[12]])+(R[1]*p[k+o[13]])+(R[2]*p[k+o[14]])+(R[3]*p[k+o[15]]))*G[7]))*B[0])+
				  		  (((((R[0]*p[k+o[16]])+(R[1]*p[k+o[17]])+(R[2]*p[k+o[18]])+(R[3]*p[k+o[19]]))*G[4])+
							(((R[0]*p[k+o[20]])+(R[1]*p[k+o[21]])+(R[2]*p[k+o[22]])+(R[3]*p[k+o[23]]))*G[5])+
							(((R[0]*p[k+o[24]])+(R[1]*p[k+o[25]])+(R[2]*p[k+o[26]])+(R[3]*p[k+o[27]]))*G[6])+
							(((R[0]*p[k+o[28]])+(R[1]*p[k+o[29]])+(R[2]*p[k+o[30]])+(R[3]*p[k+o[31]]))*G[7]))*B[1])+
						  (((((R[0]*p[k+o[32]])+(R[1]*p[k+o[33]])+(R[2]*p[k+o[34]])+(R[3]*p[k+o[35]]))*G[4])+
							(((R[0]*p[k+o[36]])+(R[1]*p[k+o[37]])+(R[2]*p[k+o[38]])+(R[3]*p[k+o[39]]))*G[5])+
							(((R[0]*p[k+o[40]])+(R[1]*p[k+o[41]])+(R[2]*p[k+o[42]])+(R[3]*p[k+o[43]]))*G[6])+
							(((R[0]*p[k+o[44]])+(R[1]*p[k+o[45]])+(R[2]*p[k+o[46]])+(R[3]*p[k+o[47]]))*G[7]))*B[2])+
						  (((((R[0]*p[k+o[48]])+(R[1]*p[k+o[49]])+(R[2]*p[k+o[50]])+(R[3]*p[k+o[51]]))*G[4])+
							(((R[0]*p[k+o[52]])+(R[1]*p[k+o[53]])+(R[2]*p[k+o[54]])+(R[3]*p[k+o[55]]))*G[5])+
							(((R[0]*p[k+o[56]])+(R[1]*p[k+o[57]])+(R[2]*p[k+o[58]])+(R[3]*p[k+o[59]]))*G[6])+
							(((R[0]*p[k+o[60]])+(R[1]*p[k+o[61]])+(R[2]*p[k+o[62]])+(R[3]*p[k+o[63]]))*G[7]))*B[3]);
				k += mm;
				rgb[17] = (((((R[0]*p[k+o[ 0]])+(R[1]*p[k+o[ 1]])+(R[2]*p[k+o[ 2]])+(R[3]*p[k+o[ 3]]))*G[4])+
							(((R[0]*p[k+o[ 4]])+(R[1]*p[k+o[ 5]])+(R[2]*p[k+o[ 6]])+(R[3]*p[k+o[ 7]]))*G[5])+
							(((R[0]*p[k+o[ 8]])+(R[1]*p[k+o[ 9]])+(R[2]*p[k+o[10]])+(R[3]*p[k+o[11]]))*G[6])+
							(((R[0]*p[k+o[12]])+(R[1]*p[k+o[13]])+(R[2]*p[k+o[14]])+(R[3]*p[k+o[15]]))*G[7]))*B[0])+
				  		  (((((R[0]*p[k+o[16]])+(R[1]*p[k+o[17]])+(R[2]*p[k+o[18]])+(R[3]*p[k+o[19]]))*G[4])+
							(((R[0]*p[k+o[20]])+(R[1]*p[k+o[21]])+(R[2]*p[k+o[22]])+(R[3]*p[k+o[23]]))*G[5])+
							(((R[0]*p[k+o[24]])+(R[1]*p[k+o[25]])+(R[2]*p[k+o[26]])+(R[3]*p[k+o[27]]))*G[6])+
							(((R[0]*p[k+o[28]])+(R[1]*p[k+o[29]])+(R[2]*p[k+o[30]])+(R[3]*p[k+o[31]]))*G[7]))*B[1])+
						  (((((R[0]*p[k+o[32]])+(R[1]*p[k+o[33]])+(R[2]*p[k+o[34]])+(R[3]*p[k+o[35]]))*G[4])+
							(((R[0]*p[k+o[36]])+(R[1]*p[k+o[37]])+(R[2]*p[k+o[38]])+(R[3]*p[k+o[39]]))*G[5])+
							(((R[0]*p[k+o[40]])+(R[1]*p[k+o[41]])+(R[2]*p[k+o[42]])+(R[3]*p[k+o[43]]))*G[6])+
							(((R[0]*p[k+o[44]])+(R[1]*p[k+o[45]])+(R[2]*p[k+o[46]])+(R[3]*p[k+o[47]]))*G[7]))*B[2])+
						  (((((R[0]*p[k+o[48]])+(R[1]*p[k+o[49]])+(R[2]*p[k+o[50]])+(R[3]*p[k+o[51]]))*G[4])+
							(((R[0]*p[k+o[52]])+(R[1]*p[k+o[53]])+(R[2]*p[k+o[54]])+(R[3]*p[k+o[55]]))*G[5])+
							(((R[0]*p[k+o[56]])+(R[1]*p[k+o[57]])+(R[2]*p[k+o[58]])+(R[3]*p[k+o[59]]))*G[6])+
							(((R[0]*p[k+o[60]])+(R[1]*p[k+o[61]])+(R[2]*p[k+o[62]])+(R[3]*p[k+o[63]]))*G[7]))*B[3]);
				c[ j ] += rgb[13] * rgb[15];
				c[j+1] += rgb[13] * rgb[16];
				c[j+2] += rgb[13] * rgb[17];
			}
			if (bE) {
				B[4] = (-1.5*rgb[5]) + (2*rgb[2]) - 0.5;
				B[5] = (4.5*rgb[5]) - (5*rgb[2]);
				B[6] = (-4.5*rgb[5]) + (4*rgb[2]) + 0.5;
				B[7] = (1.5*rgb[5] - rgb[2]);
				k = b;
				rgb[15] = (((((R[0]*p[k+o[ 0]])+(R[1]*p[k+o[ 1]])+(R[2]*p[k+o[ 2]])+(R[3]*p[k+o[ 3]]))*G[0])+
							(((R[0]*p[k+o[ 4]])+(R[1]*p[k+o[ 5]])+(R[2]*p[k+o[ 6]])+(R[3]*p[k+o[ 7]]))*G[1])+
							(((R[0]*p[k+o[ 8]])+(R[1]*p[k+o[ 9]])+(R[2]*p[k+o[10]])+(R[3]*p[k+o[11]]))*G[2])+
							(((R[0]*p[k+o[12]])+(R[1]*p[k+o[13]])+(R[2]*p[k+o[14]])+(R[3]*p[k+o[15]]))*G[3]))*B[4])+
				  		  (((((R[0]*p[k+o[16]])+(R[1]*p[k+o[17]])+(R[2]*p[k+o[18]])+(R[3]*p[k+o[19]]))*G[0])+
							(((R[0]*p[k+o[20]])+(R[1]*p[k+o[21]])+(R[2]*p[k+o[22]])+(R[3]*p[k+o[23]]))*G[1])+
							(((R[0]*p[k+o[24]])+(R[1]*p[k+o[25]])+(R[2]*p[k+o[26]])+(R[3]*p[k+o[27]]))*G[2])+
							(((R[0]*p[k+o[28]])+(R[1]*p[k+o[29]])+(R[2]*p[k+o[30]])+(R[3]*p[k+o[31]]))*G[3]))*B[5])+
						  (((((R[0]*p[k+o[32]])+(R[1]*p[k+o[33]])+(R[2]*p[k+o[34]])+(R[3]*p[k+o[35]]))*G[0])+
							(((R[0]*p[k+o[36]])+(R[1]*p[k+o[37]])+(R[2]*p[k+o[38]])+(R[3]*p[k+o[39]]))*G[1])+
							(((R[0]*p[k+o[40]])+(R[1]*p[k+o[41]])+(R[2]*p[k+o[42]])+(R[3]*p[k+o[43]]))*G[2])+
							(((R[0]*p[k+o[44]])+(R[1]*p[k+o[45]])+(R[2]*p[k+o[46]])+(R[3]*p[k+o[47]]))*G[3]))*B[6])+
						  (((((R[0]*p[k+o[48]])+(R[1]*p[k+o[49]])+(R[2]*p[k+o[50]])+(R[3]*p[k+o[51]]))*G[0])+
							(((R[0]*p[k+o[52]])+(R[1]*p[k+o[53]])+(R[2]*p[k+o[54]])+(R[3]*p[k+o[55]]))*G[1])+
							(((R[0]*p[k+o[56]])+(R[1]*p[k+o[57]])+(R[2]*p[k+o[58]])+(R[3]*p[k+o[59]]))*G[2])+
							(((R[0]*p[k+o[60]])+(R[1]*p[k+o[61]])+(R[2]*p[k+o[62]])+(R[3]*p[k+o[63]]))*G[3]))*B[7]);
				k += mm;
				rgb[16] = (((((R[0]*p[k+o[ 0]])+(R[1]*p[k+o[ 1]])+(R[2]*p[k+o[ 2]])+(R[3]*p[k+o[ 3]]))*G[0])+
							(((R[0]*p[k+o[ 4]])+(R[1]*p[k+o[ 5]])+(R[2]*p[k+o[ 6]])+(R[3]*p[k+o[ 7]]))*G[1])+
							(((R[0]*p[k+o[ 8]])+(R[1]*p[k+o[ 9]])+(R[2]*p[k+o[10]])+(R[3]*p[k+o[11]]))*G[2])+
							(((R[0]*p[k+o[12]])+(R[1]*p[k+o[13]])+(R[2]*p[k+o[14]])+(R[3]*p[k+o[15]]))*G[3]))*B[4])+
				  		  (((((R[0]*p[k+o[16]])+(R[1]*p[k+o[17]])+(R[2]*p[k+o[18]])+(R[3]*p[k+o[19]]))*G[0])+
							(((R[0]*p[k+o[20]])+(R[1]*p[k+o[21]])+(R[2]*p[k+o[22]])+(R[3]*p[k+o[23]]))*G[1])+
							(((R[0]*p[k+o[24]])+(R[1]*p[k+o[25]])+(R[2]*p[k+o[26]])+(R[3]*p[k+o[27]]))*G[2])+
							(((R[0]*p[k+o[28]])+(R[1]*p[k+o[29]])+(R[2]*p[k+o[30]])+(R[3]*p[k+o[31]]))*G[3]))*B[5])+
						  (((((R[0]*p[k+o[32]])+(R[1]*p[k+o[33]])+(R[2]*p[k+o[34]])+(R[3]*p[k+o[35]]))*G[0])+
							(((R[0]*p[k+o[36]])+(R[1]*p[k+o[37]])+(R[2]*p[k+o[38]])+(R[3]*p[k+o[39]]))*G[1])+
							(((R[0]*p[k+o[40]])+(R[1]*p[k+o[41]])+(R[2]*p[k+o[42]])+(R[3]*p[k+o[43]]))*G[2])+
							(((R[0]*p[k+o[44]])+(R[1]*p[k+o[45]])+(R[2]*p[k+o[46]])+(R[3]*p[k+o[47]]))*G[3]))*B[6])+
						  (((((R[0]*p[k+o[48]])+(R[1]*p[k+o[49]])+(R[2]*p[k+o[50]])+(R[3]*p[k+o[51]]))*G[0])+
							(((R[0]*p[k+o[52]])+(R[1]*p[k+o[53]])+(R[2]*p[k+o[54]])+(R[3]*p[k+o[55]]))*G[1])+
							(((R[0]*p[k+o[56]])+(R[1]*p[k+o[57]])+(R[2]*p[k+o[58]])+(R[3]*p[k+o[59]]))*G[2])+
							(((R[0]*p[k+o[60]])+(R[1]*p[k+o[61]])+(R[2]*p[k+o[62]])+(R[3]*p[k+o[63]]))*G[3]))*B[7]);
				k += mm;
				rgb[17] = (((((R[0]*p[k+o[ 0]])+(R[1]*p[k+o[ 1]])+(R[2]*p[k+o[ 2]])+(R[3]*p[k+o[ 3]]))*G[0])+
							(((R[0]*p[k+o[ 4]])+(R[1]*p[k+o[ 5]])+(R[2]*p[k+o[ 6]])+(R[3]*p[k+o[ 7]]))*G[1])+
							(((R[0]*p[k+o[ 8]])+(R[1]*p[k+o[ 9]])+(R[2]*p[k+o[10]])+(R[3]*p[k+o[11]]))*G[2])+
							(((R[0]*p[k+o[12]])+(R[1]*p[k+o[13]])+(R[2]*p[k+o[14]])+(R[3]*p[k+o[15]]))*G[3]))*B[4])+
				  		  (((((R[0]*p[k+o[16]])+(R[1]*p[k+o[17]])+(R[2]*p[k+o[18]])+(R[3]*p[k+o[19]]))*G[0])+
							(((R[0]*p[k+o[20]])+(R[1]*p[k+o[21]])+(R[2]*p[k+o[22]])+(R[3]*p[k+o[23]]))*G[1])+
							(((R[0]*p[k+o[24]])+(R[1]*p[k+o[25]])+(R[2]*p[k+o[26]])+(R[3]*p[k+o[27]]))*G[2])+
							(((R[0]*p[k+o[28]])+(R[1]*p[k+o[29]])+(R[2]*p[k+o[30]])+(R[3]*p[k+o[31]]))*G[3]))*B[5])+
						  (((((R[0]*p[k+o[32]])+(R[1]*p[k+o[33]])+(R[2]*p[k+o[34]])+(R[3]*p[k+o[35]]))*G[0])+
							(((R[0]*p[k+o[36]])+(R[1]*p[k+o[37]])+(R[2]*p[k+o[38]])+(R[3]*p[k+o[39]]))*G[1])+
							(((R[0]*p[k+o[40]])+(R[1]*p[k+o[41]])+(R[2]*p[k+o[42]])+(R[3]*p[k+o[43]]))*G[2])+
							(((R[0]*p[k+o[44]])+(R[1]*p[k+o[45]])+(R[2]*p[k+o[46]])+(R[3]*p[k+o[47]]))*G[3]))*B[6])+
						  (((((R[0]*p[k+o[48]])+(R[1]*p[k+o[49]])+(R[2]*p[k+o[50]])+(R[3]*p[k+o[51]]))*G[0])+
							(((R[0]*p[k+o[52]])+(R[1]*p[k+o[53]])+(R[2]*p[k+o[54]])+(R[3]*p[k+o[55]]))*G[1])+
							(((R[0]*p[k+o[56]])+(R[1]*p[k+o[57]])+(R[2]*p[k+o[58]])+(R[3]*p[k+o[59]]))*G[2])+
							(((R[0]*p[k+o[60]])+(R[1]*p[k+o[61]])+(R[2]*p[k+o[62]])+(R[3]*p[k+o[63]]))*G[3]))*B[7]);
				c[ j ] += rgb[14] * rgb[15];	
				c[j+1] += rgb[14] * rgb[16];
				c[j+2] += rgb[14] * rgb[17];
			}
			E = false;
			rE = false;
			gE = false;
			bE = false;
		}
	}
};
LUTVolume.prototype.RGBTet = function(buff) {
	var c = new Float64Array(buff);
	var p = this.mesh;
	var o = this.off;
	var rgb = this.rgb;
	var m = c.length;
	var mm = Math.round(this.mesh.length/3);
	var s = this.s;
	var nd = s + 2;
	var nd1 = nd + 1;
	var k,b;
	var R = this.R;
	var G = this.G;
	var B = this.B;
	var E = false;
	var rE = false;
	var gE = false;
	var bE = false;
	if (this.fS) {
		var fL = this.fL;
		var fLH = this.fLH;
		for (var j=0; j<m; j+=3) {
			c[ j ] = (c[ j ] - fL[0])/(fLH[0]);
			c[j+1] = (c[j+1] - fL[1])/(fLH[1]);
			c[j+2] = (c[j+2] - fL[2])/(fLH[2]);
		}
	}
	if (this.sin) {
		this.ins.FCub(buff);
	}
	for (var j=0; j<m; j +=3) {
		c[ j ] *= s;
		c[j+1] *= s;
		c[j+2] *= s;
		rgb[ 9] = Math.max(0,Math.min(s-1,Math.floor(c[ j ])));
		rgb[10] = Math.max(0,Math.min(s-1,Math.floor(c[j+1])));
		rgb[11] = Math.max(0,Math.min(s-1,Math.floor(c[j+2])));
		c[ j ] -= rgb[ 9];
		c[j+1] -= rgb[10];
		c[j+2] -= rgb[11];
		// clamp values between 0-1.0 for interpolation
		rgb[0] = Math.max(0,Math.min(1,c[ j ]));
		rgb[1] = Math.max(0,Math.min(1,c[j+1]));
		rgb[2] = Math.max(0,Math.min(1,c[j+2]));
		// note that extrapolation will be needed if values were clamped
		if (rgb[0] !== c[ j ]) {
			rE = true;
			E = true;
		}
		if (rgb[1] !== c[j+1]) {
			gE = true;
			E = true;
		}
		if (rgb[2] !== c[j+2]) {
			bE = true;
			E = true;
		}
		// if any or all channels need extrapolation find out the scaling
		if (rE) {
			rgb[12] = c[ j ] - rgb[0];
		}
		if (gE) {
			rgb[13] = c[j+1] - rgb[1];
		}
		if (bE) {
			rgb[14] = c[j+2] - rgb[2];
		}
		// set value for first control point in the mesh - P[-1,-1,-1]
		b = (rgb[9]) + ((rgb[10] + (rgb[11]*nd1))*nd1);
		k = b;
		// find which tetrahedron to use
		var tet = (rgb[0]>rgb[1]) + ((rgb[1]>rgb[2])*2) + ((rgb[2]>rgb[0])*4);
		// perform tetrahedral interpolation
		switch (tet) {
			case 0: // rgb[0] === rgb[1] === rgb[2] so straight linear interpolation
				c[ j ] = ((1-rgb[0])*p[k+o[21]]) + (rgb[0]*p[k+o[42]]);
				k += mm;
				c[j+1] = ((1-rgb[1])*p[k+o[21]]) + (rgb[1]*p[k+o[42]]);
				k += mm;
				c[j+2] = ((1-rgb[2])*p[k+o[21]]) + (rgb[2]*p[k+o[42]]);
				break;
			case 1:
				c[ j ] = ((1-rgb[0])*p[k+o[21]]) + ((rgb[0]-rgb[2])*p[k+o[22]]) + ((rgb[2]-rgb[1])*p[k+o[38]]) + (rgb[1]*p[k+o[42]]);
				k += mm;
				c[j+1] = ((1-rgb[0])*p[k+o[21]]) + ((rgb[0]-rgb[2])*p[k+o[22]]) + ((rgb[2]-rgb[1])*p[k+o[38]]) + (rgb[1]*p[k+o[42]]);
				k += mm;
				c[j+2] = ((1-rgb[0])*p[k+o[21]]) + ((rgb[0]-rgb[2])*p[k+o[22]]) + ((rgb[2]-rgb[1])*p[k+o[38]]) + (rgb[1]*p[k+o[42]]);
				break;
			case 2:
				c[ j ] = ((1-rgb[1])*p[k+o[21]]) + ((rgb[1]-rgb[0])*p[k+o[25]]) + ((rgb[0]-rgb[2])*p[k+o[26]]) + (rgb[2]*p[k+o[42]]);
				k += mm;
				c[j+1] = ((1-rgb[1])*p[k+o[21]]) + ((rgb[1]-rgb[0])*p[k+o[25]]) + ((rgb[0]-rgb[2])*p[k+o[26]]) + (rgb[2]*p[k+o[42]]);
				k += mm;
				c[j+2] = ((1-rgb[1])*p[k+o[21]]) + ((rgb[1]-rgb[0])*p[k+o[25]]) + ((rgb[0]-rgb[2])*p[k+o[26]]) + (rgb[2]*p[k+o[42]]);
				break;
			case 3:
				c[ j ] = ((1-rgb[0])*p[k+o[21]]) + ((rgb[0]-rgb[1])*p[k+o[22]]) + ((rgb[1]-rgb[2])*p[k+o[26]]) + (rgb[2]*p[k+o[42]]);
				k += mm;
				c[j+1] = ((1-rgb[0])*p[k+o[21]]) + ((rgb[0]-rgb[1])*p[k+o[22]]) + ((rgb[1]-rgb[2])*p[k+o[26]]) + (rgb[2]*p[k+o[42]]);
				k += mm;
				c[j+2] = ((1-rgb[0])*p[k+o[21]]) + ((rgb[0]-rgb[1])*p[k+o[22]]) + ((rgb[1]-rgb[2])*p[k+o[26]]) + (rgb[2]*p[k+o[42]]);
				break;
			case 4:
				c[ j ] = ((1-rgb[2])*p[k+o[21]]) + ((rgb[2]-rgb[1])*p[k+o[37]]) + ((rgb[1]-rgb[0])*p[k+o[41]]) + (rgb[0]*p[k+o[42]]);
				k += mm;
				c[j+1] = ((1-rgb[2])*p[k+o[21]]) + ((rgb[2]-rgb[1])*p[k+o[37]]) + ((rgb[1]-rgb[0])*p[k+o[41]]) + (rgb[0]*p[k+o[42]]);
				k += mm;
				c[j+2] = ((1-rgb[2])*p[k+o[21]]) + ((rgb[2]-rgb[1])*p[k+o[37]]) + ((rgb[1]-rgb[0])*p[k+o[41]]) + (rgb[0]*p[k+o[42]]);
				break;
			case 5:
				c[ j ] = ((1-rgb[2])*p[k+o[21]]) + ((rgb[2]-rgb[0])*p[k+o[37]]) + ((rgb[0]-rgb[1])*p[k+o[38]]) + (rgb[1]*p[k+o[42]]);
				k += mm;
				c[j+1] = ((1-rgb[2])*p[k+o[21]]) + ((rgb[2]-rgb[0])*p[k+o[37]]) + ((rgb[0]-rgb[1])*p[k+o[38]]) + (rgb[1]*p[k+o[42]]);
				k += mm;
				c[j+2] = ((1-rgb[2])*p[k+o[21]]) + ((rgb[2]-rgb[0])*p[k+o[37]]) + ((rgb[0]-rgb[1])*p[k+o[38]]) + (rgb[1]*p[k+o[42]]);
				break;
			case 6:
				c[ j ] = ((1-rgb[1])*p[k+o[21]]) + ((rgb[1]-rgb[2])*p[k+o[25]]) + ((rgb[2]-rgb[0])*p[k+o[41]]) + (rgb[0]*p[k+o[42]]);
				k += mm;
				c[j+1] = ((1-rgb[1])*p[k+o[21]]) + ((rgb[1]-rgb[2])*p[k+o[25]]) + ((rgb[2]-rgb[0])*p[k+o[41]]) + (rgb[0]*p[k+o[42]]);
				k += mm;
				c[j+2] = ((1-rgb[1])*p[k+o[21]]) + ((rgb[1]-rgb[2])*p[k+o[25]]) + ((rgb[2]-rgb[0])*p[k+o[41]]) + (rgb[0]*p[k+o[42]]);
				break;
			default: // shouldn't be possible, but include fallback to trilinear interpolation
				c[ j ]  = ((((((1-rgb[0])*p[k+o[21]]) + (rgb[0]*p[k+o[22]]))*(1-rgb[1])) + ((((1-rgb[0])*p[k+o[25]]) + (rgb[0]*p[k+o[26]]))*rgb[1]))*(1-rgb[2]))+
						  ((((((1-rgb[0])*p[k+o[37]]) + (rgb[0]*p[k+o[38]]))*(1-rgb[1])) + ((((1-rgb[0])*p[k+o[41]]) + (rgb[0]*p[k+o[42]]))*rgb[1]))*rgb[2]);
				k += mm;
				c[j+1]  = ((((((1-rgb[0])*p[k+o[21]]) + (rgb[0]*p[k+o[22]]))*(1-rgb[1])) + ((((1-rgb[0])*p[k+o[25]]) + (rgb[0]*p[k+o[26]]))*rgb[1]))*(1-rgb[2]))+
						  ((((((1-rgb[0])*p[k+o[37]]) + (rgb[0]*p[k+o[38]]))*(1-rgb[1])) + ((((1-rgb[0])*p[k+o[41]]) + (rgb[0]*p[k+o[42]]))*rgb[1]))*rgb[2]);
				k += mm;
				c[j+2]  = ((((((1-rgb[0])*p[k+o[21]]) + (rgb[0]*p[k+o[22]]))*(1-rgb[1])) + ((((1-rgb[0])*p[k+o[25]]) + (rgb[0]*p[k+o[26]]))*rgb[1]))*(1-rgb[2]))+
						  ((((((1-rgb[0])*p[k+o[37]]) + (rgb[0]*p[k+o[38]]))*(1-rgb[1])) + ((((1-rgb[0])*p[k+o[41]]) + (rgb[0]*p[k+o[42]]))*rgb[1]))*rgb[2]);
		}
		// find slopes and perform extrapolation as needed
		// Actually use Trilinear for EXTRAPOLATION, as tends to be smoother than tetrahedral
		if (E) {
			R[0] = 1-rgb[0];
			R[1] = rgb[0];
			G[0] = 1-rgb[1];
			G[1] = rgb[1];
			B[0] = 1-rgb[2];
			B[1] = rgb[2];
			if (rE) {
				k = b;
				rgb[15] = ((((p[k+o[22]]-p[k+o[21]])*G[0]) + ((p[k+o[26]]-p[k+o[25]])*G[1]))*B[0])+
						  ((((p[k+o[38]]-p[k+o[37]])*G[0]) + ((p[k+o[42]]-p[k+o[41]])*G[1]))*B[1]);
				k += mm;
				rgb[16] = ((((p[k+o[22]]-p[k+o[21]])*G[0]) + ((p[k+o[26]]-p[k+o[25]])*G[1]))*B[0])+
						  ((((p[k+o[38]]-p[k+o[37]])*G[0]) + ((p[k+o[42]]-p[k+o[41]])*G[1]))*B[1]);
				k += mm;
				rgb[17] = ((((p[k+o[22]]-p[k+o[21]])*G[0]) + ((p[k+o[26]]-p[k+o[25]])*G[1]))*B[0])+
						  ((((p[k+o[38]]-p[k+o[37]])*G[0]) + ((p[k+o[42]]-p[k+o[41]])*G[1]))*B[1]);
				c[ j ] += rgb[12] * rgb[15];
				c[j+1] += rgb[12] * rgb[16];
				c[j+2] += rgb[12] * rgb[17];
			}
			if (gE) {
				k = b;
				rgb[15] = ((((p[k+o[25]]-p[k+o[21]])*R[0]) + ((p[k+o[26]]-p[k+o[22]])*R[1]))*B[0])+
						  ((((p[k+o[41]]-p[k+o[37]])*R[0]) + ((p[k+o[42]]-p[k+o[38]])*R[1]))*B[1]);
				k += mm;
				rgb[16] = ((((p[k+o[25]]-p[k+o[21]])*R[0]) + ((p[k+o[26]]-p[k+o[22]])*R[1]))*B[0])+
						  ((((p[k+o[41]]-p[k+o[37]])*R[0]) + ((p[k+o[42]]-p[k+o[38]])*R[1]))*B[1]);
				k += mm;
				rgb[17] = ((((p[k+o[25]]-p[k+o[21]])*R[0]) + ((p[k+o[26]]-p[k+o[22]])*R[1]))*B[0])+
						  ((((p[k+o[41]]-p[k+o[37]])*R[0]) + ((p[k+o[42]]-p[k+o[38]])*R[1]))*B[1]);
				c[ j ] += rgb[13] * rgb[15];
				c[j+1] += rgb[13] * rgb[16];
				c[j+2] += rgb[13] * rgb[17];
			}
			if (bE) {
				k = b;
				rgb[15] = ((((p[k+o[37]]-p[k+o[21]])*R[0]) + ((p[k+o[38]]-p[k+o[22]])*R[1]))*G[0])+
						 ((((p[k+o[41]]-p[k+o[25]])*R[0]) + ((p[k+o[42]]-p[k+o[26]])*R[1]))*G[1]);
				k += mm;
				rgb[16] = ((((p[k+o[37]]-p[k+o[21]])*R[0]) + ((p[k+o[38]]-p[k+o[22]])*R[1]))*G[0])+
						 ((((p[k+o[41]]-p[k+o[25]])*R[0]) + ((p[k+o[42]]-p[k+o[26]])*R[1]))*G[1]);
				k += mm;
				rgb[17] = ((((p[k+o[37]]-p[k+o[21]])*R[0]) + ((p[k+o[38]]-p[k+o[22]])*R[1]))*G[0])+
						 ((((p[k+o[41]]-p[k+o[25]])*R[0]) + ((p[k+o[42]]-p[k+o[26]])*R[1]))*G[1]);
				c[ j ] += rgb[14] * rgb[15];	
				c[j+1] += rgb[14] * rgb[16];
				c[j+2] += rgb[14] * rgb[17];
			}
			E = false;
			rE = false;
			gE = false;
			bE = false;
		}
/* Tetrahedral EXTRAPOLATION is not great - LUTCalc currently uses Trilinear. The following is tetrahedral code
		if (E) {
			// check for and perform extrapolation
			if (rE) {
				k=b;
				switch (tet) {
					case 0: // rgb[0] === rgb[1] === rgb[2]
						rgb[15] = p[k+o[42]]-p[k+o[21]];
						k += mm;
						rgb[16] = p[k+o[42]]-p[k+o[21]];
						k += mm;
						rgb[17] = p[k+o[42]]-p[k+o[21]];
						break;
					case 1:
						rgb[15] = p[k+o[22]]-p[k+o[21]];
						k += mm;
						rgb[16] = p[k+o[22]]-p[k+o[21]];
						k += mm;
						rgb[17] = p[k+o[22]]-p[k+o[21]];
						break;
					case 2:
						rgb[15] = p[k+o[26]]-p[k+o[25]];
						k += mm;
						rgb[16] = p[k+o[26]]-p[k+o[25]];
						k += mm;
						rgb[17] = p[k+o[26]]-p[k+o[25]];
						break;
					case 3:
						rgb[15] = p[k+o[22]]-p[k+o[21]];
						k += mm;
						rgb[16] = p[k+o[22]]-p[k+o[21]];
						k += mm;
						rgb[17] = p[k+o[22]]-p[k+o[21]];
						break;
					case 4:
						rgb[15] = p[k+o[42]]-p[k+o[41]];
						k += mm;
						rgb[16] = p[k+o[42]]-p[k+o[41]];
						k += mm;
						rgb[17] = p[k+o[42]]-p[k+o[41]];
						break;
					case 5:
						rgb[15] = p[k+o[38]]-p[k+o[37]];
						k += mm;
						rgb[16] = p[k+o[38]]-p[k+o[37]];
						k += mm;
						rgb[17] = p[k+o[38]]-p[k+o[37]];
						break;
					case 6:
						rgb[15] = p[k+o[42]]-p[k+o[41]];
						k += mm;
						rgb[16] = p[k+o[42]]-p[k+o[41]];
						k += mm;
						rgb[17] = p[k+o[42]]-p[k+o[41]];
						break;
					default: // shouldn't be possible, but include fallback to trilinear interpolation
						rgb[15] = ((((p[k+o[22]]-p[k+o[21]])*(1-rgb[1])) + ((p[k+o[26]]-p[k+o[25]])*rgb[1]))*(1-rgb[2]))+
								  ((((p[k+o[38]]-p[k+o[37]])*(1-rgb[1])) + ((p[k+o[42]]-p[k+o[41]])*rgb[1]))*rgb[2]);
						k += mm;
						rgb[16] = ((((p[k+o[22]]-p[k+o[21]])*(1-rgb[1])) + ((p[k+o[26]]-p[k+o[25]])*rgb[1]))*(1-rgb[2]))+
								  ((((p[k+o[38]]-p[k+o[37]])*(1-rgb[1])) + ((p[k+o[42]]-p[k+o[41]])*rgb[1]))*rgb[2]);
						k += mm;
						rgb[17] = ((((p[k+o[22]]-p[k+o[21]])*(1-rgb[1])) + ((p[k+o[26]]-p[k+o[25]])*rgb[1]))*(1-rgb[2]))+
								  ((((p[k+o[38]]-p[k+o[37]])*(1-rgb[1])) + ((p[k+o[42]]-p[k+o[41]])*rgb[1]))*rgb[2]);
				}
				c[ j ] += rgb[12] * rgb[15];
				c[j+1] += rgb[12] * rgb[16];
				c[j+2] += rgb[12] * rgb[17];
			}
			if (gE) {
				k = b;
				switch (tet) {
					case 0: // rgb[0] === rgb[1] === rgb[2]
						rgb[15] = p[k+o[42]]-p[k+o[21]];
						k += mm;
						rgb[16] = p[k+o[42]]-p[k+o[21]];
						k += mm;
						rgb[17] = p[k+o[42]]-p[k+o[21]];
						break;
					case 1:
						rgb[15] = p[k+o[42]]-p[k+o[38]];
						k += mm;
						rgb[16] = p[k+o[42]]-p[k+o[38]];
						k += mm;
						rgb[17] = p[k+o[42]]-p[k+o[38]];
						break;
					case 2:
						rgb[15] = p[k+o[25]]-p[k+o[21]];
						k += mm;
						rgb[16] = p[k+o[25]]-p[k+o[21]];
						k += mm;
						rgb[17] = p[k+o[25]]-p[k+o[21]];
						break;
					case 3:
						rgb[15] = p[k+o[26]]-p[k+o[22]];
						k += mm;
						rgb[16] = p[k+o[26]]-p[k+o[22]];
						k += mm;
						rgb[17] = p[k+o[26]]-p[k+o[22]];
						break;
					case 4:
						rgb[15] = p[k+o[41]]-p[k+o[37]];
						k += mm;
						rgb[16] = p[k+o[41]]-p[k+o[37]];
						k += mm;
						rgb[17] = p[k+o[41]]-p[k+o[37]];
						break;
					case 5:
						rgb[15] = p[k+o[42]]-p[k+o[38]];
						k += mm;
						rgb[16] = p[k+o[42]]-p[k+o[38]];
						k += mm;
						rgb[17] = p[k+o[42]]-p[k+o[38]];
						break;
					case 6:
						rgb[15] = p[k+o[25]]-p[k+o[21]];
						k += mm;
						rgb[16] = p[k+o[25]]-p[k+o[21]];
						k += mm;
						rgb[17] = p[k+o[25]]-p[k+o[21]];
						break;
					default: // shouldn't be possible, but include fallback to trilinear interpolation
						rgb[15] = ((((p[k+o[25]]-p[k+o[21]])*(1-rgb[0])) + ((p[k+o[26]]-p[k+o[22]])*rgb[0]))*(1-rgb[2]))+
								  ((((p[k+o[41]]-p[k+o[37]])*(1-rgb[0])) + ((p[k+o[42]]-p[k+o[38]])*rgb[0]))*rgb[2]);
						k += mm;
						rgb[16] = ((((p[k+o[25]]-p[k+o[21]])*(1-rgb[0])) + ((p[k+o[26]]-p[k+o[22]])*rgb[0]))*(1-rgb[2]))+
								  ((((p[k+o[41]]-p[k+o[37]])*(1-rgb[0])) + ((p[k+o[42]]-p[k+o[38]])*rgb[0]))*rgb[2]);
						k += mm;
						rgb[17] = ((((p[k+o[25]]-p[k+o[21]])*(1-rgb[0])) + ((p[k+o[26]]-p[k+o[22]])*rgb[0]))*(1-rgb[2]))+
								  ((((p[k+o[41]]-p[k+o[37]])*(1-rgb[0])) + ((p[k+o[42]]-p[k+o[38]])*rgb[0]))*rgb[2]);
				}
				c[ j ] += rgb[13] * rgb[15];
				c[j+1] += rgb[13] * rgb[16];
				c[j+2] += rgb[13] * rgb[17];
			}
			if (bE) {
				k = b;
				switch (tet) {
					case 0: // rgb[0] === rgb[1] === rgb[2]
						rgb[15] = p[k+o[42]]-p[k+o[21]];
						k += mm;
						rgb[16] = p[k+o[42]]-p[k+o[21]];
						k += mm;
						rgb[17] = p[k+o[42]]-p[k+o[21]];
						break;
					case 1:
						rgb[15] = p[k+o[38]]-p[k+o[22]];
						k += mm;
						rgb[16] = p[k+o[38]]-p[k+o[22]];
						k += mm;
						rgb[17] = p[k+o[38]]-p[k+o[22]];
						break;
					case 2:
						rgb[15] = p[k+o[42]]-p[k+o[26]];
						k += mm;
						rgb[16] = p[k+o[42]]-p[k+o[26]];
						k += mm;
						rgb[17] = p[k+o[42]]-p[k+o[26]];
						break;
					case 3:
						rgb[15] = p[k+o[42]]-p[k+o[26]];
						k += mm;
						rgb[16] = p[k+o[42]]-p[k+o[26]];
						k += mm;
						rgb[17] = p[k+o[42]]-p[k+o[26]];
						break;
					case 4:
						rgb[15] = p[k+o[37]]-p[k+o[21]];
						k += mm;
						rgb[16] = p[k+o[37]]-p[k+o[21]];
						k += mm;
						rgb[17] = p[k+o[37]]-p[k+o[21]];
						break;
					case 5:
						rgb[15] = p[k+o[37]]-p[k+o[21]];
						k += mm;
						rgb[16] = p[k+o[37]]-p[k+o[21]];
						k += mm;
						rgb[17] = p[k+o[37]]-p[k+o[21]];
						break;
					case 6:
						rgb[15] = p[k+o[41]]-p[k+o[25]];
						k += mm;
						rgb[16] = p[k+o[41]]-p[k+o[25]];
						k += mm;
						rgb[17] = p[k+o[41]]-p[k+o[25]];
						break;
					default: // shouldn't be possible, but include fallback to trilinear interpolation
						rgb[15] = ((((p[k+o[37]]-p[k+o[21]])*(1-rgb[0])) + ((p[k+o[38]]-p[k+o[22]])*rgb[0]))*(1-rgb[1]))+
								  ((((p[k+o[41]]-p[k+o[25]])*(1-rgb[0])) + ((p[k+o[42]]-p[k+o[26]])*rgb[0]))*rgb[1]);
						k += mm;
						rgb[16] = ((((p[k+o[37]]-p[k+o[21]])*(1-rgb[0])) + ((p[k+o[38]]-p[k+o[22]])*rgb[0]))*(1-rgb[1]))+
								  ((((p[k+o[41]]-p[k+o[25]])*(1-rgb[0])) + ((p[k+o[42]]-p[k+o[26]])*rgb[0]))*rgb[1]);
						k += mm;
						rgb[17] = ((((p[k+o[37]]-p[k+o[21]])*(1-rgb[0])) + ((p[k+o[38]]-p[k+o[22]])*rgb[0]))*(1-rgb[1]))+
								  ((((p[k+o[41]]-p[k+o[25]])*(1-rgb[0])) + ((p[k+o[42]]-p[k+o[26]])*rgb[0]))*rgb[1]);
				}
				c[ j ] += rgb[14] * rgb[15];	
				c[j+1] += rgb[14] * rgb[16];
				c[j+2] += rgb[14] * rgb[17];
			}
			E = false;
			rE = false;
			gE = false;
			bE = false;
		}
*/
	}
};
LUTVolume.prototype.RGBLin = function(buff) {
	var c = new Float64Array(buff);
	var p = this.mesh;
	var o = this.off;
	var rgb = this.rgb;
	var m = c.length;
	var mm = Math.round(this.mesh.length/3);
	var s = this.s;
	var nd = s + 2;
	var nd1 = nd + 1;
	var k,b;
	var R = this.R;
	var G = this.G;
	var B = this.B;
	var E = false;
	var rE = false;
	var gE = false;
	var bE = false;
	if (this.fS) {
		var fL = this.fL;
		var fLH = this.fLH;
		for (var j=0; j<m; j+=3) {
			c[ j ] = (c[ j ] - fL[0])/(fLH[0]);
			c[j+1] = (c[j+1] - fL[1])/(fLH[1]);
			c[j+2] = (c[j+2] - fL[2])/(fLH[2]);
		}
	}
	if (this.sin) {
		this.ins.FCub(buff);
	}
	for (var j=0; j<m; j +=3) {
		c[ j ] *= s;
		c[j+1] *= s;
		c[j+2] *= s;
		rgb[ 9] = Math.max(0,Math.min(s-1,Math.floor(c[ j ])));
		rgb[10] = Math.max(0,Math.min(s-1,Math.floor(c[j+1])));
		rgb[11] = Math.max(0,Math.min(s-1,Math.floor(c[j+2])));
		c[ j ] -= rgb[ 9];
		c[j+1] -= rgb[10];
		c[j+2] -= rgb[11];
		// clamp values between 0-1.0 for interpolation
		rgb[0] = Math.max(0,Math.min(1,c[ j ]));
		rgb[1] = Math.max(0,Math.min(1,c[j+1]));
		rgb[2] = Math.max(0,Math.min(1,c[j+2]));
		// note that extrapolation will be needed if values were clamped
		if (rgb[0] !== c[ j ]) {
			rE = true;
			E = true;
		}
		if (rgb[1] !== c[j+1]) {
			gE = true;
			E = true;
		}
		if (rgb[2] !== c[j+2]) {
			bE = true;
			E = true;
		}
		// Prep all the squares, cubes and cubics
		R[0] = 1-rgb[0];
		R[1] = rgb[0];
		G[0] = 1-rgb[1];
		G[1] = rgb[1];
		B[0] = 1-rgb[2];
		B[1] = rgb[2];
		// if any or all channels need extrapolation find out the scaling
		if (rE) {
			rgb[12] = c[ j ] - rgb[0];
		}
		if (gE) {
			rgb[13] = c[j+1] - rgb[1];
		}
		if (bE) {
			rgb[14] = c[j+2] - rgb[2];
		}
		// set value for first control point in the mesh - P[-1,-1,-1]
		b = (rgb[9]) + ((rgb[10] + (rgb[11]*nd1))*nd1);
		k = b;
		// multiply and add the cubics and the control points
		c[ j ]  = (((((R[0]*p[k+o[21]]) + (R[1]*p[k+o[22]]))*G[0]) + (((R[0]*p[k+o[25]]) + (R[1]*p[k+o[26]]))*G[1]))*B[0])+
				  (((((R[0]*p[k+o[37]]) + (R[1]*p[k+o[38]]))*G[0]) + (((R[0]*p[k+o[41]]) + (R[1]*p[k+o[42]]))*G[1]))*B[1]);
		k += mm;
		c[j+1]  = (((((R[0]*p[k+o[21]]) + (R[1]*p[k+o[22]]))*G[0]) + (((R[0]*p[k+o[25]]) + (R[1]*p[k+o[26]]))*G[1]))*B[0])+
				  (((((R[0]*p[k+o[37]]) + (R[1]*p[k+o[38]]))*G[0]) + (((R[0]*p[k+o[41]]) + (R[1]*p[k+o[42]]))*G[1]))*B[1]);
		k += mm;
		c[j+2]  = (((((R[0]*p[k+o[21]]) + (R[1]*p[k+o[22]]))*G[0]) + (((R[0]*p[k+o[25]]) + (R[1]*p[k+o[26]]))*G[1]))*B[0])+
				  (((((R[0]*p[k+o[37]]) + (R[1]*p[k+o[38]]))*G[0]) + (((R[0]*p[k+o[41]]) + (R[1]*p[k+o[42]]))*G[1]))*B[1]);
		// find slopes and perform extrapolation as needed
		if (E) {
			if (rE) {
				k = b;
				rgb[15] = ((((p[k+o[22]]-p[k+o[21]])*G[0]) + ((p[k+o[26]]-p[k+o[25]])*G[1]))*B[0])+
						  ((((p[k+o[38]]-p[k+o[37]])*G[0]) + ((p[k+o[42]]-p[k+o[41]])*G[1]))*B[1]);
				k += mm;
				rgb[16] = ((((p[k+o[22]]-p[k+o[21]])*G[0]) + ((p[k+o[26]]-p[k+o[25]])*G[1]))*B[0])+
						  ((((p[k+o[38]]-p[k+o[37]])*G[0]) + ((p[k+o[42]]-p[k+o[41]])*G[1]))*B[1]);
				k += mm;
				rgb[17] = ((((p[k+o[22]]-p[k+o[21]])*G[0]) + ((p[k+o[26]]-p[k+o[25]])*G[1]))*B[0])+
						  ((((p[k+o[38]]-p[k+o[37]])*G[0]) + ((p[k+o[42]]-p[k+o[41]])*G[1]))*B[1]);
				c[ j ] += rgb[12] * rgb[15];
				c[j+1] += rgb[12] * rgb[16];
				c[j+2] += rgb[12] * rgb[17];
			}
			if (gE) {
				k = b;
				rgb[15] = ((((p[k+o[25]]-p[k+o[21]])*R[0]) + ((p[k+o[26]]-p[k+o[22]])*R[1]))*B[0])+
						  ((((p[k+o[41]]-p[k+o[37]])*R[0]) + ((p[k+o[42]]-p[k+o[38]])*R[1]))*B[1]);
				k += mm;
				rgb[16] = ((((p[k+o[25]]-p[k+o[21]])*R[0]) + ((p[k+o[26]]-p[k+o[22]])*R[1]))*B[0])+
						  ((((p[k+o[41]]-p[k+o[37]])*R[0]) + ((p[k+o[42]]-p[k+o[38]])*R[1]))*B[1]);
				k += mm;
				rgb[17] = ((((p[k+o[25]]-p[k+o[21]])*R[0]) + ((p[k+o[26]]-p[k+o[22]])*R[1]))*B[0])+
						  ((((p[k+o[41]]-p[k+o[37]])*R[0]) + ((p[k+o[42]]-p[k+o[38]])*R[1]))*B[1]);
				c[ j ] += rgb[13] * rgb[15];
				c[j+1] += rgb[13] * rgb[16];
				c[j+2] += rgb[13] * rgb[17];
			}
			if (bE) {
				k = b;
				rgb[15] = ((((p[k+o[37]]-p[k+o[21]])*R[0]) + ((p[k+o[38]]-p[k+o[22]])*R[1]))*G[0])+
						 ((((p[k+o[41]]-p[k+o[25]])*R[0]) + ((p[k+o[42]]-p[k+o[26]])*R[1]))*G[1]);
				k += mm;
				rgb[16] = ((((p[k+o[37]]-p[k+o[21]])*R[0]) + ((p[k+o[38]]-p[k+o[22]])*R[1]))*G[0])+
						 ((((p[k+o[41]]-p[k+o[25]])*R[0]) + ((p[k+o[42]]-p[k+o[26]])*R[1]))*G[1]);
				k += mm;
				rgb[17] = ((((p[k+o[37]]-p[k+o[21]])*R[0]) + ((p[k+o[38]]-p[k+o[22]])*R[1]))*G[0])+
						 ((((p[k+o[41]]-p[k+o[25]])*R[0]) + ((p[k+o[42]]-p[k+o[26]])*R[1]))*G[1]);
				c[ j ] += rgb[14] * rgb[15];	
				c[j+1] += rgb[14] * rgb[16];
				c[j+2] += rgb[14] * rgb[17];
			}
			E = false;
			rE = false;
			gE = false;
			bE = false;
		}
	}
};
LUTVolume.prototype.J = function(rgbIn) {
	// calculate the Jacobian matrix at rgbIn
	if (rgbIn.length === 3) {
		var c = new Float64Array(rgbIn.buffer.slice(0));
		var J = new Float64Array(9);
		var p = this.mesh;
		var o = this.off;
		var s = this.s;
		var rgb = this.rgb;
		var R = this.R;
		var G = this.G;
		var B = this.B;
		var nd = s + 2;
		var nd1 = nd + 1;
		var b,k;
		var fL = this.fL;
		var fLH = this.fLH;
		if (this.fS) {
			for (var j=0; j<m; j+=3) {
				c[0] = (c[0] - fL[0])/(fLH[0]);
				c[1] = (c[1] - fL[1])/(fLH[1]);
				c[2] = (c[2] - fL[2])/(fLH[2]);
			}
		}
		if (this.sin) {
			this.ins.FCub(c.buffer);
		}
		c[0] *= s;
		c[1] *= s;
		c[2] *= s;
		rgb[ 9] = Math.max(0,Math.min(s-1,Math.floor(c[ j ])));
		rgb[10] = Math.max(0,Math.min(s-1,Math.floor(c[j+1])));
		rgb[11] = Math.max(0,Math.min(s-1,Math.floor(c[j+2])));
		c[0] -= rgb[ 9];
		c[1] -= rgb[10];
		c[2] -= rgb[11];
		// clamp values between 0-1.0 for interpolation
		rgb[0] = Math.max(0,Math.min(1,c[0]));
		rgb[1] = Math.max(0,Math.min(1,c[1]));
		rgb[2] = Math.max(0,Math.min(1,c[2]));
		// Prep all the squares, cubes and cubics
		rgb[3] = rgb[0]*rgb[0];
		rgb[4] = rgb[1]*rgb[1];
		rgb[5] = rgb[2]*rgb[2];
		rgb[6] = rgb[3]*rgb[0];
		rgb[7] = rgb[4]*rgb[1];
		rgb[8] = rgb[5]*rgb[2];
		R[0] = (-0.5*rgb[6]) + rgb[3] - (0.5*rgb[0]);
		R[1] = (1.5*rgb[6]) - (2.5*rgb[3]) + 1;
		R[2] = (-1.5*rgb[6]) + (2*rgb[3]) + (0.5*rgb[0]);
		R[3] = (0.5*rgb[6]) - (0.5*rgb[3]);
		G[0] = (-0.5*rgb[7]) + rgb[4] - (0.5*rgb[1]);
		G[1] = (1.5*rgb[7]) - (2.5*rgb[4]) + 1;
		G[2] = (-1.5*rgb[7]) + (2*rgb[4]) + (0.5*rgb[1]);
		G[3] = (0.5*rgb[7]) - (0.5*rgb[4]);
		B[0] = (-0.5*rgb[8]) + rgb[5] - (0.5*rgb[2]);
		B[1] = (1.5*rgb[8]) - (2.5*rgb[5]) + 1;
		B[2] = (-1.5*rgb[8]) + (2*rgb[5]) + (0.5*rgb[2]);
		B[3] = (0.5*rgb[8]) - (0.5*rgb[5]);
		// set value for first control point in the mesh - P[-1,-1,-1]
		b = (rgb[9]) + ((rgb[10] + (rgb[11]*nd1))*nd1);
		// d/dR
		R[4] = (-1.5*rgb[3]) + (2*rgb[0]) - 0.5;
		R[5] = (4.5*rgb[3]) - (5*rgb[0]);
		R[6] = (-4.5*rgb[3]) + (4*rgb[0]) + 0.5;
		R[7] = (1.5*rgb[3] - rgb[0]);
		k = b;
		J[0] = (((((R[4]*p[k+o[ 0]])+(R[5]*p[k+o[ 1]])+(R[6]*p[k+o[ 2]])+(R[7]*p[k+o[ 3]]))*G[0])+
				 (((R[4]*p[k+o[ 4]])+(R[5]*p[k+o[ 5]])+(R[6]*p[k+o[ 6]])+(R[7]*p[k+o[ 7]]))*G[1])+
				 (((R[4]*p[k+o[ 8]])+(R[5]*p[k+o[ 9]])+(R[6]*p[k+o[10]])+(R[7]*p[k+o[11]]))*G[2])+
				 (((R[4]*p[k+o[12]])+(R[5]*p[k+o[13]])+(R[6]*p[k+o[14]])+(R[7]*p[k+o[15]]))*G[3]))*B[0])+
			   (((((R[4]*p[k+o[16]])+(R[5]*p[k+o[17]])+(R[6]*p[k+o[18]])+(R[7]*p[k+o[19]]))*G[0])+
				 (((R[4]*p[k+o[20]])+(R[5]*p[k+o[21]])+(R[6]*p[k+o[22]])+(R[7]*p[k+o[23]]))*G[1])+
				 (((R[4]*p[k+o[24]])+(R[5]*p[k+o[25]])+(R[6]*p[k+o[26]])+(R[7]*p[k+o[27]]))*G[2])+
				 (((R[4]*p[k+o[28]])+(R[5]*p[k+o[29]])+(R[6]*p[k+o[30]])+(R[7]*p[k+o[31]]))*G[3]))*B[1])+
			   (((((R[4]*p[k+o[32]])+(R[5]*p[k+o[33]])+(R[6]*p[k+o[34]])+(R[7]*p[k+o[35]]))*G[0])+
				 (((R[4]*p[k+o[36]])+(R[5]*p[k+o[37]])+(R[6]*p[k+o[38]])+(R[7]*p[k+o[39]]))*G[1])+
				 (((R[4]*p[k+o[40]])+(R[5]*p[k+o[41]])+(R[6]*p[k+o[42]])+(R[7]*p[k+o[43]]))*G[2])+
				 (((R[4]*p[k+o[44]])+(R[5]*p[k+o[45]])+(R[6]*p[k+o[46]])+(R[7]*p[k+o[47]]))*G[3]))*B[2])+
			   (((((R[4]*p[k+o[48]])+(R[5]*p[k+o[49]])+(R[6]*p[k+o[50]])+(R[7]*p[k+o[51]]))*G[0])+
				 (((R[4]*p[k+o[52]])+(R[5]*p[k+o[53]])+(R[6]*p[k+o[54]])+(R[7]*p[k+o[55]]))*G[1])+
				 (((R[4]*p[k+o[56]])+(R[5]*p[k+o[57]])+(R[6]*p[k+o[58]])+(R[7]*p[k+o[59]]))*G[2])+
				 (((R[4]*p[k+o[60]])+(R[5]*p[k+o[61]])+(R[6]*p[k+o[62]])+(R[7]*p[k+o[63]]))*G[3]))*B[3]);
		k += mm;
		J[3] = (((((R[4]*p[k+o[ 0]])+(R[5]*p[k+o[ 1]])+(R[6]*p[k+o[ 2]])+(R[7]*p[k+o[ 3]]))*G[0])+
				 (((R[4]*p[k+o[ 4]])+(R[5]*p[k+o[ 5]])+(R[6]*p[k+o[ 6]])+(R[7]*p[k+o[ 7]]))*G[1])+
				 (((R[4]*p[k+o[ 8]])+(R[5]*p[k+o[ 9]])+(R[6]*p[k+o[10]])+(R[7]*p[k+o[11]]))*G[2])+
				 (((R[4]*p[k+o[12]])+(R[5]*p[k+o[13]])+(R[6]*p[k+o[14]])+(R[7]*p[k+o[15]]))*G[3]))*B[0])+
			   (((((R[4]*p[k+o[16]])+(R[5]*p[k+o[17]])+(R[6]*p[k+o[18]])+(R[7]*p[k+o[19]]))*G[0])+
				 (((R[4]*p[k+o[20]])+(R[5]*p[k+o[21]])+(R[6]*p[k+o[22]])+(R[7]*p[k+o[23]]))*G[1])+
				 (((R[4]*p[k+o[24]])+(R[5]*p[k+o[25]])+(R[6]*p[k+o[26]])+(R[7]*p[k+o[27]]))*G[2])+
				 (((R[4]*p[k+o[28]])+(R[5]*p[k+o[29]])+(R[6]*p[k+o[30]])+(R[7]*p[k+o[31]]))*G[3]))*B[1])+
			   (((((R[4]*p[k+o[32]])+(R[5]*p[k+o[33]])+(R[6]*p[k+o[34]])+(R[7]*p[k+o[35]]))*G[0])+
				 (((R[4]*p[k+o[36]])+(R[5]*p[k+o[37]])+(R[6]*p[k+o[38]])+(R[7]*p[k+o[39]]))*G[1])+
				 (((R[4]*p[k+o[40]])+(R[5]*p[k+o[41]])+(R[6]*p[k+o[42]])+(R[7]*p[k+o[43]]))*G[2])+
				 (((R[4]*p[k+o[44]])+(R[5]*p[k+o[45]])+(R[6]*p[k+o[46]])+(R[7]*p[k+o[47]]))*G[3]))*B[2])+
			   (((((R[4]*p[k+o[48]])+(R[5]*p[k+o[49]])+(R[6]*p[k+o[50]])+(R[7]*p[k+o[51]]))*G[0])+
				 (((R[4]*p[k+o[52]])+(R[5]*p[k+o[53]])+(R[6]*p[k+o[54]])+(R[7]*p[k+o[55]]))*G[1])+
				 (((R[4]*p[k+o[56]])+(R[5]*p[k+o[57]])+(R[6]*p[k+o[58]])+(R[7]*p[k+o[59]]))*G[2])+
				 (((R[4]*p[k+o[60]])+(R[5]*p[k+o[61]])+(R[6]*p[k+o[62]])+(R[7]*p[k+o[63]]))*G[3]))*B[3]);
		k += mm;
		J[6] = (((((R[4]*p[k+o[ 0]])+(R[5]*p[k+o[ 1]])+(R[6]*p[k+o[ 2]])+(R[7]*p[k+o[ 3]]))*G[0])+
				 (((R[4]*p[k+o[ 4]])+(R[5]*p[k+o[ 5]])+(R[6]*p[k+o[ 6]])+(R[7]*p[k+o[ 7]]))*G[1])+
				 (((R[4]*p[k+o[ 8]])+(R[5]*p[k+o[ 9]])+(R[6]*p[k+o[10]])+(R[7]*p[k+o[11]]))*G[2])+
				 (((R[4]*p[k+o[12]])+(R[5]*p[k+o[13]])+(R[6]*p[k+o[14]])+(R[7]*p[k+o[15]]))*G[3]))*B[0])+
			   (((((R[4]*p[k+o[16]])+(R[5]*p[k+o[17]])+(R[6]*p[k+o[18]])+(R[7]*p[k+o[19]]))*G[0])+
				 (((R[4]*p[k+o[20]])+(R[5]*p[k+o[21]])+(R[6]*p[k+o[22]])+(R[7]*p[k+o[23]]))*G[1])+
				 (((R[4]*p[k+o[24]])+(R[5]*p[k+o[25]])+(R[6]*p[k+o[26]])+(R[7]*p[k+o[27]]))*G[2])+
				 (((R[4]*p[k+o[28]])+(R[5]*p[k+o[29]])+(R[6]*p[k+o[30]])+(R[7]*p[k+o[31]]))*G[3]))*B[1])+
			   (((((R[4]*p[k+o[32]])+(R[5]*p[k+o[33]])+(R[6]*p[k+o[34]])+(R[7]*p[k+o[35]]))*G[0])+
				 (((R[4]*p[k+o[36]])+(R[5]*p[k+o[37]])+(R[6]*p[k+o[38]])+(R[7]*p[k+o[39]]))*G[1])+
				 (((R[4]*p[k+o[40]])+(R[5]*p[k+o[41]])+(R[6]*p[k+o[42]])+(R[7]*p[k+o[43]]))*G[2])+
				 (((R[4]*p[k+o[44]])+(R[5]*p[k+o[45]])+(R[6]*p[k+o[46]])+(R[7]*p[k+o[47]]))*G[3]))*B[2])+
			   (((((R[4]*p[k+o[48]])+(R[5]*p[k+o[49]])+(R[6]*p[k+o[50]])+(R[7]*p[k+o[51]]))*G[0])+
				 (((R[4]*p[k+o[52]])+(R[5]*p[k+o[53]])+(R[6]*p[k+o[54]])+(R[7]*p[k+o[55]]))*G[1])+
				 (((R[4]*p[k+o[56]])+(R[5]*p[k+o[57]])+(R[6]*p[k+o[58]])+(R[7]*p[k+o[59]]))*G[2])+
				 (((R[4]*p[k+o[60]])+(R[5]*p[k+o[61]])+(R[6]*p[k+o[62]])+(R[7]*p[k+o[63]]))*G[3]))*B[3]);
		// d/dG
		G[4] = (-1.5*rgb[4]) + (2*rgb[1]) - 0.5;
		G[5] = (4.5*rgb[4]) - (5*rgb[1]);
		G[6] = (-4.5*rgb[4]) + (4*rgb[1]) + 0.5;
		G[7] = (1.5*rgb[4] - rgb[1]);
		k = b;
		J[1] = (((((R[0]*p[k+o[ 0]])+(R[1]*p[k+o[ 1]])+(R[2]*p[k+o[ 2]])+(R[3]*p[k+o[ 3]]))*G[4])+
					(((R[0]*p[k+o[ 4]])+(R[1]*p[k+o[ 5]])+(R[2]*p[k+o[ 6]])+(R[3]*p[k+o[ 7]]))*G[5])+
					(((R[0]*p[k+o[ 8]])+(R[1]*p[k+o[ 9]])+(R[2]*p[k+o[10]])+(R[3]*p[k+o[11]]))*G[6])+
					(((R[0]*p[k+o[12]])+(R[1]*p[k+o[13]])+(R[2]*p[k+o[14]])+(R[3]*p[k+o[15]]))*G[7]))*B[0])+
		  		  (((((R[0]*p[k+o[16]])+(R[1]*p[k+o[17]])+(R[2]*p[k+o[18]])+(R[3]*p[k+o[19]]))*G[4])+
					(((R[0]*p[k+o[20]])+(R[1]*p[k+o[21]])+(R[2]*p[k+o[22]])+(R[3]*p[k+o[23]]))*G[5])+
					(((R[0]*p[k+o[24]])+(R[1]*p[k+o[25]])+(R[2]*p[k+o[26]])+(R[3]*p[k+o[27]]))*G[6])+
					(((R[0]*p[k+o[28]])+(R[1]*p[k+o[29]])+(R[2]*p[k+o[30]])+(R[3]*p[k+o[31]]))*G[7]))*B[1])+
				  (((((R[0]*p[k+o[32]])+(R[1]*p[k+o[33]])+(R[2]*p[k+o[34]])+(R[3]*p[k+o[35]]))*G[4])+
					(((R[0]*p[k+o[36]])+(R[1]*p[k+o[37]])+(R[2]*p[k+o[38]])+(R[3]*p[k+o[39]]))*G[5])+
					(((R[0]*p[k+o[40]])+(R[1]*p[k+o[41]])+(R[2]*p[k+o[42]])+(R[3]*p[k+o[43]]))*G[6])+
					(((R[0]*p[k+o[44]])+(R[1]*p[k+o[45]])+(R[2]*p[k+o[46]])+(R[3]*p[k+o[47]]))*G[7]))*B[2])+
				  (((((R[0]*p[k+o[48]])+(R[1]*p[k+o[49]])+(R[2]*p[k+o[50]])+(R[3]*p[k+o[51]]))*G[4])+
					(((R[0]*p[k+o[52]])+(R[1]*p[k+o[53]])+(R[2]*p[k+o[54]])+(R[3]*p[k+o[55]]))*G[5])+
					(((R[0]*p[k+o[56]])+(R[1]*p[k+o[57]])+(R[2]*p[k+o[58]])+(R[3]*p[k+o[59]]))*G[6])+
					(((R[0]*p[k+o[60]])+(R[1]*p[k+o[61]])+(R[2]*p[k+o[62]])+(R[3]*p[k+o[63]]))*G[7]))*B[3]);
		k += mm;
		J[4] = (((((R[0]*p[k+o[ 0]])+(R[1]*p[k+o[ 1]])+(R[2]*p[k+o[ 2]])+(R[3]*p[k+o[ 3]]))*G[4])+
					(((R[0]*p[k+o[ 4]])+(R[1]*p[k+o[ 5]])+(R[2]*p[k+o[ 6]])+(R[3]*p[k+o[ 7]]))*G[5])+
					(((R[0]*p[k+o[ 8]])+(R[1]*p[k+o[ 9]])+(R[2]*p[k+o[10]])+(R[3]*p[k+o[11]]))*G[6])+
					(((R[0]*p[k+o[12]])+(R[1]*p[k+o[13]])+(R[2]*p[k+o[14]])+(R[3]*p[k+o[15]]))*G[7]))*B[0])+
		 		  (((((R[0]*p[k+o[16]])+(R[1]*p[k+o[17]])+(R[2]*p[k+o[18]])+(R[3]*p[k+o[19]]))*G[4])+
					(((R[0]*p[k+o[20]])+(R[1]*p[k+o[21]])+(R[2]*p[k+o[22]])+(R[3]*p[k+o[23]]))*G[5])+
					(((R[0]*p[k+o[24]])+(R[1]*p[k+o[25]])+(R[2]*p[k+o[26]])+(R[3]*p[k+o[27]]))*G[6])+
					(((R[0]*p[k+o[28]])+(R[1]*p[k+o[29]])+(R[2]*p[k+o[30]])+(R[3]*p[k+o[31]]))*G[7]))*B[1])+
				  (((((R[0]*p[k+o[32]])+(R[1]*p[k+o[33]])+(R[2]*p[k+o[34]])+(R[3]*p[k+o[35]]))*G[4])+
					(((R[0]*p[k+o[36]])+(R[1]*p[k+o[37]])+(R[2]*p[k+o[38]])+(R[3]*p[k+o[39]]))*G[5])+
					(((R[0]*p[k+o[40]])+(R[1]*p[k+o[41]])+(R[2]*p[k+o[42]])+(R[3]*p[k+o[43]]))*G[6])+
					(((R[0]*p[k+o[44]])+(R[1]*p[k+o[45]])+(R[2]*p[k+o[46]])+(R[3]*p[k+o[47]]))*G[7]))*B[2])+
				  (((((R[0]*p[k+o[48]])+(R[1]*p[k+o[49]])+(R[2]*p[k+o[50]])+(R[3]*p[k+o[51]]))*G[4])+
					(((R[0]*p[k+o[52]])+(R[1]*p[k+o[53]])+(R[2]*p[k+o[54]])+(R[3]*p[k+o[55]]))*G[5])+
					(((R[0]*p[k+o[56]])+(R[1]*p[k+o[57]])+(R[2]*p[k+o[58]])+(R[3]*p[k+o[59]]))*G[6])+
					(((R[0]*p[k+o[60]])+(R[1]*p[k+o[61]])+(R[2]*p[k+o[62]])+(R[3]*p[k+o[63]]))*G[7]))*B[3]);
		k += mm;
		J[7] = (((((R[0]*p[k+o[ 0]])+(R[1]*p[k+o[ 1]])+(R[2]*p[k+o[ 2]])+(R[3]*p[k+o[ 3]]))*G[4])+
					(((R[0]*p[k+o[ 4]])+(R[1]*p[k+o[ 5]])+(R[2]*p[k+o[ 6]])+(R[3]*p[k+o[ 7]]))*G[5])+
					(((R[0]*p[k+o[ 8]])+(R[1]*p[k+o[ 9]])+(R[2]*p[k+o[10]])+(R[3]*p[k+o[11]]))*G[6])+
					(((R[0]*p[k+o[12]])+(R[1]*p[k+o[13]])+(R[2]*p[k+o[14]])+(R[3]*p[k+o[15]]))*G[7]))*B[0])+
		  		  (((((R[0]*p[k+o[16]])+(R[1]*p[k+o[17]])+(R[2]*p[k+o[18]])+(R[3]*p[k+o[19]]))*G[4])+
					(((R[0]*p[k+o[20]])+(R[1]*p[k+o[21]])+(R[2]*p[k+o[22]])+(R[3]*p[k+o[23]]))*G[5])+
					(((R[0]*p[k+o[24]])+(R[1]*p[k+o[25]])+(R[2]*p[k+o[26]])+(R[3]*p[k+o[27]]))*G[6])+
					(((R[0]*p[k+o[28]])+(R[1]*p[k+o[29]])+(R[2]*p[k+o[30]])+(R[3]*p[k+o[31]]))*G[7]))*B[1])+
				  (((((R[0]*p[k+o[32]])+(R[1]*p[k+o[33]])+(R[2]*p[k+o[34]])+(R[3]*p[k+o[35]]))*G[4])+
					(((R[0]*p[k+o[36]])+(R[1]*p[k+o[37]])+(R[2]*p[k+o[38]])+(R[3]*p[k+o[39]]))*G[5])+
					(((R[0]*p[k+o[40]])+(R[1]*p[k+o[41]])+(R[2]*p[k+o[42]])+(R[3]*p[k+o[43]]))*G[6])+
					(((R[0]*p[k+o[44]])+(R[1]*p[k+o[45]])+(R[2]*p[k+o[46]])+(R[3]*p[k+o[47]]))*G[7]))*B[2])+
				  (((((R[0]*p[k+o[48]])+(R[1]*p[k+o[49]])+(R[2]*p[k+o[50]])+(R[3]*p[k+o[51]]))*G[4])+
					(((R[0]*p[k+o[52]])+(R[1]*p[k+o[53]])+(R[2]*p[k+o[54]])+(R[3]*p[k+o[55]]))*G[5])+
					(((R[0]*p[k+o[56]])+(R[1]*p[k+o[57]])+(R[2]*p[k+o[58]])+(R[3]*p[k+o[59]]))*G[6])+
					(((R[0]*p[k+o[60]])+(R[1]*p[k+o[61]])+(R[2]*p[k+o[62]])+(R[3]*p[k+o[63]]))*G[7]))*B[3]);
		// d/dB
		B[4] = (-1.5*rgb[5]) + (2*rgb[2]) - 0.5;
		B[5] = (4.5*rgb[5]) - (5*rgb[2]);
		B[6] = (-4.5*rgb[5]) + (4*rgb[2]) + 0.5;
		B[7] = (1.5*rgb[5] - rgb[2]);
		k = b;
		J[2] = (((((R[0]*p[k+o[ 0]])+(R[1]*p[k+o[ 1]])+(R[2]*p[k+o[ 2]])+(R[3]*p[k+o[ 3]]))*G[0])+
					(((R[0]*p[k+o[ 4]])+(R[1]*p[k+o[ 5]])+(R[2]*p[k+o[ 6]])+(R[3]*p[k+o[ 7]]))*G[1])+
					(((R[0]*p[k+o[ 8]])+(R[1]*p[k+o[ 9]])+(R[2]*p[k+o[10]])+(R[3]*p[k+o[11]]))*G[2])+
					(((R[0]*p[k+o[12]])+(R[1]*p[k+o[13]])+(R[2]*p[k+o[14]])+(R[3]*p[k+o[15]]))*G[3]))*B[4])+
		  		  (((((R[0]*p[k+o[16]])+(R[1]*p[k+o[17]])+(R[2]*p[k+o[18]])+(R[3]*p[k+o[19]]))*G[0])+
					(((R[0]*p[k+o[20]])+(R[1]*p[k+o[21]])+(R[2]*p[k+o[22]])+(R[3]*p[k+o[23]]))*G[1])+
					(((R[0]*p[k+o[24]])+(R[1]*p[k+o[25]])+(R[2]*p[k+o[26]])+(R[3]*p[k+o[27]]))*G[2])+
					(((R[0]*p[k+o[28]])+(R[1]*p[k+o[29]])+(R[2]*p[k+o[30]])+(R[3]*p[k+o[31]]))*G[3]))*B[5])+
				  (((((R[0]*p[k+o[32]])+(R[1]*p[k+o[33]])+(R[2]*p[k+o[34]])+(R[3]*p[k+o[35]]))*G[0])+
					(((R[0]*p[k+o[36]])+(R[1]*p[k+o[37]])+(R[2]*p[k+o[38]])+(R[3]*p[k+o[39]]))*G[1])+
					(((R[0]*p[k+o[40]])+(R[1]*p[k+o[41]])+(R[2]*p[k+o[42]])+(R[3]*p[k+o[43]]))*G[2])+
					(((R[0]*p[k+o[44]])+(R[1]*p[k+o[45]])+(R[2]*p[k+o[46]])+(R[3]*p[k+o[47]]))*G[3]))*B[6])+
				  (((((R[0]*p[k+o[48]])+(R[1]*p[k+o[49]])+(R[2]*p[k+o[50]])+(R[3]*p[k+o[51]]))*G[0])+
					(((R[0]*p[k+o[52]])+(R[1]*p[k+o[53]])+(R[2]*p[k+o[54]])+(R[3]*p[k+o[55]]))*G[1])+
					(((R[0]*p[k+o[56]])+(R[1]*p[k+o[57]])+(R[2]*p[k+o[58]])+(R[3]*p[k+o[59]]))*G[2])+
					(((R[0]*p[k+o[60]])+(R[1]*p[k+o[61]])+(R[2]*p[k+o[62]])+(R[3]*p[k+o[63]]))*G[3]))*B[7]);
		k += mm;
		J[5] = (((((R[0]*p[k+o[ 0]])+(R[1]*p[k+o[ 1]])+(R[2]*p[k+o[ 2]])+(R[3]*p[k+o[ 3]]))*G[0])+
					(((R[0]*p[k+o[ 4]])+(R[1]*p[k+o[ 5]])+(R[2]*p[k+o[ 6]])+(R[3]*p[k+o[ 7]]))*G[1])+
					(((R[0]*p[k+o[ 8]])+(R[1]*p[k+o[ 9]])+(R[2]*p[k+o[10]])+(R[3]*p[k+o[11]]))*G[2])+
					(((R[0]*p[k+o[12]])+(R[1]*p[k+o[13]])+(R[2]*p[k+o[14]])+(R[3]*p[k+o[15]]))*G[3]))*B[4])+
		  		  (((((R[0]*p[k+o[16]])+(R[1]*p[k+o[17]])+(R[2]*p[k+o[18]])+(R[3]*p[k+o[19]]))*G[0])+
					(((R[0]*p[k+o[20]])+(R[1]*p[k+o[21]])+(R[2]*p[k+o[22]])+(R[3]*p[k+o[23]]))*G[1])+
					(((R[0]*p[k+o[24]])+(R[1]*p[k+o[25]])+(R[2]*p[k+o[26]])+(R[3]*p[k+o[27]]))*G[2])+
					(((R[0]*p[k+o[28]])+(R[1]*p[k+o[29]])+(R[2]*p[k+o[30]])+(R[3]*p[k+o[31]]))*G[3]))*B[5])+
				  (((((R[0]*p[k+o[32]])+(R[1]*p[k+o[33]])+(R[2]*p[k+o[34]])+(R[3]*p[k+o[35]]))*G[0])+
					(((R[0]*p[k+o[36]])+(R[1]*p[k+o[37]])+(R[2]*p[k+o[38]])+(R[3]*p[k+o[39]]))*G[1])+
					(((R[0]*p[k+o[40]])+(R[1]*p[k+o[41]])+(R[2]*p[k+o[42]])+(R[3]*p[k+o[43]]))*G[2])+
					(((R[0]*p[k+o[44]])+(R[1]*p[k+o[45]])+(R[2]*p[k+o[46]])+(R[3]*p[k+o[47]]))*G[3]))*B[6])+
				  (((((R[0]*p[k+o[48]])+(R[1]*p[k+o[49]])+(R[2]*p[k+o[50]])+(R[3]*p[k+o[51]]))*G[0])+
					(((R[0]*p[k+o[52]])+(R[1]*p[k+o[53]])+(R[2]*p[k+o[54]])+(R[3]*p[k+o[55]]))*G[1])+
					(((R[0]*p[k+o[56]])+(R[1]*p[k+o[57]])+(R[2]*p[k+o[58]])+(R[3]*p[k+o[59]]))*G[2])+
					(((R[0]*p[k+o[60]])+(R[1]*p[k+o[61]])+(R[2]*p[k+o[62]])+(R[3]*p[k+o[63]]))*G[3]))*B[7]);
		k += mm;
		J[8] = (((((R[0]*p[k+o[ 0]])+(R[1]*p[k+o[ 1]])+(R[2]*p[k+o[ 2]])+(R[3]*p[k+o[ 3]]))*G[0])+
					(((R[0]*p[k+o[ 4]])+(R[1]*p[k+o[ 5]])+(R[2]*p[k+o[ 6]])+(R[3]*p[k+o[ 7]]))*G[1])+
					(((R[0]*p[k+o[ 8]])+(R[1]*p[k+o[ 9]])+(R[2]*p[k+o[10]])+(R[3]*p[k+o[11]]))*G[2])+
					(((R[0]*p[k+o[12]])+(R[1]*p[k+o[13]])+(R[2]*p[k+o[14]])+(R[3]*p[k+o[15]]))*G[3]))*B[4])+
		  		  (((((R[0]*p[k+o[16]])+(R[1]*p[k+o[17]])+(R[2]*p[k+o[18]])+(R[3]*p[k+o[19]]))*G[0])+
					(((R[0]*p[k+o[20]])+(R[1]*p[k+o[21]])+(R[2]*p[k+o[22]])+(R[3]*p[k+o[23]]))*G[1])+
					(((R[0]*p[k+o[24]])+(R[1]*p[k+o[25]])+(R[2]*p[k+o[26]])+(R[3]*p[k+o[27]]))*G[2])+
					(((R[0]*p[k+o[28]])+(R[1]*p[k+o[29]])+(R[2]*p[k+o[30]])+(R[3]*p[k+o[31]]))*G[3]))*B[5])+
				  (((((R[0]*p[k+o[32]])+(R[1]*p[k+o[33]])+(R[2]*p[k+o[34]])+(R[3]*p[k+o[35]]))*G[0])+
					(((R[0]*p[k+o[36]])+(R[1]*p[k+o[37]])+(R[2]*p[k+o[38]])+(R[3]*p[k+o[39]]))*G[1])+
					(((R[0]*p[k+o[40]])+(R[1]*p[k+o[41]])+(R[2]*p[k+o[42]])+(R[3]*p[k+o[43]]))*G[2])+
					(((R[0]*p[k+o[44]])+(R[1]*p[k+o[45]])+(R[2]*p[k+o[46]])+(R[3]*p[k+o[47]]))*G[3]))*B[6])+
				  (((((R[0]*p[k+o[48]])+(R[1]*p[k+o[49]])+(R[2]*p[k+o[50]])+(R[3]*p[k+o[51]]))*G[0])+
					(((R[0]*p[k+o[52]])+(R[1]*p[k+o[53]])+(R[2]*p[k+o[54]])+(R[3]*p[k+o[55]]))*G[1])+
					(((R[0]*p[k+o[56]])+(R[1]*p[k+o[57]])+(R[2]*p[k+o[58]])+(R[3]*p[k+o[59]]))*G[2])+
					(((R[0]*p[k+o[60]])+(R[1]*p[k+o[61]])+(R[2]*p[k+o[62]])+(R[3]*p[k+o[63]]))*G[3]))*B[7]);
		// Scale to 0-1 range (from 0-s)
		J[0] *= s;
		J[1] *= s;
		J[2] *= s;
		J[3] *= s;
		J[4] *= s;
		J[5] *= s;
		J[6] *= s;
		J[7] *= s;
		J[8] *= s;
		if (this.sin) {
			var dRGB = this.ins.dRGB(rgbIn.buffer);
			J[0] *= dRGB[0];
			J[1] *= dRGB[1];
			J[2] *= dRGB[2];
			J[3] *= dRGB[0];
			J[4] *= dRGB[1];
			J[5] *= dRGB[2];
			J[6] *= dRGB[0];
			J[7] *= dRGB[1];
			J[8] *= dRGB[2];
		}
		if (this.fS) {
			J[0] /= fLH[0];
			J[1] /= fLH[1];
			J[2] /= fLH[2];
			J[3] /= fLH[0];
			J[4] /= fLH[1];
			J[5] /= fLH[2];
			J[6] /= fLH[0];
			J[7] /= fLH[1];
			J[8] /= fLH[2];
		}
		return J;
	} else {
		return false;
	}
};
LUTVolume.prototype.JInv = function(rgbIn) {
	var M = this.J(rgbIn);
	var det =	(M[0]*((M[4]*M[8]) - (M[5]*M[7]))) -
				(M[1]*((M[3]*M[8]) - (M[5]*M[6]))) +
				(M[2]*((M[3]*M[7]) - (M[4]*M[6])));
	if (det === 0) {
		return false;
	}
	return new Float64Array([
		((M[4]*M[8])-(M[5]*M[7]))/det, ((M[2]*M[7])-(M[1]*M[8]))/det, ((M[1]*M[5])-(M[2]*M[4]))/det,
		((M[5]*M[6])-(M[3]*M[8]))/det, ((M[0]*M[8])-(M[2]*M[6]))/det, ((M[2]*M[3])-(M[0]*M[5]))/det,
		((M[3]*M[7])-(M[4]*M[6]))/det, ((M[1]*M[6])-(M[0]*M[7]))/det, ((M[0]*M[4])-(M[1]*M[3]))/det
	]);
};
LUTVolume.prototype.getDetails = function() {
	var out = {
		title: this.title,
		format: this.format,
		dims: 3,
		s: this.d,
		min: new Float64Array([this.fL[0],this.fL[1],this.fL[2]]),
		max: new Float64Array([this.fH[0],this.fH[1],this.fH[2]]),
		C: this.getRGB(),
		meta: this.meta
	};
	return out;
};
LUTVolume.prototype.getL = function() {
	return this.L.getL();
};
LUTVolume.prototype.getRGB = function() {
	var d = this.d;
	var nd = d+2;
	var m = d*d*d;
	var nm = nd*nd*nd;
	var R = new Float64Array(m);
	var G = new Float64Array(m);
	var B = new Float64Array(m);
	var k,l;
	var p = this.mesh;
	for (var b=0; b<d; b++) {
		for (var g=0; g<d; g++) {
			for (var r=0; r<d; r++) {
				k = r + ((g + (b*d))*d);
				l = (r+1) + (((g+1) + ((b+1)*nd))*nd);
				R[k] = p[l];
				l += nm;
				G[k] = p[l];
				l += nm;
				B[k] = p[l];
			}
		}
	}
	return [R.buffer,G.buffer,B.buffer];
};
LUTVolume.prototype.getSize = function() {
	return this.d;
};
LUTVolume.prototype.is1D = function() {
	return false;
};
LUTVolume.prototype.is3D = function() {
	return true;
};
LUTVolume.prototype.getTitle = function() {
	return this.title;
};
LUTVolume.prototype.getMetadata = function() {
	return this.meta;
};
LUTVolume.prototype.isClamped = function() {
	if (typeof this.clamped === 'undefined') {
		var mm = this.minMax();
		var min = Math.min(mm[0],mm[1],mm[2]);
		var max = Math.max(mm[3],mm[4],mm[5]);
		if ((min === 0 && max <= 1) || (min >= 0 && max === 1)) {
			this.clamped = true;
		} else {
			this.clamped = false;
		}
	}
	return this.clamped;
};
LUTVolume.prototype.deClamp = function() {
	if (this.isClamped()) {
		this.deClamp1D();
		this.deClamp3D();
	}
};
//
LUTVolume.prototype.getColourSpace = function() {
	var d = this.d;
	var fL = this.fL;
	var fH = this.fH;
	var fLH = this.fLH;
	var out = {
		title: this.title + 'CS',
		format: this.format,
		fLR: fL[0],
		fLG: fL[1],
		fLB: fL[2],
		fHR: fH[0],
		fHG: fH[1],
		fHB: fH[2]
	};
	var reverse = new LUTRSpline({ buff:this.L.getL(), fH:fH[3], fL:fL[3] });
	var base = this.getRGB();
	reverse.R(base[0]);
	reverse.R(base[1]);
	reverse.R(base[2]);
	out.buffR = base[0];
	out.buffG = base[1];
	out.buffB = base[2];
	return new LUTVolume(out);
};
LUTVolume.prototype.deClamp1D = function() {
	var m = this.d;
	var r = new Float64Array(m);
	var g = new Float64Array(m);
	var b = new Float64Array(m);
	var rL = 0;
	var gL = 0;
	var bL = 0;
	var rH = m-1;
	var gH = m-1;
	var bH = m-1;
	var nd = this.d + 2;
	var nm = nd*nd*nd;
	var k;
	var M = this.mesh;
	var rC = false;
	var gC = false;
	var bC = false;
	var fL = Math.min(this.fL[0],this.fL[1],this.fL[2]);
	var fH = Math.max(this.fH[0],this.fH[1],this.fH[2]);
	var fLH= fH-fL;
	// Fill three arrays with values from the gray diagonal of the mesh, and find the index where the values are not 0 or 1
	for (var j=0; j<m; j++) {
		k = (j+1) + (((j+1) + ((j+1)*nd))*nd);
		r[j] = M[k];
		k += nm;
		g[j] = M[k];
		k += nm;
		b[j] = M[k];
		if (j>0) {
//			if (r[j] === 0 && r[j-1] === 0) {
			if (r[j] === 0) {
				rC = true;
				rL = j+1;
			}
//			if (g[j] === 0 && g[j-1] === 0) {
			if (g[j] === 0) {
				gC = true;
				gL = j+1;
			}
//			if (b[j] === 0 && b[j-1] === 0) {
			if (b[j] === 0) {
				bC = true;
				bL = j+1;
			}
		}
	}
	for (var j=m-2; j>=0; j--) {
//		if (r[j] === 1 && (r[j+1] === 1 || rC)) {
		if (r[j] === 1) {
			rC = true;
			rH = j-1;
		}
//		if (g[j] === 1 && (g[j+1] === 1 || gC)) {
		if (g[j] === 1) {
			gC = true;
			gH = j-1;
		}
//		if (b[j] === 1 && (b[j+1] === 1 || bC)) {
		if (b[j] === 1) {
			bC = true;
			bH = j-1;
		}
	}
	// if the 0 index is greater than 0 or the 1 index less than m-1, make a spline to fill in the gaps
	if (rC || gC || bC) {
		var low;
		if (rL > rH) {
			low = rH;
			rH = Math.min(rL-2,m-1);
			rL = Math.max(low+2,0);
		}
		if (gL > gH) {
			low = gH;
			gH = Math.min(gL-2,m-1);
			gL = Math.max(low+2,0);
		}
		if (bL > bH) {
			low = bH;
			bH = Math.min(bL-2,m-1);
			bL = Math.max(low+2,0);
		}
		var rS,gS,bS;
		if (rC) {
			rS = new LUTQSpline(new Float64Array(r.subarray(rL,rH-rL+1)).buffer);
		} else {
			rS = new LUTQSpline(r.buffer);
		}
		if (gC) {
			gS = new LUTQSpline(new Float64Array(g.subarray(gL,gH-gL+1)).buffer);
		} else {
			gS = new LUTQSpline(g.buffer);
		}
		if (bC) {
			bS = new LUTQSpline(new Float64Array(b.subarray(bL,bH-bL+1)).buffer);
		} else {
			bS = new LUTQSpline(b.buffer);
		}
		// Now built an array to replace the 'L' spline from this.buildL()
		var m2 = m;
		if (m < 65) {
			m2 = 65;
		}
		var FD = new Float64Array(m2);
		var rI = new Float64Array(m2);
		for (var j=0; j<m2; j++) { // create rgb array of input values
			rI[j] = (j*(fLH)/(m2-1))+fL;
		}
		var gI = new Float64Array(rI);
		var bI = new Float64Array(rI);
		// apply input scaling as required
		if (this.fS) {
			for (var j=0; j<m2; j++) {
				rI[j] = (rI[j] - this.fL[0])/(this.fLH[0]);
				gI[j] = (gI[j] - this.fL[1])/(this.fLH[1]);
				bI[j] = (bI[j] - this.fL[2])/(this.fLH[2]);
			}
		}
		if (this.sin) {
			this.ins.FCub(rI.buffer);
			this.ins.FCub(gI.buffer);
			this.ins.FCub(bI.buffer);
		}
		// scale for any clamped splines
		for (var j=0; j<m2; j++) {
			rI[j] = ((rI[j]*(m-1)) - rL)/(rH-rL);
			gI[j] = ((gI[j]*(m-1)) - gL)/(gH-gL);
			bI[j] = ((bI[j]*(m-1)) - bL)/(bH-bL);
		}
		// pass through the splines
		rS.FCub(rI.buffer);
		gS.FCub(gI.buffer);
		bS.FCub(bI.buffer);
		// bring together the results to make the L array
		for (var j=0; j<m2; j++) {
			rI[j] = (rI[j]*this.Y[0]) + (gI[j]*this.Y[1]) + (bI[j]*this.Y[2]);
		}
		// replace the 'L' spline - make it reversible as that will be needed for 3D declamping
		this.L = new LUTSpline({ buff:rI.buffer, fH:fH, fL:fL });
		this.clamped = false;
		return true;
	} else {
		return false;
	}
};
LUTVolume.prototype.deClamp3D = function() {
	var d = this.d;
	var d3 = 3*d;
	var nd = d+2;
	var nd2 = nd * nd;
	var nm = nd*nd*nd;
	var sG = nd2 * nd;
	var sB = 2 * sG;
	var M = this.mesh;
	var r = new Float64Array(d);
	var g = new Float64Array(d);
	var b = new Float64Array(d);
	var l,k;
	var rC,gC,bC;
	var rL,gL,bL;
	var rH,gH,bH;
	var low;
	var minMax = this.minMax();
	var lo = Math.min(0, Math.min(minMax[0],minMax[1],minMax[2])); // 0, or the lowest value in the mesh, whichever the lesser
	var hi = Math.max(1, Math.max(minMax[3],minMax[4],minMax[5])); // 1.0, or the highest value in the mesh, whichever the greater
	var min = lo - 0.1; // 10% below the 'lo' value
	var max = hi + 0.175; // 17.5% above 'hi' value
	var limits = new Float64Array([lo,hi,min,max]);
	// First sort out inner splines
	for (var x=0; x<d; x++) {
		for (var y=0; y<d; y++) {
			rL = 0;
			gL = 0;
			bL = 0;
			rH = d-1;
			gH = d-1;
			bH = d-1;
			rC = false;
			gC = false;
			bC = false;
			for (var z=0; z<d; z++) {
				l = (z+1) + (((y+1) + ((x+1)*nd))*nd);
				r[z] = M[l];
				l = (y+1) + (((z+1) + ((x+1)*nd))*nd) + nm;
				g[z] = M[l];
				l = (y+1) + (((x+1) + ((z+1)*nd))*nd) + (2*nm);
				b[z] = M[l];
				if (z>0) {
//					if (r[z] === 0 && r[z-1] === 0) {
					if (r[z] === 0) {
						rC = true;
						rL = z+1;
					}
//					if (g[z] === 0 && g[z-1] === 0) {
					if (g[z] === 0) {
						gC = true;
						gL = z+1;
					}
//					if (b[z] === 0 && b[z-1] === 0) {
					if (b[z] === 0) {
						bC = true;
						bL = z+1;
					}
				}
			}
			for (var z=d-2; z>=0; z--) {
//				if (r[z] === 1 && (r[z+1] === 1 || rC)) {
				if (r[z] === 1) {
					rC = true;
					rH = z-1;
				}
//				if (g[z] === 1 && (g[z+1] === 1 || gC)) {
				if (g[z] === 1) {
					gC = true;
					gH = z-1;
				}
//				if (b[z] === 1 && (b[z+1] === 1 || bC)) {
				if (b[z] === 1) {
					bC = true;
					bH = z-1;
				}
			}
			if (rC) {
				if (rL > rH) {
					low = rH;
					rH = Math.min(rL-2,m-1);
					rL = Math.max(low+2,0);
				}
				this.extrap(r,rL,rH,limits);
				for (var z=0; z<d; z++) {
					if (z === rL) {
						z = rH;
					}
					l = (z+1) + (((y+1) + ((x+1)*nd))*nd);
					M[l] = r[z];
				}
			}
			if (gC) {
				if (gL > gH) {
					low = gH;
					gH = Math.min(gL-2,m-1);
					gL = Math.max(low+2,0);
				}
				this.extrap(g,gL,gH,limits);
				for (var z=0; z<d; z++) {
					if (z === gL) {
						z = gH;
					}
					l = (y+1) + (((z+1) + ((x+1)*nd))*nd) + nm;
					M[l] = g[z];
				}
			}
			if (bC) {
				if (bL > bH) {
					low = bH;
					bH = Math.min(bL-2,m-1);
					bL = Math.max(low+2,0);
				}
				this.extrap(b,bL,bH,limits);
				for (var z=0; z<d; z++) {
					if (z === bL) {
						z = bH;
					}
					l = (y+1) + (((x+1) + ((z+1)*nd))*nd) + (2*nm);
					M[l] = b[z];
				}
			}
		}
	}
	// Now fill in the edges and corners as with this.fillEdges()
	d--;
	for (var x=1; x<(d); x++) {
		for (var y=0; y<d; y++) {
			this.n3b( x, y, 0);
			this.n3b( x, y, d);
			this.n3b( x, 0, y);
			this.n3b( x, d, y);
			this.n3b( 0, x, y);
			this.n3b( d, x, y);
		}
		this.n3b( x, 0, 0);
		this.n3b( x, 0, d);
		this.n3b( x, d, 0);
		this.n3b( x, d, d);
		this.n3b( 0, x, 0);
		this.n3b( 0, x, d);
		this.n3b( d, x, 0);
		this.n3b( d, x, d);
		this.n3b( 0, 0, x);
		this.n3b( 0, d, x);
		this.n3b( d, 0, x);
		this.n3b( d, d, x);
	}
	this.n3b( 0, 0, 0);
	this.n3b( 0, 0, d);
	this.n3b( 0, d, 0);
	this.n3b( 0, d, d);
	this.n3b( d, 0, 0);
	this.n3b( d, 0, d);
	this.n3b( d, d, 0);
	this.n3b( d, d, d);
	// Repopulate the outer edges of the mesh
	this.fillEdges();
	this.clamped = false;
};
LUTVolume.prototype.extrap = function(c,L,H,limits) {
	var m = c.length;
	var dcLo,dcHi;
	if (H-L > 2) { // more than four points
		dcLo = (0.1*c[L+3]) - (0.8*c[L+2]) + (2.3*c[L+1]) - (1.6*c[L]);
		dcHi = (-0.1*c[H-3]) + (0.8*c[H-2]) - (2.3*c[H-1]) + (1.6*c[H]);
	} else if (H-L > 1) { // three points
		dcLo = 1;
		dcHi = 1;
	} else { // two points
		dcLo = c[L+1] - c[L];
		dcHi = c[H] - c[H-1];
	}
	if (L > 0) {
		for (var j=0; j<L; j++) {
			c[j] = c[L] + ((j-L)*dcLo);
		}
	}
	if (H < m-1) {
		for (var j=H+1; j<m; j++) {
			c[j] = c[H] + ((j-H)*dcHi);
		}
	}
	if (typeof limits !== 'undefined') {
		var lo = limits[0];
		var hi = limits[1];
		var min = limits[2];
		var max = limits[3];
		var numLo = Math.pow(min-lo,2);
		var denLo = min-lo;
		var numHi = Math.pow(max-hi,2);
		var denHi = max-hi;
		for (var j=0; j<m; j++) {
			if (j === L) {
				j = H+1;
			}
			if (c[j] < lo) {
				c[j] = min - (numLo/((dcLo*(c[j]-lo))+denLo));
			} else if (c[j] > hi) {
				c[j] = max - (numHi/((dcHi*(c[j]-hi))+denHi));
			}
		}
	}
};
LUTVolume.prototype.fillEdges = function() {
	var d = this.d;
	// fill in the gaps in the new mesh
	for (var x=0; x<d; x++) {
		for (var y=0; y<d; y++) {
			this.n3( x, y,-1);
			this.n3( x, y, d);
			this.n3( x,-1, y);
			this.n3( x, d, y);
			this.n3(-1, x, y);
			this.n3( d, x, y);
		}
		this.n3( x,-1,-1);
		this.n3( x,-1, d);
		this.n3( x, d,-1);
		this.n3( x, d, d);
		this.n3(-1, x,-1);
		this.n3(-1, x, d);
		this.n3( d, x,-1);
		this.n3( d, x, d);
		this.n3(-1,-1, x);
		this.n3(-1, d, x);
		this.n3( d,-1, x);
		this.n3( d, d, x);
	}
	this.n3(-1,-1,-1);
	this.n3(-1,-1, d);
	this.n3(-1, d,-1);
	this.n3(-1, d, d);
	this.n3( d,-1,-1);
	this.n3( d,-1, d);
	this.n3( d, d,-1);
	this.n3( d, d, d);
};
LUTVolume.prototype.setP = function(rM,gM,bM,rgb) {
	// setP is used to change an individual mesh point. The inputs rM, gM, bM are zero-indexed coordinates on the base mesh
	// rgb is a Float64Array of the r, g and b values to be set at the specified mesh point
	// setP returns a Float64Array of the rgb value before changing
	var M = this.mesh;
	var d = this.d-1;
	var s = d-4;
	var nd = this.nd;
	var nd2 = nd*nd;
	var sG = nd2*nd;
	var sB = 2 * sG;
	var k = (rM + 1) + ((gM + 1)*nd) + ((bM + 1)*nd2);
	var o = new Float64Array([M[ k ], M[k+sG], M[k+sB]]);
	M[ k ] = rgb[0];
	M[k+sG] = rgb[1];
	M[k+sB] = rgb[2];
	// recalculate any edges, faces or corners in the extended mesh affected by the value change
	if (rM < 4) {
		// faces
		this.n3(-1,gM,bM);
		// edges
		if (gM ===   rM) { this.n3(-1,-1,bM); }
		if (gM === s-rM) { this.n3(-1, d,bM); }
		if (bM ===   rM) { this.n3(-1,gM,-1); }
		if (bM === s-rM) { this.n3(-1,gM, d); }
		// corners
		if (gM ===   rM && bM ===   rM) { this.n3(-1,-1,-1); }
		if (gM === s-rM && bM ===   rM) { this.n3(-1, d,-1); }
		if (gM === s-rM && bM === s-rM) { this.n3(-1, d, d); }
		if (gM ===   rM && bM === s-rM) { this.n3(-1,-1, d); }
	}
	if (rM > s) {
		// faces
		this.n3( d,gM,bM);
		// edges
		if (gM ===   rM) { this.n3( d, d,bM); }
		if (gM === rM-s) { this.n3( d,-1,bM); }
		if (bM ===   rM) { this.n3( d,gM, d); }
		if (bM === rM-s) { this.n3( d,gM,-1); }
		// corners
		if (gM ===   rM && bM ===   rM) { this.n3( d, d, d); }
		if (gM === rM-s && bM ===   rM) { this.n3( d,-1, d); }
		if (gM === rM-s && bM === rM-s) { this.n3( d,-1,-1); }
		if (gM ===   rM && bM === rM-s) { this.n3( d, d,-1); }
	}
	if (gM < 4) {
		// faces
		this.n3(rM,-1,bM);
		// edges
		if (bM ===   gM) { this.n3(rM,-1,-1); }
		if (bM === s-gM) { this.n3(rM,-1, d); }
	}
	if (gM > s) {
		// faces
		this.n3(rM, d,bM);
		// edges
		if (bM ===   gM) { this.n3(rM, d,-1); }
		if (bM === gM-s) { this.n3(rM, d, d); }
	}
	if (bM < 4) { this.n3(rM,gM,-1); }
	if (bM > s) { this.n3(rM,gM, d); }
	return o;
};
LUTVolume.prototype.getP = function(rM,gM,bM) {
	var M = this.mesh;
	var nd = this.nd;
	var nd2 = nd*nd;
	var sG = nd2*nd;
	var sB = 2 * sG;
	var k = (rM + 1) + ((gM + 1)*nd) + ((bM + 1)*nd2);
	return new Float64Array([M[ k ],M[k+sG],M[k+sB]]);
};
LUTVolume.prototype.n3 = function(rM,gM,bM,mono) {
	// 3D extrapolation - calculates all colour channels at once
	// rM, gM and bM are mesh point coordinates relative to the base mesh, not the extended, precalculated one
	// ie -1 means the bottom edge of the extended mesh, this.d the top edge
	var rD,gD,bD;
	var d = this.d - 1;
	var pR = this.pR;
	var pG = this.pG;
	var pB = this.pB;
	var o,m;
	// Get the array position on the extended mesh that we are going to fill
	var nd = this.nd;
	var nd2 = nd*nd
	var k = (rM+1) + ((gM + 1)*nd) + ((bM + 1)*nd2);
	// Establish which way the points need to go, and from what base
	if (rM < 0) {
		rD = 1;
	} else if (rM > d) {
		rD = -1;
	} else {
		rD = 0;
	}
	if (gM < 0) {
		gD = 1;
	} else if (gM > d) {
		gD = -1;
	} else {
		gD = 0;
	}
	if (bM < 0) {
		bD = 1;
	} else if (bM > d) {
		bD = -1;
	} else {
		bD = 0;
	}
	// Fill in the points to be extrapolated
	var M = this.mesh;
	var sG = nd2*nd;
	var sB = 2 * sG;
	var l = k + rD + (gD*nd) + (bD*nd2);
	pR[3] = M[l];
	pG[3] = M[l + sG];
	pB[3] = M[l + sB];
	l += rD + (gD*nd) + (bD*nd2);
	pR[2] = M[l];
	pG[2] = M[l + sG];
	pB[2] = M[l + sB];
	l += rD + (gD*nd) + (bD*nd2);
	pR[1] = M[l];
	pG[1] = M[l + sG];
	pB[1] = M[l + sB];
	l += rD + (gD*nd) + (bD*nd2);
	pR[0] = M[l];
	pG[0] = M[l + sG];
	pB[0] = M[l + sB];
	// Now calculate the values
	// Red
	m = 0;
	if (pR[3] === pR[1]) {
		M[k] = pR[2];
//	} else if (typeof mono !== 'undefined') {
//		m = -mono*rD;
	} else if (pR[3] > pR[1]) {
		m = 1;
	} else {
		m = -1;
	}

	if (m !== 0) {
		o = (-0.4*pR[0]) + (2.2*pR[1]) - (4.2*pR[2]) + (3.4*pR[3]);
		if ((o-pR[2])*m <= 0) { // make sure that the slope at y(1) doesn't change sign
			o = pR[1] - (3*pR[2]) + (3*pR[3]);
			if ((o-pR[2])*m <= 0) { // if it is still swapping signs, use a slope of 0, ie y(2) = y(1)
				o = pR[2]; // this allows for a completely flat extrapolation, ie slope = 0 at y(1)
			}
		}
		M[k] = o;
	}
	// Green
	m = 0;
	if (pG[3] === pG[1]) {
		M[k + sG] = pG[2];
//	} else if (typeof mono !== 'undefined') {
//		m = -mono*gD;
	} else if (pG[3] > pG[1]) {
		m = 1;
	} else {
		m = -1;
	}
	if (m !== 0) {
		o = (-0.4*pG[0]) + (2.2*pG[1]) - (4.2*pG[2]) + (3.4*pG[3]);
		if ((o-pG[2])*m <= 0) { // make sure that the slope at y(1) doesn't change sign
			o = pG[1] - (3*pG[2]) + (3*pG[3]);
			if ((o-pG[2])*m <= 0) { // if it is still swapping signs, use a slope of 0, ie y(2) = y(1)
				o = pG[2]; // this allows for a completely flat extrapolation, ie slope = 0 at y(1)
			}
		}
		M[k + sG] = o;
	}
	// Blue
	m = 0;
	if (pB[3] === pB[1]) {
		M[k + sB] = pB[2];
//	} else if (typeof mono !== 'undefined') {
//		m = -mono*bD;
	} else if (pB[3] > pB[1]) {
		m = 1;
	} else {
		m = -1;
	}
	if (m !== 0) {
		o = (-0.4*pB[0]) + (2.2*pB[1]) - (4.2*pB[2]) + (3.4*pB[3]);
		if ((o-pB[2])*m <= 0) { // make sure that the slope at y(1) doesn't change sign
			o = pB[1] - (3*pB[2]) + (3*pB[3]);
			if ((o-pB[2])*m <= 0) { // if it is still swapping signs, use a slope of 0, ie y(2) = y(1)
				o = pB[2]; // this allows for a completely flat extrapolation, ie slope = 0 at y(1)
			}
		}
		M[k + sB] = o;
	}
};
LUTVolume.prototype.n3b = function(rM,gM,bM) {
	// 3D extrapolation - calculates all colour channels at once
	// rM, gM and bM are mesh point coordinates relative to the base mesh, not the extended, precalculated one
	// this differs from the basic n3 as it is for filling in the edges, corners and faces of the base mesh
	// after a declamp, to allow for interaction of colour channels, ie 0 is to bottom, this.d-1 the top.
	var rD,gD,bD;
	var d = this.d - 1;
	var pR = this.pR;
	var pG = this.pG;
	var pB = this.pB;
	var o,m;
	// Get the array position on the extended mesh that we are going to fill
	var nd = this.nd;
	var nd2 = nd*nd
	var k = (rM+1) + ((gM + 1)*nd) + ((bM + 1)*nd2);
	// Establish which way the points need to go, and from what base
	if (rM <= 0) {
		rD = 1;
	} else if (rM >= d) {
		rD = -1;
	} else {
		rD = 0;
	}
	if (gM <= 0) {
		gD = 1;
	} else if (gM >= d) {
		gD = -1;
	} else {
		gD = 0;
	}
	if (bM <= 0) {
		bD = 1;
	} else if (bM >= d) {
		bD = -1;
	} else {
		bD = 0;
	}
	// Fill in the points to be extrapolated
	var M = this.mesh;
	var sG = nd2*nd;
	var sB = 2 * sG;
	var l = k + rD + (gD*nd) + (bD*nd2);
	pR[3] = M[l];
	pG[3] = M[l + sG];
	pB[3] = M[l + sB];
	l += rD + (gD*nd) + (bD*nd2);
	pR[2] = M[l];
	pG[2] = M[l + sG];
	pB[2] = M[l + sB];
	l += rD + (gD*nd) + (bD*nd2);
	pR[1] = M[l];
	pG[1] = M[l + sG];
	pB[1] = M[l + sB];
	l += rD + (gD*nd) + (bD*nd2);
	pR[0] = M[l];
	pG[0] = M[l + sG];
	pB[0] = M[l + sB];
	// Now calculate the values
	M[ k  ] = - (0.1*pR[0]) + (0.8*pR[1]) - (2.3*pR[2]) + (2.6*pR[3]);
	M[k+sG] = - (0.1*pG[0]) + (0.8*pG[1]) - (2.3*pG[2]) + (2.6*pG[3]);
	M[k+sB] = - (0.1*pB[0]) + (0.8*pB[1]) - (2.3*pB[2]) + (2.6*pB[3]);
};
LUTVolume.prototype.compare = function(tgtBuff,tstBuff,method) {
	// returns the RMS differences in the red channels between a target dataset (tgt) and a test dataset (tst) which 'compare' passes through the lut
	// method sets the interpolation method used on the test set, currently trilinear (1, 'lin' or 'linear') or tricubic (anything else or the default if 'method' is not present.
	var tgt = new Float64Array(tgtBuff.slice(0));
	var tst = new Float64Array(tstBuff.slice(0));
	var m = tgt.length;
	if (m !== tst.length) {
		return false;
	}
	if (typeof method !== 'undefined') {
		method = method.toString().toLowerCase();
		if (method === '1' || method === 'tet') {
			this.RGBTet(tst.buffer);
		} else if (method === '2' || method === 'lin') {
			this.RGBLin(tst.buffer);
		} else {
			this.RGBCub(tst.buffer);
		}
	} else {
		this.RGBCub(tst.buffer);
	} 
	var e = new Float64Array(3);
	for (var j=0; j<m; j += 3) {
		e[0]  += Math.pow(tst[ j ] - tgt[ j ],2);
		e[1]  += Math.pow(tst[j+1] - tgt[j+1],2);
		e[2]  += Math.pow(tst[j+2] - tgt[j+2],2);
	}
	e[0] = Math.pow(e[0]*3/m,0.5);
	e[1] = Math.pow(e[1]*3/m,0.5);
	e[2] = Math.pow(e[2]*3/m,0.5);
	return e;
};
LUTVolume.prototype.NR3D = function(tgt,tolerence,maxIterations,seed) { // Multivariate (3D) Newton-Raphson
	if (tgt.length === 3) {
		var tol,m,x;
		if (typeof tolerence === 'number') { // tolerence for what is considered close enough
			tol = tolerence;
		} else {
			tol = 0.00000001;
		}
		tol *= tol; // saves putting a square root into the convergence test
		if (typeof maxItrss === 'number') { // maximum number of iterations before giving up (ie poor convergence)
			m = maxItrs;
		} else {
			m = 50;
		}
		if (typeof seed !== 'undefined' && seed.length === 3) { // initial 'seed' value - if none given use the target
			x = new Float64Array([seed[0],seed[1],seed[2]],0);
		} else {
			x = new Float64Array([tgt[0],tgt[1],tgt[2]],0);
		}
		var f,Jinv,d;
		for (var j=0; j<m; j++) {
			f = this.rgbCub(x);
			JInv = this.JInv(x);
			if (JInv) {
				// Newton-Raphson is a root (0) finder, so subtract the target values
				f[0] -= tgt[0];
				f[1] -= tgt[1];
				f[2] -= tgt[2];
				// Test for convergence
				x[3] = (f[0]*f[0]) + (f[1]*f[1]) + (f[2]*f[2]);
				if (x[3] < tol) {
					x[3] = 0;
					return x;
				} else if (j === m-1) { // last pass - it's not converging
					x[3] = Math.pow(x[3],0.5); // distance from target 
					return x;
				} else {
					x[0] -= (Jinv[0]*f[0]) + (JInv[1]*f[1]) + (JInv[2]*f[2]);
					x[1] -= (Jinv[3]*f[0]) + (JInv[4]*f[1]) + (JInv[5]*f[2]);
					x[2] -= (Jinv[6]*f[0]) + (JInv[7]*f[1]) + (JInv[8]*f[2]);
				}
			} else {
				return false;
			}
		}
	} else {
		return false
	}
};
LUTVolume.prototype.minMax = function() {
	var p = this.mesh;
	var x = new Float64Array([
		 9999, 9999, 9999,	// Absolute min values
		-9999,-9999,-9999	// Absolute max values
	]);
	var rgb = new Float64Array(3);
	var m = this.d;
	var nd = this.d+2;
	var nm = nd*nd*nd;
	var l;
	// First find the minimum and maximum values in the mesh, independent of each other
	for (var b=0; b<m; b++) {
		for (var g=0; g<m; g++) {
			for (var r=0; r<m; r++) {
				l = (r+1) + (((g+1) + ((b+1)*nd))*nd);
				if (p[l] < x[0]) {
					x[0] = p[l];
				} else if (p[l] > x[3]) {
					x[3] = p[l];
				}
				l += nm;
				if (p[l] < x[1]) {
					x[1] = p[l];
				} else if (p[l] > x[4]) {
					x[4] = p[l];
				}
				l += nm;
				if (p[l] < x[2]) {
					x[2] = p[l];
				} else if (p[l] > x[5]) {
					x[5] = p[l];
				}
			}
		}
	}
	return x;
};
LUTVolume.prototype.getLimits = function(minMax) {
	var p = this.mesh;
	var x;
	if (typeof minMax !== 'undefined') {
		x = minMax;
	} else {
		x = this.minMax();
	}
	var o = new Float64Array([
		 9999, 9999, 9999,	// Black
		-9999, 9999, 9999,	// Red
		-9999,-9999, 9999,	// Yellow
		 9999,-9999, 9999,	// Green
		 9999,-9999,-9999,	// Cyan
		 9999, 9999,-9999,	// Blue
		-9999, 9999,-9999,	// Magenta
		-9999,-9999,-9999	// White
	]);
	var i = new Float64Array(24);
	var d = new Float64Array([
		9999,9999,9999,9999,9999,9999,9999,9999
	]);
	var rgb = new Float64Array(3);
	var m = this.d;
	var nd = this.d+2;
	var nm = nd*nd*nd;
	var s = m-1;
	var D;
	var l;
	// Now go back through the mesh, comparing distances from the absolute corners
	for (var b=0; b<m; b++) {
		for (var g=0; g<m; g++) {
			for (var r=0; r<m; r++) {
				l = (r+1) + (((g+1) + ((b+1)*nd))*nd);
				rgb[0] = p[l];
				l += nm;
				rgb[1] = p[l];
				l += nm;
				rgb[2] = p[l];
				D = Math.pow(rgb[0]-x[0],2)+Math.pow(rgb[1]-x[1],2)+Math.pow(rgb[2]-x[2],2);	// Black
				if (D < d[0]) {
					o[ 0] = rgb[0];
					o[ 1] = rgb[1];
					o[ 2] = rgb[2];
					i[ 0] = r;
					i[ 1] = g;
					i[ 2] = b;
					d[0] = D;
				}
				D = Math.pow(rgb[0]-x[3],2)+Math.pow(rgb[1]-x[1],2)+Math.pow(rgb[2]-x[2],2);	// Red
				if (D < d[1]) {
					o[ 3] = rgb[0];
					o[ 4] = rgb[1];
					o[ 5] = rgb[2];
					i[ 3] = r;
					i[ 4] = g;
					i[ 5] = b;
					d[1] = D;
				}
				D = Math.pow(rgb[0]-x[3],2)+Math.pow(rgb[1]-x[4],2)+Math.pow(rgb[2]-x[2],2);	// Yellow
				if (D < d[2]) {
					o[ 6] = rgb[0];
					o[ 7] = rgb[1];
					o[ 8] = rgb[2];
					i[ 6] = r;
					i[ 7] = g;
					i[ 8] = b;
					d[2] = D;
				}
				D = Math.pow(rgb[0]-x[0],2)+Math.pow(rgb[1]-x[4],2)+Math.pow(rgb[2]-x[2],2);	// Green
				if (D < d[3]) {
					o[ 9] = rgb[0];
					o[10] = rgb[1];
					o[11] = rgb[2];
					i[ 9] = r;
					i[10] = g;
					i[11] = b;
					d[3] = D;
				}
				D = Math.pow(rgb[0]-x[0],2)+Math.pow(rgb[1]-x[4],2)+Math.pow(rgb[2]-x[5],2);	// Cyan
				if (D < d[4]) {
					o[12] = rgb[0];
					o[13] = rgb[1];
					o[14] = rgb[2];
					i[12] = r;
					i[13] = g;
					i[14] = b;
					d[4] = D;
				}
				D = Math.pow(rgb[0]-x[0],2)+Math.pow(rgb[1]-x[1],2)+Math.pow(rgb[2]-x[5],2);	// Blue
				if (D < d[5]) {
					o[15] = rgb[0];
					o[16] = rgb[1];
					o[17] = rgb[2];
					i[15] = r;
					i[16] = g;
					i[17] = b;
					d[5] = D;
				}
				D = Math.pow(rgb[0]-x[3],2)+Math.pow(rgb[1]-x[1],2)+Math.pow(rgb[2]-x[5],2);	// Magenta
				if (D < d[6]) {
					o[18] = rgb[0];
					o[19] = rgb[1];
					o[20] = rgb[2];
					i[18] = r;
					i[19] = g;
					i[20] = b;
					d[6] = D;
				}
				D = Math.pow(rgb[0]-x[3],2)+Math.pow(rgb[1]-x[4],2)+Math.pow(rgb[2]-x[5],2);	// White
				if (D < d[7]) {
					o[21] = rgb[0];
					o[22] = rgb[1];
					o[23] = rgb[2];
					i[21] = r;
					i[22] = g;
					i[23] = b;
					d[7] = D;
				}
			}
		}
	}
	for (var j=0; j<24; j++) {
		i[j] /= s
	}
	if (this.sin) {
		var rev = new LUTRSpline({
			buff: this.ins.getL()
		});
		rev.R(i.buffer);
	}
	if (this.fS) {
		var fL = this.fL;
		var fLH = this.fLH;
		for (var j=0; j<24; j += 3) {
			i[ j ] = (i[ j ]*fLH[0]) + fL[0];
			i[j+1] = (i[j+1]*fLH[1]) + fL[1];
			i[j+2] = (i[j+2]*fLH[2]) + fL[2];
		}
	}
	return {minMax:x, i:i, o:o};
};
// Stringify for inline Web Workers
function getLUTString() {
	var out = "";
	// LUTs
	out += LUTs.toString() + "\n";
	for (var j in LUTs.prototype) {
		out += 'LUTs.prototype.' + j + '=' + LUTs.prototype[j].toString() + "\n";
	}
	// LUTSpline
	out += LUTSpline.toString() + "\n";
	for (var j in LUTSpline.prototype) {
		out += 'LUTSpline.prototype.' + j + '=' + LUTSpline.prototype[j].toString() + "\n";
	}
	// LUTRGBSpline
	out += LUTRGBSpline.toString() + "\n";
	for (var j in LUTRGBSpline.prototype) {
		out += 'LUTRGBSpline.prototype.' + j + '=' + LUTRGBSpline.prototype[j].toString() + "\n";
	}
	// LUTRSpline
	out += LUTRSpline.toString() + "\n";
	for (var j in LUTRSpline.prototype) {
		out += 'LUTRSpline.prototype.' + j + '=' + LUTRSpline.prototype[j].toString() + "\n";
	}
	// LUTQSpline
	out += LUTQSpline.toString() + "\n";
	for (var j in LUTQSpline.prototype) {
		out += 'LUTQSpline.prototype.' + j + '=' + LUTQSpline.prototype[j].toString() + "\n";
	}
	// LUTVolume
	out += LUTVolume.toString() + "\n";
	for (var j in LUTVolume.prototype) {
		out += 'LUTVolume.prototype.' + j + '=' + LUTVolume.prototype[j].toString() + "\n";
	}
	return out;
}
var workerLUTString = getLUTString();
