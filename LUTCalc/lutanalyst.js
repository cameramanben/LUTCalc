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
	this.natTF = false;
	this.inputEX = true;
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
LUTAnalyst.prototype.setCSInputData = function(buff,natTF,legIn) {
	this.natTF = natTF;
	this.inputEX = !legIn;
	this.inputData = new Float64Array(buff);
};
LUTAnalyst.prototype.getCSInputMatrix = function() {
	var dets = this.cs.getMetadata();
	if (typeof dets.inputMatrix !== 'undefined') {
		return dets.inputMatrix;
	} else {
		return false;
	}
};
LUTAnalyst.prototype.gotInputVals = function(buff,dim) {
	var inputTF;
	if (parseInt(this.inputs.laGammaSelect.options[this.inputs.laGammaSelect.selectedIndex].value) === 9999) {
		inputTF = this.inputs.laLinGammaSelect.options[this.inputs.laLinGammaSelect.selectedIndex].text.trim();
	} else {
		inputTF = this.inputs.laGammaSelect.options[this.inputs.laGammaSelect.selectedIndex].text.trim();
	}
	if (this.pass === 0) { // Transfer function pass
		var C = new Float64Array(buff);
		var m = C.length;
		this.inLUT.FCub(buff);
		if (this.legOut) {
			for (var j=0; j<m; j++) {
				C[j] = ((C[j]*876)+64)/1023;
			}
		}
		var mono = C[m-1] - C[0];
		if (mono >= 0) {
			mono = 1;
		} else if (mono < 0) {
			mono = -1;
		}
		if ((C[1]-C[0])*mono <= 0) {
			C[0] = (2*C[1]) - C[2];
			if ((C[1]-C[0])*mono <= 0) { // still opposite slope to monotonic
				C[0] = C[1] - (0.0075 * mono / (m-1));
			}
		}
		if ((C[m-1]-C[m-2])*mono <= 0) {
			C[m-1] = (2*C[m-2]) - C[m-3];
			if ((C[m-1]-C[m-2])*mono <= 0) { // still opposite slope to monotonic
				C[m-1] = C[m-2] + (0.0075 * mono / (m-1));
			}
		}
		this.tf = this.lutMaker.newLUT({
			title: 'Transfer Function',
			format: 'cube',
			dims: 1,
			s: m,
			min: [0,0,0],
			max: [1,1,1],
			C: [buff.slice(0)],
			meta: {
				inputTF: inputTF
			}
		});
		this.tfSpline = new LUTRSpline({buff:buff, fL:0, fH:1});
		this.pass = 1;
		this.getCS();
	} else if (this.inLUT.is3D()) { // Colour Space Pass
		var m = dim*dim*dim;
		var R = new Float64Array(m);
		var G = new Float64Array(m);
		var B = new Float64Array(m);
		var rgb = this.inputData;
		var inputMatrix = new Float64Array(buff);
		// Run the test data through the input LUT
		var method;
		if (this.inputs.laIntMethod[0].checked) {
			method = 0;
			this.inLUT.RGBCub(rgb.buffer);
		} else if (this.inputs.laIntMethod[1].checked) {
			method = 1;
			this.inLUT.RGBTet(rgb.buffer);
		} else {
			method = 2;
			this.inLUT.RGBLin(rgb.buffer);
		}
		for (var j=0; j<m; j++) {
			k = j*3;
			R[j] = rgb[ k ];
			G[j] = rgb[k+1];
			B[j] = rgb[k+2];
		}
		// Set the reversible spline
		var Y = new Float64Array(dim);
		if (this.natTF === 0) {
			if (this.legIn) {
				for (var j=0; j<dim; j++) {
					Y[j] = ((j*876/(dim-1))+64)/1023;
				}
			} else {
				for (var j=0; j<dim; j++) {
					Y[j] = j/(dim-1);
				}
			}
			this.tfSpline.FCub(Y.buffer); // this.tfSpline is always data in to data out
			if (this.legOut) {
				for (var j=0; j<dim; j++) {
					Y[j] = ((Y[j]*1023)-64)/876;
				}
			}
		} else {
			for (var j=0; j<dim; j++) {
				Y[j] = j/(dim-1);
			}
			this.inLUT.FCub(Y.buffer);
			var mono = Y[dim-1] - Y[0];
			if (mono >= 0) {
				mono = 1;
			} else if (mono < 0) {
				mono = -1;
			}
			if ((Y[1]-Y[0])*mono <= 0) {
				Y[0] = (2*Y[1]) - Y[2];
				if ((Y[1]-Y[0])*mono <= 0) { // still opposite slope to monotonic
					Y[0] = Y[1] - (0.0075 * mono / (dim-1));
				}
			}
			if ((Y[dim-1]-Y[dim-2])*mono <= 0) {
				Y[dim-1] = (2*Y[dim-2]) - Y[dim-3];
				if ((Y[dim-1]-Y[dim-2])*mono <= 0) { // still opposite slope to monotonic
					Y[dim-1] = Y[dim-2] + (0.0075 * mono / (dim-1));
				}
			}
		}
		var tfSpline = new LUTRSpline({buff:Y.buffer, fL:0, fH:1});
		tfSpline.setMethod(method);
		// Find the reverse of the LUTTed data
		tfSpline.R(R.buffer);
		tfSpline.R(G.buffer);
		tfSpline.R(B.buffer);
		// Limit the results
		var minMax = this.inLUT.minMax();
		var lo = Math.min( 0, tfSpline.r(Math.min(minMax[0],minMax[1],minMax[2]))); // 0, or the lowest value in the mesh, whichever the greater
		var hi = Math.max( 1, tfSpline.r(Math.max(minMax[3],minMax[4],minMax[5]))); // 1.0, or the highest value in the mesh, whichever the lesser
		var min = lo - (87.6/1023); // 10% IRE below the 'lo' value
		var max = hi + (175.2/1023); // 20% IRE above 'hi' value
		var dcLo = tfSpline.df(lo);
		var dcHi = tfSpline.df(hi);
		var numLo = Math.pow(min-lo,2);
		var denLo = min-lo;
		var numHi = Math.pow(max-hi,2);
		var denHi = max-hi;
		for (var j=0; j<m; j++) {
			if (R[j] < lo) {
				R[j] = min - (numLo/((dcLo*(R[j]-lo))+denLo));
			} else if (c[j] > hi) {
				R[j] = max - (numHi/((dcHi*(R[j]-hi))+denHi));
			}
			if (G[j] < lo) {
				G[j] = min - (numLo/((dcLo*(G[j]-lo))+denLo));
			} else if (c[j] > hi) {
				G[j] = max - (numHi/((dcHi*(G[j]-hi))+denHi));
			}
			if (B[j] < lo) {
				B[j] = min - (numLo/((dcLo*(B[j]-lo))+denLo));
			} else if (c[j] > hi) {
				B[j] = max - (numHi/((dcHi*(B[j]-hi))+denHi));
			}
		}
		var inputCS = this.inputs.laGamutSelect.options[this.inputs.laGamutSelect.selectedIndex].text.trim();
		var meta =  {
			inputTF: inputTF,
			systemCS: 'Sony S-Gamut3.cine',
			inputCS: inputCS,
			inputEX: !this.legIn,
			nativeTF: this.natTF,
			interpolation: method,
			inputMatrix: inputMatrix
		};
		if (inputTF.indexOf('LogC') !== -1) {
			meta.baseISO = parseInt(this.inputs.cineEI.value);
		}
		this.cs = this.lutMaker.newLUT({
			title: 'Colour Space',
			format: 'cube',
			dims: 3,
			s: dim,
			min: [0,0,0],
			max: [1,1,1],
			C: [R.buffer,G.buffer,B.buffer],
			meta: meta
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
	var meta = d.meta;
	if (typeof d.min === 'undefined') {
		d.min = new Float64Array([0,0,0]);
	}
	if (typeof d.max === 'undefined') {
		d.max = new Float64Array([1,1,1]);
	}
	var details = {
		title: d.title,
		format: d.format,
		dims: d.dims,
		s: d.s,
		min: d.min,
		max: d.max,
		meta: meta
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
//set LUT here
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
// Loading progress bar
if (typeof splash !== 'undefined') {
	splashProg();
}
