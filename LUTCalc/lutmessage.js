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
	// 9 - twkHG
	// 10 - twkLA
	// 11 - formats
	// 12 - twkWHITE
	this.gas = []; // Array of gamma web workers
	this.gaT = 2; // Gamma threads
	this.gaN = 0; // Next web worker to send data to
	this.gaV = 0; // Counter keeping tabs on 'freshness' of returned data
	this.gaU = 0; // Counter keeping tabs on how many of the threads are up-to-date
	this.gaL = 0;
	this.startGaThreads();
	this.gts = []; // Array of gamma web workers
	this.gtT = 2; // Gamut threads
	this.gtN = 0; // Next web worker to send data to
	this.gtV = 0; // Counter keeping tabs on 'freshness' of returned data
	this.gtU = 0; // Counter keeping tabs on how many of the threads are up-to-date
	this.gtL = 0;
	this.startGtThreads();
}
LUTMessage.prototype.addUI = function(code,ui) {
	this.ui[code] = ui;
};
LUTMessage.prototype.getGammaThreads = function() {
	return this.gaT;
};
LUTMessage.prototype.getGamutThreads = function() {
	return this.gtT;
};
LUTMessage.prototype.getWorker = function() {
	return this.gas[0];
};
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
};
LUTMessage.prototype.stopGaThreads = function() {
	var max = this.gas.length;
	for (var i=0; i<max; i++) {
		this.gas[i].terminate();
	}
	this.gas = [];
};
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
};
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
		isTrans: this.inputs.isTrans
	};
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
	if (typeof this.inputs.bClip !== 'undefined') {
		d.bClip = this.inputs.bClip;
		d.wClip = this.inputs.wClip;
	}
	if (typeof this.inputs.scaleMin.value !== 'undefined') {
		d.scaleMin = parseFloat(this.inputs.scaleMin.value);
		d.scaleMax = parseFloat(this.inputs.scaleMax.value);
	}
	this.ui[3].getTFParams(d);
	var max = this.gas.length;
	for (var i=0; i<max; i++) {
		this.gas[i].postMessage({t: 0, d: d});
	}
};
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
};
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
};
LUTMessage.prototype.gaRx = function(d) {
	if (d.msg) {
		console.log(d.details);
	} else if (d.err) {
		console.log(d.details);
	} else if (d.resend) {
		console.log('Resending gamma - ' + d.t + ' to ' + d.p);
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
					this.gtTx(d.p,2,d);
					break;
			case 23: // RGB input to linear
					this.gtTx(d.p,1,d);
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
						this.ui[10].doneStuff();
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
			case 36: // Get PSST-CDL colours
					this.ui[3].psstColours(d);
					break;
			case 38: // Get LUT in to LUT out values for primaries
					this.ui[6].updateRGBChart(d);
					break;
		}
	}
};
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
};
LUTMessage.prototype.gammaParamsSet = function(d) {
	this.gaU++;
	if (this.gaU === this.gaT) {
		this.gaU = 0;
		this.gtTx(3,16,{});
		this.gtTx(8,15,{});
		this.ui[3].setParams(d);
		this.ui[6].updateGamma();
		this.ui[8].isChanged(d.eiMult);
	}
};
LUTMessage.prototype.gotGammaLists = function(d) {
	this.inputs.addInput('gammaLA',d.LA);
	this.inputs.addInput('gammaInList',d.inList);
	this.inputs.addInput('gammaOutList',d.outList);
	this.inputs.addInput('gammaLinList',d.linList);
	this.inputs.addInput('gammaCatList',d.catList);

	this.ui[2].gotGammaLists(d.inList,d.outList,d.linList); // Gamma Box
	this.ui[3].gotGammaLists(); // Tweaks Box
	this.ui[4].gotGammaLists(d.catList); // LUT Box
	this.gaSetParams();
};
LUTMessage.prototype.gotBaseIRE = function(d) {
	this.ui[3].gotBaseIRE(d.o); // Tweaks Box
	this.ui[5].gotBaseIRE(d.o); // Generate Box
};
LUTMessage.prototype.gotIREs = function(d) {
	this.ui[d.p].gotIREs(d.i,d.o);
};
LUTMessage.prototype.gotIOGammaNames = function(d) {
	this.ui[d.p].gotIOGammaNames(d.o);
};
LUTMessage.prototype.gotChartVals = function(d) {
//	this.gtTx(d.p,11,{ colIn:d.colIn, colOut:d.colOut, eiMult:d.eiMult, to:['colIn','colOut']});
	this.ui[d.p].gotChartVals(d);
};
LUTMessage.prototype.gotHighLevelDefault = function(d) {
	this.ui[3].gotHighLevelDefault(d.rec,d.map);
};
// Gamut Message Handling
LUTMessage.prototype.startGtThreads = function() {
	var max = this.gtT;
	for (var i=0; i<max; i++) {
		var _this = this;
		this.gts[i] = new Worker('colourspace.js');
		this.gts[i].onmessage = function(e) {
			_this.gtRx(e.data);
		};
	}
};
LUTMessage.prototype.stopGtThreads = function() {
	var max = this.gts.length;
	for (var i=0; i<max; i++) {
		this.gts[i].terminate();
	}
	this.gts = [];
};
LUTMessage.prototype.changeGtThreads = function(T) {
	if (typeof T==='number' && (T%1)===0) {
		this.gtT = T;
		var max = this.gts.length;
		if (T > max) {
			for (var i=max; i<T; i++) {
				var _this = this;
				this.gts[i] = new Worker('colourspace.js');
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
};
LUTMessage.prototype.gtSetParams = function() {
	this.gtV++;
	var d = {
		v: this.gtV,
		inGamut: parseInt(this.inputs.inGamut.options[this.inputs.inGamut.selectedIndex].value),
		outGamut: parseInt(this.inputs.outGamut.options[this.inputs.outGamut.selectedIndex].value),
		isTrans: this.inputs.isTrans
	};
	this.ui[3].getCSParams(d);
	var max = this.gts.length;
	for (var i=0; i<max; i++) {
		this.gts[i].postMessage({t: 0, d: d});
	}
};
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
};
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
};
LUTMessage.prototype.gtRx = function(d) {
	if (d.msg) {
		console.log(d.details);
	} else if (d.err) {
		console.log(d.details);
	} else if (d.resend) {
		console.log('Resending gamut - ' + d.t + ' to ' + d.p);
		if (d.t === 1) {
			this.gaTx(d.p,d.t,{R:d.d.R,G:d.d.G,B:d.d.B,vals:d.d.vals,dim:d.d.dim,to:d.d.to});
		} else {
			this.gtTx(d.p,d.t,d.d);
		}
	} else if (d.v === this.gtV || d.t === 37) {
		switch(d.t) {
			case 20: // Set params
					this.gamutParamsSet(d);
					break;
			case 21: // RGB input to output
					this.gaTx(5,4,d);
					break;
			case 22: // RGB S-Gamut3.cine to LA input gamut
					this.gaTx(d.p,9,d);
					break;
			case 25: // Get lists of gamuts
					this.gotGamutLists(d);
					break;
			case 26: // Set LA LUT
					this.gtL++;
					if (this.gtL === this.gtT) {
						this.gtL = 0;
						this.ui[8].isChanged();
					}
					break;
			case 27: // Set LA Title
					break;
			case 30: //
					this.gotIOGamutNames(d);
					break;
			case 31: // Get LUT In / LUT Out values for primaries
					if (typeof d.rIn !== 'undefined') {
						this.gaTx(d.p,18,{ rIn:d.rIn, gIn:d.gIn, bIn:d.bIn, rOut:d.rOut, gOut:d.gOut, bOut:d.bOut, to:['rIn', 'gIn', 'bIn','rOut','gOut','bOut']});
					}
					break;
			case 32: // Get preview colour correction
					this.gaTx(d.p,12,d);
					break;
			case 34: // Get linear / S-Gamut3.cine value for preview image
					this.ui[d.p].preppedPreview(d.o);
					break;
			case 35: // Get primaries of current colour space for preview
					this.gaTx(d.p,15,d);
					break;
			case 36: // Get PSST-CDL colours
					this.gaTx(3,16,{b:d.b,a:d.a,to:['b','a']});
					break;
			case 37: // Get Chromatic Adaptation Transform options
					this.ui[3].gotCATs(d.o);
					break;
			case 38: // Get CCT and Dxy for white point dropper
					this.ui[12].gotPreCCTDuv(d);
					break;
			case 39: // Calculate primaries and white point for current output
					this.ui[8].updateXY(d.xy);
					break;
		}
	}
};
LUTMessage.prototype.gamutParamsSet = function(d) {
	this.gtU++;
	if (this.gtU === this.gtT) {
		this.gtU = 0;
		this.gtTx(3,16,{});
		this.gtTx(8,15,{});
		this.ui[3].setParams(d);
//		this.ui[6].updateGamma();
		this.ui[8].isChanged();
		this.ui[8].testXY();
	}
};
LUTMessage.prototype.gotGamutLists = function(d) {
	this.inputs.addInput('gamutPass',d.pass);
	this.inputs.addInput('gamutLA',d.LA);
	this.inputs.addInput('gamutInList',d.inList);
	this.inputs.addInput('gamutOutList',d.outList);
	this.inputs.addInput('gamutLAList',d.laList);
	this.ui[2].gotGamutLists(d.inList,d.outList,d.pass,d.LA); // Gamma Box
	this.ui[3].gotGamutLists(); // Tweaks Box
	this.gtSetParams();
};
LUTMessage.prototype.gotIOGamutNames = function(d) {
	this.ui[d.p].gotIOGamutNames(d.inName,d.outName,d.hgName);
};
// Get Info For LUT Generation
LUTMessage.prototype.getInfo = function(info) {
	info.version = this.inputs.version;
	info.date = this.inputs.date;
	this.ui[4].getInfo(info); // LUT Box (Dimensions, MLUTs, etc..)
	this.ui[1].getInfo(info); // Camera Box (Stop Correction)
	this.ui[2].getInfo(info); // Gamma Box (Gamma In / Out, Gamut In / Out)
	this.ui[3].getInfo(info); // Tweaks Box - notes for in the LUT file
};
// Inter-object messages
LUTMessage.prototype.changeCamera = function() {
	this.ui[2].defaultGam();
	this.gaSetParams();
	this.ui[4].changeGamma();
};
LUTMessage.prototype.changeGamma = function() {
	this.ui[4].changeGamma();
	this.gaSetParams();
};
LUTMessage.prototype.changeFormat = function() {
	this.ui[2].oneOrThree();
	this.ui[3].toggleTweaks();
	this.gaSetParams();
};
LUTMessage.prototype.oneOrThree = function() {
		this.ui[11].oneOrThree();
		this.ui[2].oneOrThree();
		this.ui[3].toggleTweaks();
		this.gtSetParams();
		this.gaSetParams();
};
LUTMessage.prototype.showPreview = function() {
	this.ui[3].toggleTweaks();
};
LUTMessage.prototype.getPreCCTDuv = function(xcoord,ycoord) {
	var rgb = this.ui[8].getCanVal(xcoord, ycoord);
	this.gtTx(12,18,{rgb: rgb.buffer, to:['rgb']});
};
LUTMessage.prototype.getSettings = function() {
	var data = {};
	data.version = this.inputs.version;
	this.ui[1].getSettings(data);
	this.ui[2].getSettings(data);
	this.ui[3].getSettings(data);
	this.ui[11].getSettings(data);
	this.ui[4].getSettings(data);
	return JSON.stringify(data,null,"\t");
};
LUTMessage.prototype.setSettings = function() {
	var data = JSON.parse(this.inputs.settingsData.text.join(''));
	this.ui[1].setSettings(data);
	this.ui[2].setSettings(data);
	this.ui[3].setSettings(data);
	this.ui[11].setSettings(data);
	this.ui[4].setSettings(data);
	this.gtSetParams();
	this.gaSetParams();
};
