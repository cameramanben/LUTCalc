/* ring.js
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
function Ring() {
	this.title = '';
	this.s = 1024; // Dimension - eg 1024 or 4096 for 1D, 17, 33 or 65 for 3D
	this.step = 1; // increase in output value for each multiple of input 1
}
Ring.prototype.getSize = function() {
	return this.s;
}
Ring.prototype.getDetails = function() {
	var out = {
			title: this.title,
			s: this.s,
			step: this.step,
			L: this.L.buffer
	}
	return out;
}
Ring.prototype.setDetails = function(d) {
	this.title = d.title;
	if (typeof d.L !== 'undefined') {
		this.L = new Float64Array(d.L);
		this.s = this.L.length;
		this.step = this.L[this.s-1] - this.L[0];
	}
}
Ring.prototype.reset = function() {
	this.title = '';
	this.s = 1024;
	this.step = 1;
}
Ring.prototype.setL = function(bufL) {
	this.L = new Float64Array(bufL);
	this.s = this.L.length;
	this.step = this.L[this.s-1] - this.L[0];
}
Ring.prototype.getL = function() {
	return this.L.buffer;
}

Ring.prototype.f = function(L) {
	return this.lumaLCub(L);
}
Ring.prototype.lumaLCub = function(L) {
	var top = (this.s - 1);
	L = L%1;
	if (L<0) {
		L += 1;
	}
	L = L * top;
	var base = Math.floor(L);
	var p0,p1;
	var d0,d1;
	p0 = this.L[base];
	if (base === top) {
		p1 = this.L[0] + this.step;
		d0 = (this.L[0] + this.step - this.L[base-1])/2;
	} else if (base === 0) {
		p1 = this.L[base+1];
		d0 = (this.L[base+1] - this.L[top] + this.step)/2;
	} else {
		p1 = this.L[base+1];
		d0 = (this.L[base+1] - this.L[base - 1])/2;
	}
	if (base > top-2) {
		d1 = (this.L[(base + 2)%top] + this.step - this.L[base])/2;
	} else {
		d1 = (this.L[base + 2] - this.L[base])/2;
	}
	var a = (2 * p0) + d0 - (2 * p1) + d1;
	var b = - (3 * p0) - (2 * d0) + (3 * p1) - d1;
	var c = d0;
	var d = p0;
	var l = L - base;
	return (a * (l * l * l)) + (b * (l * l)) + (c * l) + d;
}
Ring.prototype.lumaLLin = function(L) {
	var top = this.s - 1;
	L = L%1;
	if (L<0) {
		L += 1;
	}
	L = L * top;
	var base = Math.floor(L);
	var dy = L - base;
	if (base === top) {
		return (this.L[base] * (1 - dy)) + ((this.L[0]+this.step) * dy);
	} else {
		return (this.L[base] * (1 - dy)) + (this.L[base + 1] * dy);
	}
}
