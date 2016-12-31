/* lutanalyst.js
* LA LUT calculation object for the LUTCalc Web App.
* 31st December 2014
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function LUTAnalyst(inputs, messages) {
	this.inputs = inputs;
	this.messages = messages;
	this.p = 7;
	this.messages.addUI(this.p,this);
	this.lutMaker = new LUTs();
	this.showGt = true;
	this.lutRange();
	this.reset();
	lutcalcReady(this.p);
}
LUTAnalyst.prototype.getTitle = function(lut) {
	switch(lut) {
		case 'in':  this.title = this.inLUT.getTitle();
					break;
		case 'tf':  this.title = this.tf.getTitle();
					break;
	}
	return this.title;
};
LUTAnalyst.prototype.reset = function() {
	this.title = 'LUT Analyst';
	this.inLUT = false;
	this.tf = false;
	this.cs = false;
};
LUTAnalyst.prototype.lutRange = function() {
	if (this.inputs.laRange[3].checked || this.inputs.laRange[2].checked) {
		this.legIn = true;
	} else {
		this.legIn = false;
	}
	if (this.inputs.laRange[0].checked || this.inputs.laRange[2].checked) {
		this.legOut = true;
	} else {
		this.legOut = false;
	}
};
LUTAnalyst.prototype.is1D = function() {
	return this.inLUT.is1D();
};
LUTAnalyst.prototype.is3D = function() {
	return this.inLUT.is3D();
};
LUTAnalyst.prototype.getTF = function() {
	this.lutRange();
	this.pass = 0;
	this.gammaIn = parseInt(this.inputs.laGammaSelect.options[this.inputs.laGammaSelect.selectedIndex].value);
	if (this.gammaIn === 9999) {
		this.gammaIn = parseInt(this.inputs.laLinGammaSelect.options[this.inputs.laLinGammaSelect.selectedIndex].value);
	}
	var dim = this.inLUT.getSize();
	if (dim < 65) {
		dim = 65;
	}
	this.messages.gaTx(this.p,8,{
		dim: dim,
		legIn: this.legIn,
		gamma: this.gammaIn
	});
};
LUTAnalyst.prototype.updateLATF = function(laFile) {
	this.gaT = this.messages.getGammaThreads();
	var dets = this.tf.getDetails(true);
	if (typeof laFile !== 'undefined' && laFile) {
		this.tfSpline = new LUTRSpline({buff:dets.C[0], fL:0, fH:1});
	}
	var HL = this.tfSpline.getHighLow();
	dets.R = [this.tfSpline.getReverse()];
	dets.sr = this.tfSpline.getRM();
	dets.minR = new Float64Array([HL.revL,HL.revL,HL.revL]);
	dets.maxR = new Float64Array([HL.revH,HL.revH,HL.revH]);
	this.messages.gaTxAll(this.p,6,dets);
};
LUTAnalyst.prototype.getL = function() {
	return this.tf.getL();
};
LUTAnalyst.prototype.getCS = function() {
	this.gamutIn = parseInt(this.inputs.laGamutSelect.options[this.inputs.laGamutSelect.selectedIndex].value);
	var dim;
	if (this.inputs.laDim[0].checked) {
		dim = 33;
	} else {
		dim = 65;
	}
	this.messages.gaTx(this.p,2,{
		dim: dim,
		legIn: this.legIn,
		gamma: this.gammaIn,
		gamut: this.gamutIn
	});
};
LUTAnalyst.prototype.gotInputVals = function(buff,dim) {
	if (this.pass === 0) { // Transfer function pass
		var C = new Float64Array(buff);
		var max = C.length;
		this.inLUT.FCub(buff);
		if (this.legOut) {
			for (var j=0; j<max; j++) {
				C[j] = ((C[j]*876)+64)/1023;
			}
		}
		this.tf = this.lutMaker.newLUT({
			title: 'Transfer Function',
			format: 'cube',
			dims: 1,
			s: max,
			min: [0,0,0],
			max: [1,1,1],
			C: [buff]
		});
		this.tfSpline = new LUTRSpline({buff:buff, fL:0, fH:1});
		this.pass = 1;
		this.getCS();
	} else if (this.inLUT.is3D()) { // Colour Space Pass
		var max = dim*dim*dim;
		var R = new Float64Array(max);
		var G = new Float64Array(max);
		var B = new Float64Array(max);
		var rgb = new Float64Array(buff);
		this.inLUT.RGBCub(buff);
		for (var j=0; j<max; j++) {
			k = j*3;
			if (this.legOut) {
				R[j] = this.tfSpline.r(((rgb[ k ]*876)+64)/1023);
				G[j] = this.tfSpline.r(((rgb[k+1]*876)+64)/1023);
				B[j] = this.tfSpline.r(((rgb[k+2]*876)+64)/1023);
			} else {
				R[j] = this.tfSpline.r(rgb[ k ]);
				G[j] = this.tfSpline.r(rgb[k+1]);
				B[j] = this.tfSpline.r(rgb[k+2]);
			}
		}
		var minMax = this.inLUT.minMax();
		if (this.legOut) {
			for (var j=0; j<6; j++) {
				minMax[j] = ((minMax[j]*876)+64)/1023;
			}
		}
// console.log(this.tfSpline.r(0));
		var	a = Math.min(0,					this.tfSpline.r(Math.min(minMax[0],minMax[1],minMax[2]))); // min value of 0 or lower if the analysed grayscale or any of the original mesh points get there
		var b = Math.max(1.1740560044504333,this.tfSpline.r(Math.max(minMax[3],minMax[4],minMax[5]))); // max value of 10 stops above mid gray (S-Log3) or higher if the analysed grayscale or any of the original mesh points get there
// console.log(a+' - '+b);
		for (var j=0; j<max; j++) {
			if (R[j] < a) {
				R[j] = a;
			} else if (R[j] > b) {
				R[j] = b;
			}
			if (G[j] < a) {
				G[j] = a;
			} else if (G[j] > b) {
				G[j] = b;
			}
			if (B[j] < a) {
				B[j] = a;
			} else if (B[j] > b) {
				B[j] = b;
			}
		}
		this.cs = this.lutMaker.newLUT({
			title: 'Colour Space',
			format: 'cube',
			dims: 3,
			s: dim,
			min: [0,0,0],
			max: [1,1,1],
			C: [R.buffer,G.buffer,B.buffer]
		});
		this.showGt = true;
		this.updateLATF();
		this.updateLACS();
	} else {
		this.showGt = false;
		this.updateLATF();
	}
};
LUTAnalyst.prototype.updateLACS = function() {
	this.gtT = this.messages.getGamutThreads();
	var d = this.cs.getDetails();
	var details = {
		title: d.title,
		format: d.format,
		dims: d.dims,
		s: d.s,
		min: d.min.slice(0),
		max: d.max.slice(0),
	};
	if (d.d === 3 || d.C.length === 3) {
		details.C = [
			d.C[0].slice(0),
			d.C[1].slice(0),
			d.C[2].slice(0)
		];
	} else {
		details.C = [d.C[0].slice(0)];
	}
	this.messages.gtTxAll(this.p,6,details);
};
LUTAnalyst.prototype.getRGB = function() {
	if (this.showGt) {
		return this.cs.getRGB();
	} else {
		return false;
	}
};
LUTAnalyst.prototype.setLUT = function(lut, data) {
	this[lut] = this.lutMaker.newLUT(data);
	if (typeof this[lut] !== 'undefined') {
		this.showGt = true;
		return true;
	} else {
		return false;
	}
};
LUTAnalyst.prototype.noCS = function() {
	this.showGt = false;
};
LUTAnalyst.prototype.showGamut = function() {
	return this.showGt;
};
