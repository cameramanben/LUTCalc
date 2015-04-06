/* lutmessage.js
* messaging object between UI and calculations / web workers for LUTCalc Web App.
* 28th December 2014
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function LUTMessage(inputs) {
	this.inputs = inputs;
	this.ui = []; // Links to UI objects for function returns
	this.ui[0] = this;
	// 1 - camerabox
	// 2 - gammabox
	// 3 - tweaksbox
	// 4 - lutbox
	// 5 - generatebox
	// 6 - infobox
	// 7 - LUTAnalyst
	// 8 - preview
	this.gas = []; // Array of gamma web workers
	this.gaT = 2; // Gamma threads
	this.gaN = 0; // Next web worker to send data to
	this.gaV = 0; // Counter keeping tabs on 'freshness' of returned data
	this.gaU = 0; // Counter keeping tabs on how many of the threads are up-to-date
	this.gaL = 0;
	this.startGaThreads();
	this.gts = []; // Array of gamma web workers
	this.gtT = 2; // Gamma threads
	this.gtN = 0; // Next web worker to send data to
	this.gtV = 0; // Counter keeping tabs on 'freshness' of returned data
	this.gtU = 0; // Counter keeping tabs on how many of the threads are up-to-date
	this.gtL = 0;
	this.startGtThreads();
}
LUTMessage.prototype.addUI = function(code,ui) {
	this.ui[code] = ui;
}
LUTMessage.prototype.getGammaThreads = function() {
	return this.gaT;
}
LUTMessage.prototype.getGamutThreads = function() {
	return this.gtT;
}
LUTMessage.prototype.getWorker = function() {
	return this.gas[0];
}
// Gamma Message Handling
LUTMessage.prototype.startGaThreads = function() {
	var max = this.gaT;
	for (var i=0; i<max; i++) {
		var _this = this;
		this.gas[i] = new Worker('gamma.js');
		this.gas[i].onmessage = function(e) {
			_this.gaRx(e.data);
		};
	}
}
LUTMessage.prototype.stopGaThreads = function() {
	var max = this.gas.length;
	for (var i=0; i<max; i++) {
		this.gas[i].terminate();
	}
	this.gas = [];
}
LUTMessage.prototype.changeGaThreads = function(T) {
	if (typeof T==='number' && (T%1)===0) {
		this.gaT = T;
		var max = this.gas.length;
		if (T > max) {
			for (var i=max; i<T; i++) {
				var _this = this;
				this.gas[i] = new Worker('gamma.js');
				this.gas[i].onmessage = function(e) {
					_this.gaRx(e.data);
				};
			}
		} else if (T < max) {
			for (var i=T-1; i<max; i++) {
				this.gas[i].terminate();
			}
			this.gas.slice(0,T);
		}
	}
}
LUTMessage.prototype.gaSetParams = function() {
	this.gaV++;
	var d = {
		v: this.gaV,
		inGamma: parseInt(this.inputs.inGamma.options[this.inputs.inGamma.options.selectedIndex].value),
		inLinGamma: parseInt(this.inputs.inLinGamma.options[this.inputs.inLinGamma.options.selectedIndex].value),
		outGamma: parseInt(this.inputs.outGamma.options[this.inputs.outGamma.options.selectedIndex].value),
		outLinGamma: parseInt(this.inputs.outLinGamma.options[this.inputs.outLinGamma.options.selectedIndex].value),
		defGamma: this.inputs.defGammaIn,
		newISO: parseFloat(this.inputs.cineEI.value),
		natISO: parseFloat(this.inputs.nativeISO.innerHTML),
		camType: parseInt(this.inputs.cameraType.value),
		stopShift: parseFloat(this.inputs.stopShift.value),
		clip: this.inputs.clipCheck.checked,
		mlut: this.inputs.mlutCheck.checked,
		isTrans: this.inputs.isTrans
	};
	if (this.inputs.tweaks.checked) {
		d.tweaks = true;
	} else {
		d.tweaks = false;
	}
	if (this.inputs.tweakBlkCheck.checked) {
		d.blackTweak = true;
	} else {
		d.blackTweak = false;
	}
	if (this.inputs.tweakHiCheck.checked) {
		d.highTweak = true;
	} else {
		d.highTweak = false;
	}
	var blackLevel = parseFloat(this.inputs.tweakBlk.value);
	if (!isNaN(blackLevel)) {
		d.blackLevel = blackLevel/100;
	}
	var highRef = parseFloat(this.inputs.tweakHiRef.value);
	if (!isNaN(highRef)) {
		d.highRef = highRef/100;
	}
	var highMap = parseFloat(this.inputs.tweakHiMap.value);
	if (!isNaN(highMap)) {
		d.highMap = highMap/100;
	}
	if (this.inputs.tweakCDLCheck.checked) {
		d.doASC = true;
		var ascCDL = new Float64Array([
			parseFloat(this.inputs.tweakCDLRSVal.value),
			parseFloat(this.inputs.tweakCDLGSVal.value),
			parseFloat(this.inputs.tweakCDLBSVal.value),
			parseFloat(this.inputs.tweakCDLROVal.value),
			parseFloat(this.inputs.tweakCDLGOVal.value),
			parseFloat(this.inputs.tweakCDLBOVal.value),
			parseFloat(this.inputs.tweakCDLRPVal.value),
			parseFloat(this.inputs.tweakCDLGPVal.value),
			parseFloat(this.inputs.tweakCDLBPVal.value),
			parseFloat(this.inputs.tweakCDLSatVal.value)
		]);
		d.ascCDL = ascCDL.buffer;
	} else {
		d.doASC = false;
	}
	if (this.inputs.inRange[0].checked) {
		d.inL = true;
	} else {
		d.inL = false;
	}
	if (this.inputs.outRange[0].checked) {
		d.outL = true;
	} else {
		d.outL = false;
	}
	var max = this.gas.length;
	for (var i=0; i<max; i++) {
		this.gas[i].postMessage({t: 0, d: d});
	}
}
LUTMessage.prototype.gaTx = function(p,t,d) { // parent (sender), type, data
	if (typeof p !== 'undefined') {
		if (this.inputs.isTrans && d !== null && typeof d.to !== 'undefined') {
			var max = d.to.length;
			var objArray = [];
			for (var j=0; j < max; j++) {
				objArray.push(d[d.to[j]]);
			}
			this.gas[this.gaN].postMessage({p: p, t: t, v: this.gaV, d: d},objArray);
			this.gaN = (this.gaN + 1) % this.gaT;
		} else {
			this.gas[this.gaN].postMessage({p: p, t: t, v: this.gaV, d: d});
			this.gaN = (this.gaN + 1) % this.gaT;
		}
	}
}
LUTMessage.prototype.gaTxAll = function(p,t,d) { // parent (sender), type, data
	if (typeof p !== 'undefined') {
		if (this.inputs.isTrans && d !== null && typeof d.to !== 'undefined') {
			var max = d.to.length;
			var objArray = [];
			for (var j=0; j < max; j++) {
				objArray.push(d[d.to[j]]);
			}
			max = this.gas.length;
			for (var j=0; j<max; j++) {
				this.gas[j].postMessage({p: p, t: t, v: this.gaV, d: d}, objArray);
			}
		} else {
			var max = this.gas.length;
			for (var j=0; j<max; j++) {
				this.gas[j].postMessage({p: p, t: t, v: this.gaV, d: d});
			}
		}
	}
}
LUTMessage.prototype.gaRx = function(d) {
	if (d.msg) {
		console.log(d.details);
	} else if (d.err) {
		console.log(d.details);
	} else if (d.resend) {
console.log('Resending - ' + d.t + ' (Old Parameters) to ' + d.p);
		this.gaTx(d.p,d.t,d.d);
	} else if (d.v === this.gaV) {
		switch(d.t) {
			case 20: // Set Parameters
					this.gammaParamsSet(d);
					break;
			case 21: // 1D input to output
					this.ui[5].got1D(d);
					break;
			case 22: // LUTAnalyst SL3 input to linear
					this.gtTx(d.p,2,d)
					break;
			case 23: // RGB input to linear
					this.gtTx(d.p,1,d)
					break;
			case 24: // RGB linear to output
					this.ui[5].got3D(d);
					break;
			case 25: // Get lists of gammas
					this.gotGammaLists(d);
					break;
			case 26: // Set LA LUT
					this.gaL++;
					if (this.gaL === this.gaT) {
						this.gaL = 0;
						this.ui[3].lutAnalystDone();
						this.ui[6].updateGamma();
					}
					break;
			case 27: // Set LA Title
					break;
			case 28: // LUTAnalyst SLog3 data value from given transfer function
					this.ui[d.p].gotInputVals(d.o,d.dim);
					break;
			case 29: // LUTAnalyst Slog3/S-Gamut3.cine values to LUT input colourspace
					this.ui[d.p].gotInputVals(d.o,d.dim);
					break;
			case 30: // Get IRE values for output from a list of linear values
					this.gotIOGammaNames(d);
					break;
			case 31: // Get IRE values for output from a list of linear values
					this.gotChartVals(d);
					break;
			case 32: // Get 8-bit corrected values for preview image
					this.ui[d.p].gotLine(d);
					break;
			case 34: // Get linear / S-Gamut3.cine value for preview image
					this.gtTx(d.p,14,d);
					break;
			case 35: // Get primaries of current colour space for preview
					this.ui[d.p].updatePrimaries(d.o);
					break;
		}
	} else {
		console.log('Resending - ' + (d.t-20) + ' (Problem) for ' + d.p);
		this.gaTx(d.p,d.t - 20,d);
	}
}
LUTMessage.prototype.showArray = function(o,dim) {
	var temp = new Float64Array(o);
	var max = Math.round(temp.length/3);
	var R = new Float64Array(max);
	var G = new Float64Array(max);
	var B = new Float64Array(max);
	for (var j=0; j<max; j++) {
		R[j] = temp[j*3];
		G[j] = temp[(j*3)+1];
		B[j] = temp[(j*3)+2];
	}
	console.log(max);
	console.log(R);
	console.log(G);
	console.log(B);
}
LUTMessage.prototype.gammaParamsSet = function(d) {
	this.gaU++;
	if (this.gaU === this.gaT) {
		this.gaU = 0;
		this.gtTx(8,15,d);
		this.ui[3].blackHigh(d.blackDef,d.blackLevel,d.highRef,d.highDef,d.highMap,d.high709,d.changedGamma);
		this.ui[6].updateGamma();
		this.ui[8].isChanged(d.eiMult);
	}
}
LUTMessage.prototype.gotGammaLists = function(d) {
	this.ui[2].gotGammaLists(d.inList,d.outList,d.linList); // Gamma Box
	this.ui[3].gotGammaLists(d.inList,d.outList,d.linList,d.catList,d.LA); // Tweaks Box
	this.ui[4].gotGammaLists(d.catList); // LUT Box
	this.ui[3].toggleTweakCheck();
	this.gaSetParams();
}
LUTMessage.prototype.gotBaseIRE = function(d) {
	this.ui[3].gotBaseIRE(d.o); // Tweaks Box
	this.ui[5].gotBaseIRE(d.o); // Generate Box
}
LUTMessage.prototype.gotIREs = function(d) {
	this.ui[d.p].gotIREs(d.i,d.o);
}
LUTMessage.prototype.gotIOGammaNames = function(d) {
	this.ui[d.p].gotIOGammaNames(d.o);
}
LUTMessage.prototype.gotChartVals = function(d) {
	this.ui[d.p].gotChartVals(d);
}
LUTMessage.prototype.gotHighLevelDefault = function(d) {
	this.ui[3].gotHighLevelDefault(d.rec,d.map);
}
// Gamut Message Handling
LUTMessage.prototype.startGtThreads = function() {
	var max = this.gtT;
	for (var i=0; i<max; i++) {
		var _this = this;
		this.gts[i] = new Worker('gamut.js');
		this.gts[i].onmessage = function(e) {
			_this.gtRx(e.data);
		};
	}
}
LUTMessage.prototype.stopGtThreads = function() {
	var max = this.gts.length;
	for (var i=0; i<max; i++) {
		this.gts[i].terminate();
	}
	this.gts = [];
}
LUTMessage.prototype.changeGtThreads = function(T) {
	if (typeof T==='number' && (T%1)===0) {
		this.gtT = T;
		var max = this.gts.length;
		if (T > max) {
			for (var i=max; i<T; i++) {
				var _this = this;
				this.gts[i] = new Worker('gamut.js');
				this.gts[i].onmessage = function(e) {
					_this.gtRx(e.data);
				};
			}
		} else if (T < max) {
			for (var i=T-1; i<max; i++) {
				this.gts[i].terminate();
			}
			this.gts.slice(0,T);
		}
	}
}
LUTMessage.prototype.gtSetParams = function() {
	this.gtV++;
	var d = {
		v: this.gtV,
		inGamut: parseInt(this.inputs.inGamut.options[this.inputs.inGamut.selectedIndex].value),
		outGamut: parseInt(this.inputs.outGamut.options[this.inputs.outGamut.selectedIndex].value),
		hgGamut: parseInt(this.inputs.tweakHGSelect.options[this.inputs.tweakHGSelect.selectedIndex].value),
		hgLowStop: parseFloat(this.inputs.tweakHGLow.value),
		hgHighStop: parseFloat(this.inputs.tweakHGHigh.value),
		baseTemp: parseInt(this.inputs.tweakTempBase.value),
		newTemp: parseInt(this.inputs.tweakTempNew.value),
		greenTemp: parseInt(this.inputs.tweakGreenTemp.value),
		greenMag: parseFloat(this.inputs.tweakGreenPMSlider.value),
		isTrans: this.inputs.isTrans
	};
	if (this.inputs.tweaks.checked) {
		d.tweaks = true;
	} else {
		d.tweaks = false;
	}
	if (this.inputs.tweakHGCheck.checked) {
		d.doHG = true;
	} else {
		d.doHG = false;
	}
	if (this.inputs.tweakHGLinLog[0].checked) {
		d.hgLin = true;
	} else {
		d.hgLin = false;
	}
	if (this.inputs.tweakTempCheck.checked) {
		d.doTemp = true;
		d.CAT = parseInt(this.inputs.tweakTempCATSelect.options[this.inputs.tweakTempCATSelect.selectedIndex].value);
	} else {
		d.doTemp = false;
	}
	if (this.inputs.tweakGreenCheck.checked) {
		d.doGreen = true;
		d.greenCAT = parseInt(this.inputs.tweakGreenCATSelect.options[this.inputs.tweakGreenCATSelect.selectedIndex].value);
	} else {
		d.doGreen = false;
	}
	if (this.inputs.tweakCDLCheck.checked) {
		d.doASC = true;
		var ascCDL = new Float64Array([
			parseFloat(this.inputs.tweakCDLRSVal.value),
			parseFloat(this.inputs.tweakCDLGSVal.value),
			parseFloat(this.inputs.tweakCDLBSVal.value),
			parseFloat(this.inputs.tweakCDLROVal.value),
			parseFloat(this.inputs.tweakCDLGOVal.value),
			parseFloat(this.inputs.tweakCDLBOVal.value),
			parseFloat(this.inputs.tweakCDLRPVal.value),
			parseFloat(this.inputs.tweakCDLGPVal.value),
			parseFloat(this.inputs.tweakCDLBPVal.value),
			parseFloat(this.inputs.tweakCDLSatVal.value)
		]);
		d.ascCDL = ascCDL.buffer;
	} else {
		d.doASC = false;
	}
	if (this.inputs.tweakFCCheck.checked) {
		d.doFC = true;
		d.fcChecks = [
			this.inputs.tweakFCPurpleCheck.checked,
			this.inputs.tweakFCBlueCheck.checked,
			this.inputs.tweakFCGreenCheck.checked,
			this.inputs.tweakFCPinkCheck.checked,
			this.inputs.tweakFCOrangeCheck.checked,
			this.inputs.tweakFCYellowCheck.checked,
			this.inputs.tweakFCRedCheck.checked
		];
		d.fcBlue = parseFloat(this.inputs.tweakFCBlueWidth.value);
		d.fcYellow = parseFloat(this.inputs.tweakFCYellowWidth.value);
	} else {
		d.doFC = false;
	}
	var max = this.gts.length;
	for (var i=0; i<max; i++) {
		this.gts[i].postMessage({t: 0, d: d});
	}
}
LUTMessage.prototype.gtTx = function(p,t,d) { // parent (sender), type, data
	if (typeof p !== 'undefined') {
		if (this.inputs.isTrans && d !== null && typeof d.to !== 'undefined') {
			var max = d.to.length;
			var objArray = [];
			for (var j=0; j < max; j++) {
				objArray.push(d[d.to[j]]);
			}
			this.gts[this.gtN].postMessage({p: p, t: t, v: this.gtV, d: d}, objArray);
			this.gtN = (this.gtN + 1) % this.gtT;
		} else {
			this.gts[this.gtN].postMessage({p: p, t: t, v: this.gtV, d: d});
			this.gtN = (this.gtN + 1) % this.gtT;
		}
	}
}
LUTMessage.prototype.gtTxAll = function(p,t,d) { // parent (sender), type, data
	if (typeof p !== 'undefined') {
		if (this.inputs.isTrans && d !== null && typeof d.to !== 'undefined') {
			var max = d.to.length;
			var objArray = [];
			for (var j=0; j < max; j++) {
				objArray.push(d[d.to[j]]);
			}
			max = this.gts.length;
			for (var j=0; j<max; j++) {
				this.gts[j].postMessage({p: p, t: t, v: this.gtV, d: d}, objArray);
			}
		} else {
			var max = this.gts.length;
			for (var j=0; j<max; j++) {
				this.gts[j].postMessage({p: p, t: t, v: this.gtV, d: d});
			}
		}
	}
}
LUTMessage.prototype.gtRx = function(d) {
	if (d.msg) {
		console.log(d.details);
	} else if (d.err) {
		console.log(d.details);
	} else if (d.resend) {
console.log('Resending - ' + d.t);
		if (d.t === 1) {
			this.gaTx(d.p,d.t,{R:d.d.R,G:d.d.G,B:d.d.B,vals:d.d.vals,dim:d.d.dim});
		} else {
			this.gtTx(d.p,d.t,d.d);
		}
	} else if (d.v === this.gtV) {
		switch(d.t) {
			case 20: // Set params
					this.gamutParamsSet(d);
					break;
			case 21: // RGB input to output
					this.gaTx(5,4,d)
					break;
			case 22: // RGB S-Gamut3.cine to LA input gamut
					this.gaTx(d.p,9,d)
					break;
			case 25: // Get lists of gamuts
					this.gotGamutLists(d);
					break;
			case 26: // Set LA LUT
					this.gtL++;
					if (this.gtL === this.gtT) {
						this.gtL = 0;
					}
					break;
			case 27: // Set LA Title
					break;
			case 30: //
					this.gotIOGamutNames(d);
					break;
			case 31: // Get Chromatic Adaptation Transform options
					this.ui[3].gotCATs(d.o[0]);
					this.ui[3].gotGreenCATs(d.o[1]);
					break;
			case 32: // Get preview colour correction
					this.gaTx(d.p,12,d)
					break;
			case 34: // Get linear / S-Gamut3.cine value for preview image
					this.ui[d.p].preppedPreview(d.o);
					break;
			case 35: // Get primaries of current colour space for preview
					this.gaTx(d.p,15,d)
					break;
		}
	} else {
console.log('Resending - ' + (d.t-20));
		this.gtTx(d.p,d.t - 20,d);
	}
}
LUTMessage.prototype.gamutParamsSet = function(d) {
	this.gtU++;
	if (this.gtU === this.gtT) {
		this.gtU = 0;
		this.gtTx(8,15,d);
		this.ui[8].isChanged();
	}
}
LUTMessage.prototype.gotGamutLists = function(d) {
	this.ui[2].gotGamutLists(d.inList,d.outList,d.pass,d.LA); // Gamma Box
	this.ui[3].gotGamutLists(d.laList,d.outList,d.pass,d.LA); // Tweaks Box
	this.gtSetParams();
}
LUTMessage.prototype.gotIOGamutNames = function(d) {
	this.ui[d.p].gotIOGamutNames(d.inName,d.outName,d.hgName);
}
