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
	this.lutRange();
	this.title = 'LUT Analyst';
	this.inLUT = new LUTs();
	this.tf = new LUTs();
	this.cs = new LUTs();
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
	this.inLUT = new LUTs();
	this.tf = new LUTs();
	this.cs = new LUTs();
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
LUTAnalyst.prototype.updateLATF = function() {
	this.gaT = this.messages.getGammaThreads();
	var dets = this.tf.getDetails();
	var HL = this.tfSpline.getHighLow();
	dets.R = [this.tfSpline.getReverse()];
	dets.sr = this.tfSpline.getSR();
	dets.minR = [HL.revL,HL.revL,HL.revL];
	dets.maxR = [HL.revH,HL.revH,HL.revH];
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
		this.inLUT.lLsCub(buff);
		for (var j=0; j<max; j++) {
			if (this.legOut) {
				C[j] = ((C[j]*876)+64)/1023;
			}
		}
		this.tf.setDetails({
			title: 'Transfer Function',
			format: 'cube',
			dims: 1,
			s: max,
			min: [0,0,0],
			max: [1,1,1],
			C: [buff]
		});
		this.tfSpline = new LUTSpline(buff,1,0);
		this.pass = 1;
		this.getCS();
	} else { // Colour Space Pass
		this.brent = new Brent(this.tf,0,1);
		var max = dim*dim*dim;
		var R = new Float64Array(max);
		var G = new Float64Array(max);
		var B = new Float64Array(max);
		var rgb = new Float64Array(buff);
		this.inLUT.rRsCub(buff);
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
		var minMax = this.tfSpline.getMinMax();
		var a = minMax.a;
		var b = minMax.b;
		for (var j=0; j<max; j++) {
			if (R[j] < -65535) {
				R[j] = a;
			} else if (R[j] > 65535) {
				R[j] = b;
			}
			if (G[j] < -65535) {
				G[j] = a;
			} else if (B[j] > 65535) {
				G[j] = b;
			}
			if (B[j] < -65535) {
				B[j] = a;
			} else if (B[j] > 65535) {
				B[j] = b;
			}
		}		
		this.cs.setDetails({
			title: 'Colour Space',
			format: 'cube',
			dims: 3,
			s: dim,
			min: [0,0,0],
			max: [1,1,1],
			C: [R.buffer,G.buffer,B.buffer]
		});
		this.updateLATF();
		this.updateLACS();
	}
};
LUTAnalyst.prototype.updateLACS = function() {
	this.gtT = this.messages.getGamutThreads();
	this.messages.gtTxAll(this.p,6,this.cs.getDetails());
};
LUTAnalyst.prototype.getRGB = function() {
	return this.cs.getRGB();
};
