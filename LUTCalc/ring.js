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
	var top = (this.s - 1);
	L = L%1;
	if (L<0) {
		L += 1;
	}
	L = L * top;
	var f = Math.floor(L);
	var p0,p1;
	var d0,d1;
	p0 = this.L[f];
	if (f === top) {
		p1 = this.L[0] + this.step;
		d0 = (this.L[0] + this.step - this.L[f-1])/2;
	} else if (f === 0) {
		p1 = this.L[f+1];
		d0 = (this.L[f+1] - this.L[top] + this.step)/2;
	} else {
		p1 = this.L[f+1];
		d0 = (this.L[f+1] - this.L[f - 1])/2;
	}
	if (f > top-2) {
		d1 = (this.L[(f + 2)%top] + this.step - this.L[f])/2;
	} else {
		d1 = (this.L[f + 2] - this.L[f])/2;
	}
	var a = (2 * p0) + d0 - (2 * p1) + d1;
	var b = - (3 * p0) - (2 * d0) + (3 * p1) - d1;
	var c = d0;
	var d = p0;
	L -= f;
	return (((((a * L) + b) * L) + c) * L) + d;
}
Ring.prototype.lLCub = function(L) {
	var top = (this.s - 1);
	L = L%1;
	if (L<0) {
		L += 1;
	}
	L = L * top;
	var f = Math.floor(L);
	var p0,p1;
	var d0,d1;
	p0 = this.L[f];
	if (f === top) {
		p1 = this.L[0] + this.step;
		d0 = (this.L[0] + this.step - this.L[f-1])/2;
	} else if (f === 0) {
		p1 = this.L[f+1];
		d0 = (this.L[f+1] - this.L[top] + this.step)/2;
	} else {
		p1 = this.L[f+1];
		d0 = (this.L[f+1] - this.L[f - 1])/2;
	}
	if (f > top-2) {
		d1 = (this.L[(f + 2)%top] + this.step - this.L[f])/2;
	} else {
		d1 = (this.L[f + 2] - this.L[f])/2;
	}
	var a = (2 * p0) + d0 - (2 * p1) + d1;
	var b = - (3 * p0) - (2 * d0) + (3 * p1) - d1;
	var c = d0;
	var d = p0;
	L -= f;
	return (((((a * L) + b) * L) + c) * L) + d;
}
Ring.prototype.lumaLLin = function(L) {
	var top = this.s - 1;
	L = L%1;
	if (L<0) {
		L += 1;
	}
	L = L * top;
	var f = Math.floor(L);
	var dy = L - f;
	if (f === top) {
		return (this.L[f] * (1 - dy)) + ((this.L[0]+this.step) * dy);
	} else {
		return (this.L[f] * (1 - dy)) + (this.L[f + 1] * dy);
	}
}
