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
	this.r = 1; // increase in output value for each multiple of input 1
	this.p = false; // Specify if the output is monotonal (eg conversion to PSST angle)
	this.mod = false; // Specify if output reaches a modulus (eg colour). False or numeric value;
}
Ring.prototype.getSize = function() {
	return this.s;
}
Ring.prototype.getDetails = function() {
	var out = {
			title: this.title,
			s: this.s,
			r: this.r,
			p: this.p,
			L: this.L.buffer
	}
	return out;
}
Ring.prototype.setDetails = function(d) {
	this.title = d.title;
	if (typeof d.L !== 'undefined') {
		this.L = new Float64Array(d.L);
		this.s = this.L.length;
		if (typeof d.p === 'boolean') {
			if (typeof d.r === 'number') {
				this.r = d.r;
			} else {
				this.r = this.L[this.s-1] - this.L[0];
			}
			this.p = d.p;
		} else {
			this.p = false;
			this.r = 0;
		}
	}
	if (typeof d.mod === 'number') {
		this.mod = d.mod;
	} else {
		this.mod = false;
	}
}
Ring.prototype.reset = function() {
	this.title = '';
	this.s = 1024;
	this.r = 1;
	this.p = false;
}
Ring.prototype.setL = function(bufL) {
	this.L = new Float64Array(bufL);
	this.s = this.L.length;
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
		p1 = this.L[1] + this.r;
		d0 = (p1 - this.L[f-1])/2;
	} else if (f === 0) {
		p1 = this.L[1];
		d0 = (p1 - this.L[top-1] + this.r)/2;
	} else {
		p1 = this.L[f+1];
		d0 = (p1 - this.L[f - 1])/2;
	}
	if (f > top-2) {
		d1 = (this.L[(f + 3)%top] + this.r - this.L[f])/2;
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
	if (this.mod) {
		return this.cubMod(L);
	} else {
		return this.cub(L);
	}
}
Ring.prototype.lLLin = function(L) {
	if (this.mod) {
		return this.linMod(L);
	} else {
		return this.lin(L);
	}
}
Ring.prototype.cub = function(L) {
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
		p1 = this.L[1] + this.r;
		d0 = (p1 - this.L[f-1])/2;
	} else if (f === 0) {
		p1 = this.L[1];
		d0 = (p1 - this.L[top-1] + this.r)/2;
	} else {
		p1 = this.L[f+1];
		d0 = (p1 - this.L[f - 1])/2;
	}
	if (f > top-2) {
		d1 = (this.L[(f + 3)%top] + this.r - this.L[f])/2;
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
Ring.prototype.cubMod = function(L) {
	var top = (this.s - 1);
	L = L%1;
	if (L<0) {
		L += 1;
	}
	L = L * top;
	var f = Math.floor(L);
	var mod = this.mod;
	var sp = mod * 0.5;
	var p0,p1;
	var pm1,p2;
	var d0,d1;
	p0 = this.L[f];
	if (f === top) {
		p1 = this.L[1] + this.r;
		pm1 = this.L[f-1];
	} else if (f === 0) {
		p1 = this.L[1];
		pm1 = this.L[top-1] - this.r;
	} else {
		p1 = this.L[f+1];
		pm1 = this.L[f - 1];
	}
	if (f > top-2) {
		p2 = this.L[(f + 3)%top] + this.r;
	} else {
		p2 = this.L[f + 2];
	}
	if (p0-pm1 > sp) {
		pm1 += mod;
	} else if (pm1-p0 > sp) {
		pm1 -= mod;
	}
	if (p0-p1 > sp) {
		p1 += mod;
	} else if (p1-p0 > sp) {
		p1 -= mod;
	}
	if (p0-p2 > sp) {
		p2 += mod;
	} else if (p2-p0 > sp) {
		p2 -= mod;
	}
	pm1 = pm1%mod;
	p0 = p0%mod;
	p1 = p1%mod;
	p2 = p2%mod;
	d0 = (p1 - pm1)/2;
	d1 = (p2 - p0)/2;
	var a = (2 * p0) + d0 - (2 * p1) + d1;
	var b = - (3 * p0) - (2 * d0) + (3 * p1) - d1;
	var c = d0;
	var d = p0;
	L -= f;
	return (((((a * L) + b) * L) + c) * L) + d;
}
Ring.prototype.lin = function(L) {
	var top = this.s - 1;
	L = L%1;
	if (L<0) {
		L += 1;
	}
	L *= top;
	var f = Math.floor(L);
	var dy = L - f;
	if (f === top) {
		return (this.L[f] * (1 - dy)) + ((this.L[1]+this.r) * dy);
	} else {
		return (this.L[f] * (1 - dy)) + (this.L[f + 1] * dy);
	}
}
Ring.prototype.linMod = function(L) {
	var top = this.s - 1;
	var mod = this.mod;
	var sp = mod * 0.5;
	L = L%1;
	if (L<0) {
		L += 1;
	}
	L *= top;
	var f = Math.floor(L);
	var dy = L - f;
	var p0 = this.L[f];
	var p1;
	if (f === top) {
		p1 = this.L[1]+this.r;
	} else {
		p1 = this.L[f + 1];
	}
	if (p0-p1 > sp) {
		p1 += mod;
	} else if (p1-p0 > sp) {
		p1 -= mod;
	}
	p1 = p1%mod;
	return (p0 * (1 - dy)) + (p1 * dy);
}
Ring.prototype.lLsCub = function(buff) {
	if (this.mod) {
		this.cubsMod(buff);
	} else {
		this.cubs(buff);
	}
}
Ring.prototype.cubs = function(buff) {
	var o = new Float64Array(buff);
	var m = o.length;
	var max = this.s - 1;
	var f;
	var p0,p1;
	var d0,d1;
	var a,b,c,d;
	for (var j=0; j<m; j++) {
		o[j] = o[j]%1;
		if (o[j]<0) {
			o[j] += 1;
		}
		o[j] *= max;
		f = Math.floor(o[j]);
		p0 = this.L[f];
		if (f === max) {
			p1 = this.L[1] + this.r;
			d0 = (p1 - this.L[f-1])/2;
		} else if (f === 0) {
			p1 = this.L[1];
			d0 = (p1 - this.L[max-1] + this.r)/2;
		} else {
			p1 = this.L[f+1];
			d0 = (this.L[f+1] - this.L[f - 1])/2;
		}
		if (f > max-2) {
			d1 = (this.L[(f + 3)%max] + this.r - this.L[f])/2;
		} else {
			d1 = (this.L[f + 2] - this.L[f])/2;
		}
		a = (2 * p0) + d0 - (2 * p1) + d1;
		b = - (3 * p0) - (2 * d0) + (3 * p1) - d1;
		c = d0;
		d = p0;
		o[j] -= f;
		o[j] = (((((a * o[j]) + b) * o[j]) + c) * o[j]) + d;
	}
}
Ring.prototype.cubsMod = function(buff) {
	var o = new Float64Array(buff);
	var m = o.length;
	var max = this.s - 1;
	var f;
	var p0,p1;
	var pm1,p2;
	var d0,d1;
	var a,b,c,d;
	var mod = this.mod;
	var sp = mod * 0.5;
	for (var j=0; j<m; j++) {
		o[j] = o[j]%1;
		if (o[j]<0) {
			o[j] += 1;
		}
		o[j] *= max;
		f = Math.floor(o[j]);
		p0 = this.L[f];
		if (f === max) {
			p1 = this.L[1] + this.r;
			pm1 = this.L[f-1];
		} else if (f === 0) {
			p1 = this.L[1];
			pm1 = this.L[max-1] - this.r;
		} else {
			p1 = this.L[f+1];
			pm1 = this.L[f - 1];
		}
		if (f > max-2) {
			p2 = this.L[(f + 3)%max] + this.r;
		} else {
			p2 = this.L[f + 2];
		}
		if (p0-pm1 > sp) {
			pm1 += mod;
		} else if (pm1-p0 > sp) {
			pm1 -= mod;
		}
		if (p0-p1 > sp) {
			p1 += mod;
		} else if (p1-p0 > sp) {
			p1 -= mod;
		}
		if (p0-p2 > sp) {
			p2 += mod;
		} else if (p2-p0 > sp) {
			p2 -= mod;
		}
		pm1 = pm1%mod;
		p0 = p0%mod;
		p1 = p1%mod;
		p2 = p2%mod;
		d0 = (p1 - pm1)/2;
		d1 = (p2 - p0)/2;
		a = (2 * p0) + d0 - (2 * p1) + d1;
		b = - (3 * p0) - (2 * d0) + (3 * p1) - d1;
		c = d0;
		d = p0;
		o[j] -= f;
		o[j] = (((((a * o[j]) + b) * o[j]) + c) * o[j]) + d;
	}
}
Ring.prototype.lLsLin = function(buff) {
	if (this.mod) {
		this.linsMod(buff);
	} else {
		this.lins(buff);
	}
}
Ring.prototype.lins = function(buff) {
	var o = new Float64Array(buff);
	var m = o.length;
	var max = this.s - 1;
	var f, dy;
	for (var j=0; j<m; j++) {
		o[j] = o[j]%1;
		if (o[j]<0) {
			o[j] += 1;
		}
		o[j] *= max;
		var f = Math.floor(o[j]);
		var dy = o[j] - f;
		if (f === top) {
			o[j] = (this.L[f] * (1 - dy)) + ((this.L[1]+this.r) * dy);
		} else {
			o[j] = (this.L[f] * (1 - dy)) + (this.L[f + 1] * dy);
		}
	}
}
Ring.prototype.linMod = function(buff) {
	var o = new Float64Array(buff);
	var m = o.length;
	var max = this.s - 1;
	var f, dy;
	var p0,p1;
	var mod = this.mod;
	var sp = mod * 0.5;
	for (var j=0; j<m; j++) {
		o[j] = o[j]%1;
		if (o[j]<0) {
			o[j] += 1;
		}
		o[j] *= top;
		f = Math.floor(o[j]);
		dy = o[j] - f;
		p0 = this.L[f];
		if (f === max) {
			p1 = this.L[1]+this.r;
		} else {
			p1 = this.L[f + 1];
		}
		if (p0-p1 > sp) {
			p1 += mod;
		} else if (p1-p0 > sp) {
			p1 -= mod;
		}
		p1 = p1%mod;
		o[j] = (p0 * (1 - dy)) + (p1 * dy);
	}
}
