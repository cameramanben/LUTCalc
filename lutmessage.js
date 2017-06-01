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
	this.p = 0;
	this.ui[0] = this;
	this.go = false;
	// 0 - LUTMessage
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
	// 13 - twkCS
	// 14 - twkMulti
	// 15 - twkSampler
	// 16 - mobile
	// 17 - twkDisplay
	if (typeof this.inputs.blobWorkers !== 'undefined') {
		this.blobWorkers = this.inputs.blobWorkers;
	} else {
		this.blobWorkers = false;
	}
//		this.blobWorkers = false;
	this.gas = []; // Array of gamma web workers
	this.gaT = 2; // Gamma threads
	this.gaN = 0; // Next web worker to send data to
	this.gaV = 0; // Counter keeping tabs on 'freshness' of returned data
	this.gaU = 0; // Counter keeping tabs on how many of the threads are up-to-date
	this.gaL = 0;
	this.gaPQ = 0;
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
LUTMessage.prototype.setReady = function() {
	this.go = true;
};
// Gamma Message Handling
LUTMessage.prototype.startGaThreads = function() {
	var max = this.gaT;
	var windowURL,workerString,gammaWorkerBlob;
	if (this.blobWorkers) {
		windowURL = window.URL || window.webkitURL;
		workerString = (workerLUTString + workerGammaString).replace('"use strict";', '');
		gammaWorkerBlob = new Blob([ workerString ], { type: 'text/javascript' } );
	}
	for (var i=0; i<max; i++) {
		var _this = this;
		if (this.blobWorkers) {
			try {
				var blobURL = windowURL.createObjectURL(gammaWorkerBlob);
				this.gas[i] = new Worker(blobURL);
//				URL.revokeObjectURL(blobURL);
			} catch (e) { // Fallback for - IE10 and 11
console.log('No Inline Web Workers');
				this.blobWorkers = false;
				this.gas[i] = new Worker('gammaworker.js');
			}
		} else {
			this.gas[i] = new Worker('gammaworker.js');
		}
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
			var windowURL,workerString,gammaWorkerBlob;
			if (this.blobWorkers) {
				windowURL = window.URL || window.webkitURL;
				workerString = (workerLUTString + workerGammaString).replace('"use strict";', '');
				gammaWorkerBlob = new Blob([ workerString ], { type: 'text/javascript' } );
			}
			for (var i=max; i<T; i++) {
				var _this = this;
				if (this.blobWorkers) {
					try {
						var blobURL = windowURL.createObjectURL(gammaWorkerBlob);
						this.gas[i] = new Worker(blobURL);
//						URL.revokeObjectURL(blobURL);
					} catch (e) { // Fallback for - IE10 and 11
						this.blobWorkers = false;
console.log('No Inline Web Workers');
						this.gas[i] = new Worker('gammaworker.js');
					}
				} else {
					this.gas[i] = new Worker('gammaworker.js');
				}
				this.gas[i].onmessage = function(e) {
					_this.gaRx(e.data);
				};
			}
		} else if (T < max) {
			for (var i=T-1; i<max; i++) {
				this.gas[i].terminate();
			}
			this.gas = this.gas.slice(0,T);
			this.gaN = 0;
			this.gaU = 0;
		}
	}
};
LUTMessage.prototype.gaSetParams = function() {
	if (this.go) {
		this.gaV++;
		var d = {
			v: this.gaV,
			inGamma: parseInt(this.inputs.inGamma.options[this.inputs.inGamma.options.selectedIndex].value),
			inLinGamma: parseInt(this.inputs.inLinGamma.options[this.inputs.inLinGamma.options.selectedIndex].value),
			outGamma: parseInt(this.inputs.outGamma.options[this.inputs.outGamma.options.selectedIndex].value),
			outLinGamma: parseInt(this.inputs.outLinGamma.options[this.inputs.outLinGamma.options.selectedIndex].value),

			pqLwIn: parseFloat(this.inputs.inPQLw.value),
			pqLwOut: parseFloat(this.inputs.outPQLw.value),
			pqEOTFLwIn: parseFloat(this.inputs.inPQEOTFLw.value),
			pqEOTFLwOut: parseFloat(this.inputs.outPQEOTFLw.value),
			hlgLwIn: parseFloat(this.inputs.inHLGLw.value),
			hlgLwOut: parseFloat(this.inputs.outHLGLw.value),
			hlgBBCIn: this.inputs.hlgBBCScaleIn[1].checked,
			hlgBBCOut: this.inputs.hlgBBCScaleOut[1].checked,

			defGamma: this.inputs.defGammaIn,
			newISO: parseFloat(this.inputs.cineEI.value),
			natISO: parseFloat(this.inputs.nativeISO.innerHTML),
			camType: parseInt(this.inputs.cameraType.value),
			stopShift: parseFloat(this.inputs.stopShift.value),
			camClip: Math.pow(2,parseFloat(this.inputs.wclip)+parseFloat(this.inputs.stopShift.value))*0.18,
//			clip: this.inputs.clipCheck.checked,
			clipSelect: parseInt(this.inputs.clipSelect.options[this.inputs.clipSelect.selectedIndex].value),
			clipLegal: this.inputs.clipLegalCheck.checked,
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
					this.ui[d.p].setCSInputData(d.o,d.natTF,d.legIn);
					this.gtTx(d.p,2,{
						p:d.p,
						t:d.t,
						v:d.v,
						dim:d.dim,
						gamma:d.gamma,
						gamut:d.gamut
					});
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
					if (this.inputs.isMobile) {
						this.ui[16].updateUI();
					}
					break;
			case 37: // Get Multi Colours
					this.ui[3].multiColours(d);
					break;
			case 38: // Get LUT in to LUT out values for primaries
					this.ui[6].updateRGBChart(d);
					break;
			case 39: // Update PQ LMax level
					this.gaPQ++;
					if (this.gaPQ === this.gaT) {
						this.gaPQ = 0;
						this.gaSetParams();
					}
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
		if (this.inputs.isMobile) {
			this.ui[16].updateUI();
		}
	}
};
LUTMessage.prototype.gotGammaLists = function(d) {
	this.inputs.addInput('gammaLA',d.LA);
	this.inputs.addInput('gammaPQ',d.PQ);
	this.inputs.addInput('gammaHLG',d.HLG);
	this.inputs.addInput('gammaPQOOTF',d.PQOOTF);
	this.inputs.addInput('gammaPQEOTF',d.PQEOTF);
	this.inputs.addInput('gammaHLGOOTF',d.HLGOOTF);
	this.inputs.addInput('gammaInList',d.inList);
	this.inputs.addInput('gammaOutList',d.outList);
	this.inputs.addInput('gammaLinList',d.linList);
	this.inputs.addInput('gammaCatList',d.catList);
	this.inputs.addInput('gammaDisList',d.disList);
	this.inputs.addInput('gammaDisBaseGamuts',d.baseDisGamuts);
	this.inputs.addInput('gammaBaseGamuts',d.baseGamuts);
	this.inputs.addInput('gammaSubNames',d.subNames);
	this.inputs.addInput('gammaDataLevel',d.gammaDat);
	var subLists = [];
	var m = d.subNames.length;
	var allIdx = m-1;
	for (var j=0; j<m; j++) {
		subLists[j] = [];
		if (d.subNames[j] === 'All') {
			allIdx = j;
		}
	}
	m = d.subList.length;
	var m2;
	for (var j=0; j<m; j++) {
		m2 = d.subList[j].length;
		for (var k=0; k<m2; k++) {
			subLists[d.subList[j][k]].push(j);
		}
	}
	subLists[allIdx].length = 0;
	for (var j=0; j<m; j++) {
		subLists[allIdx].push(j);
	}
	this.inputs.addInput('gammaSubLists',subLists);
	this.ui[2].gotGammaLists(); // Gamma Box
	this.ui[3].gotGammaLists(); // Tweaks Box
	this.ui[4].gotGammaLists(); // LUT Box
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
	var windowURL,workerString,csWorkerBlob;
	if (this.blobWorkers) {
		windowURL = window.URL || window.webkitURL;
		workerString = (workerLUTString + workerRingString + workerBrentString + workerCSString).replace('"use strict";', '');
		csWorkerBlob = new Blob([ workerString ], { type: 'text/javascript' } );
	}
	for (var i=0; i<max; i++) {
		var _this = this;
		if (this.blobWorkers) {
			try {
				var blobURL = windowURL.createObjectURL(csWorkerBlob);
				this.gts[i] = new Worker(blobURL);
//				URL.revokeObjectURL(blobURL);
			} catch (e) { // Fallback for - IE10 and 11
console.log('No Inline Web Workers');
				this.blobWorkers = false;
				this.gts[i] = new Worker('colourspaceworker.js');
			}
		} else {
			this.gts[i] = new Worker('colourspaceworker.js');
		}
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
			var windowURL,workerString,csWorkerBlob;
			if (this.blobWorkers) {
				windowURL = window.URL || window.webkitURL;
				workerString = (workerLUTString + workerRingString + workerBrentString + workerCSString).replace('"use strict";', '');
				csWorkerBlob = new Blob([ workerString ], { type: 'text/javascript' } );
			}
			for (var i=max; i<T; i++) {
				var _this = this;
				if (this.blobWorkers) {
					try {
						var blobURL = windowURL.createObjectURL(csWorkerBlob);
						this.gts[i] = new Worker(blobURL);
//						URL.revokeObjectURL(blobURL);
					} catch (e) { // Fallback for - IE10 and 11
						this.blobWorkers = false;
						this.gts[i] = new Worker('colourspaceworker.js');
					}
				} else {
					this.gts[i] = new Worker('colourspaceworker.js');
				}
				this.gts[i].onmessage = function(e) {
					_this.gtRx(e.data);
				};
			}
		} else if (T < max) {
			for (var i=T-1; i<max; i++) {
				this.gts[i].terminate();
			}
			this.gts = this.gts.slice(0,T);
			this.gtN = 0;
			this.gtU = 0;
		}
	}
};
LUTMessage.prototype.gtSetParams = function() {
	if (this.go) {
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
					// console.log(new Float64Array(d.inputMatrix));
					// this.gaTx(d.p,9,d);
					this.ui[d.p].gotInputVals(d.inputMatrix,d.dim);
					break;
			case 23: // Recalculated custom matrix for changed colourspace
					this.ui[d.p].recalcMatrix(d.idx,d.wcs,d.matrix);
					break;
			case 24: // Send Default LUT-based Gamuts from file to Worker
					splashProg(5);
					break;
			case 25: // Get lists of gamuts
					this.loadGamutLUTs();
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
			case 28: // Get Colour Square
					this.ui[d.p].gotColSqr(d.o,d.tIdx);
					break;
			case 29: // Get Multi Colours
					if (d.doGamutLim) {
						if (typeof d.og !== 'undefined') {
							this.gaTx(d.p,17,{o: d.o, hs: d.hs, cb:d.cb, doGamutLim: true, og: d.og, gLimY: d.gLimY, gLimL: d.gLimL, gLimB: d.gLimB, to:['o','hs','og']});
						} else {
							this.gaTx(d.p,17,{o: d.o, hs: d.hs, cb:d.cb, doGamutLim: true, gLimY: d.gLimY, gLimL: d.gLimL, to:['o','hs']});
						}
					} else {
						this.gaTx(d.p,17,{ o: d.o, hs: d.hs, cb:d.cb, doGamutLim: false, to:['o','hs']});
					}
					break;
			case 30: //
					this.gotIOGamutNames(d);
					break;
			case 31: // Get LUT In / LUT Out values for primaries
					if (typeof d.rIn !== 'undefined') {
						this.gaTx(d.p,18,{ rIn:d.rIn, gIn:d.gIn, bIn:d.bIn, rOut:d.rOut, gOut:d.gOut, bOut:d.bOut, cb:d.cb, to:['rIn', 'gIn', 'bIn','rOut','gOut','bOut']});
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
					this.gaTx(3,16,{b:d.b,a:d.a,cb:d.cb,to:['b','a']});
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
		if (this.inputs.isMobile) {
			this.ui[16].updateUI();
		}
	}
};
LUTMessage.prototype.gotGamutLists = function(d) {
	this.inputs.addInput('gamutPass',d.pass);
	this.inputs.addInput('gamutLA',d.LA);
	this.inputs.addInput('gamutInList',d.inList);
	this.inputs.addInput('gamutOutList',d.outList);
	this.inputs.addInput('gamutLAList',d.laList);
	this.inputs.addInput('gamutMatrixList',d.matList);
	this.inputs.addInput('gamutCATList',d.CATList);
	this.inputs.addInput('gamutSubNames',d.subNames);
	var inSubs = [];
	var outSubs = [];
	var laSubs = [];
	var m = d.subNames.length;
	var allIdx = m-1;
	for (var j=0; j<m; j++) {
		inSubs[j] = [];
		outSubs[j] = [];
		laSubs[j] = [];
		if (d.subNames[j] === 'All') {
			allIdx = j;
		}
	}
	m = d.inSub.length;
	var m2;
	for (var j=0; j<m; j++) {
		m2 = d.inSub[j].length;
		for (var k=0; k<m2; k++) {
			inSubs[d.inSub[j][k]].push(j);
		}
	}
	inSubs[allIdx].length = 0;
	for (var j=0; j<m; j++) {
		inSubs[allIdx].push(j);
	}
	m = d.outSub.length;
	var m2;
	for (var j=0; j<m; j++) {
		m2 = d.outSub[j].length;
		for (var k=0; k<m2; k++) {
			outSubs[d.outSub[j][k]].push(j);
		}
	}
	outSubs[allIdx].length = 0;
	for (var j=0; j<m; j++) {
		outSubs[allIdx].push(j);
	}
	m = d.laSub.length;
	var m2;
	for (var j=0; j<m; j++) {
		m2 = d.laSub[j].length;
		for (var k=0; k<m2; k++) {
			laSubs[d.laSub[j][k]].push(j);
		}
	}
	laSubs[allIdx].length = 0;
	for (var j=0; j<m; j++) {
		laSubs[allIdx].push(j);
	}
	this.inputs.addInput('gamutInSubLists',inSubs);
	this.inputs.addInput('gamutOutSubLists',outSubs);
	this.inputs.addInput('gamutLASubLists',laSubs);
	this.ui[2].gotGamutLists(d.pass,d.LA); // Gamma Box
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
	this.gtSetParams();
};
LUTMessage.prototype.updateGammaInList = function() {
	this.ui[2].updateGammaInList(false);
};
LUTMessage.prototype.changeGamma = function() {
	if (this.go) {
		this.ui[4].changeGamma();
		this.gaSetParams();
	}
};
LUTMessage.prototype.updateGammaIn = function() {
	if (this.go) {
		this.ui[11].updateGammaIn();
	}
}
LUTMessage.prototype.updateGammaOut = function() {
	if (this.go) {
		this.ui[11].updateGammaOut();
		this.ui[17].updateGammaOut();
	}
}
LUTMessage.prototype.changeGamut = function() {
	if (this.go) {
		this.ui[3].changeGamut();
		this.gtSetParams();
		this.ui[8].testXY();
	}
};
LUTMessage.prototype.changeFormat = function() {
	this.ui[2].oneOrThree();
	this.ui[3].toggleTweaks();
//	this.ui[8].testXY();
	this.gaSetParams();
	this.gtSetParams();
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
LUTMessage.prototype.checkFormat = function() {
	this.ui[11].updateGammaOut();
};
LUTMessage.prototype.isCustomGamma = function() {
	return this.ui[3].isCustomGamma();
};
LUTMessage.prototype.isCustomGamut = function() {
	return this.ui[3].isCustomGamut();
};
LUTMessage.prototype.displayCLC = function() {
	this.ui[4].displayCLC();
};
LUTMessage.prototype.saved = function(source, success) {
	switch (source) {
		case 0: break; // LALutss or LABins - don't need a further response
		case 1: this.ui[5].saved(success); // LUTs saved using the Generate buttons
				break;
		case 2: break; // RGB Sampler files - don't need a further response
		case 3: break; // Settings files - don't need a further response
		default: break;
	}
};
LUTMessage.prototype.loadGamutLUTs = function() {
	var fileNames = [
		'LC709',
		'LC709A',
		'cpouttungsten',
		'cpoutdaylight',
		'Amira709',
		'AlexaX2',
		'V709',
		'Cine709'
	];
	var m = fileNames.length;
	var isLE;
	if ((new Int8Array(new Int16Array([1]).buffer)[0]) > 0) {
		isLE = true;
	} else {
		isLE = false;
	}
	for (var j=0; j<m; j++) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', fileNames[j] + '.labin', true);
		xhr.responseType = 'arraybuffer';
		xhr.onload = (function(here) {
			return function(e) {
				var buff = this.response;
	  			var lutArr = new Uint8Array(buff);
	  			if (!here.isLE) { // files are little endian, swap if system is big endian
					// console.log('Gamut LUTs: Big Endian System');
	  				var max = Math.round(lutArr.length / 4); // Float32s === 4 bytes
	  				var i,b0,b1,b2,b3;
	  				for (var j=0; j<max; j++) {
	  					i = j*4;
	  					b0=lutArr[ i ];
	  					b1=lutArr[i+1];
	  					b2=lutArr[i+2];
	  					b3=lutArr[i+3];
	  					lutArr[ i ] = b3;
	  					lutArr[i+1] = b2;
	  					lutArr[i+2] = b1;
	  					lutArr[i+3] = b0;
	  				}
	  			}
	  			var in32 = new Int32Array(buff);
	  			var tfS = in32[0];
		  		var dim = in32[1];
	 			var csS = dim*dim*dim;
				// Internal processing is Float64, files are scaled Int32
	 			var C = [	new Float64Array(csS),
	 						new Float64Array(csS),
	 						new Float64Array(csS) ];
	 			for (var j=0; j<csS; j++){
	 				C[0][j] = parseFloat(in32[((2+tfS)) + j])/1073741824;
	 				C[1][j] = parseFloat(in32[((2+tfS+csS)) + j])/1073741824;
	 				C[2][j] = parseFloat(in32[((2+tfS+(2*csS))) + j])/1073741824;
	 			}
				var dataEnd = 2+tfS+(3*csS);
				// get input matrix details (all zeros means no matrix defined)
				var inputMatrix = new Float64Array(9);
				var imM = false;
				if (dataEnd < in32.length) {
					for (var j=0; j<9; j++) {
						if (in32[dataEnd+j] !== 0) {
							imM = true;
							inputMatrix[j] = parseFloat(in32[dataEnd+j])/107374182.4;
						}
					}
					dataEnd += 9;
				}
				if (!imM) {
					inputMatrix = false;
				}
				// look for input matrix, colourspace and transfer function info at the end of the file if present
				var in1DTF = 'S-Log3'; // system default
				var in3DTF = 'S-Log3'; // system default
				var sysCS = 'Sony S-Gamut3.cine'; // system default
				var in3DCS = 'Sony S-Gamut3.cine'; // system default
				var in1DEX = true; // system default
				var in3DEX = true; // system default
				var in1DMin = [0,0,0];
				var in1DMax = [1,1,1];
				var in3DMin = [0,0,0];
				var in3DMax = [1,1,1];
				var interpolation = false;
				var baseISO = false;
				if (dataEnd < in32.length) {
					dataEnd *= 4;
					var fileEnd = lutArr.length;
					var metaString = '';
					for (var j=dataEnd; j<fileEnd; j++) {
						metaString += String.fromCharCode(lutArr[j]).replace('^','γ');
					}
					if (metaString.search('|') >= 0) {
						var meta = metaString.split('|');
						var m = meta.length;
						if (m > 2) {
							for (var j=0; j<m; j +=2) {
								switch (meta[j]) {
									case '1DTF':
										in1DTF = meta[j+1].trim();
										break;
							 		case '1DRG':
							 			if (meta[j+1].toLowerCase() === '100') {
											in1DEX = false;
										}
										break;
							 		case '1DMIN':
										in1DMin[0] = parseFloat(meta[j+1]);
										if (isNaN(in1DMin[0])) {
											in1DMin[0] = 0;
										} else {
											in1DMin[1] = in1DMin[0];
											in1DMin[2] = in1DMin[0];
										}
										break;
							 		case '1DMAX':
										in1DMax[0] = parseFloat(meta[j+1]);
										if (isNaN(in1DMax[0])) {
											in1DMax[0] = 1;
										} else {
											in1DMax[1] = in1DMax[0];
											in1DMax[2] = in1DMax[0];
										}
										break;
							 		case 'SYSCS':
										sysCS = meta[j+1].trim();
										break;
							 		case '3DTF':
							 			in3DTF = meta[j+1].trim();
										break;
							 		case '3DCS':
							 			in3DCS = meta[j+1].trim();
										break;
							 		case '3DRG':
							 			if (meta[j+1].toLowerCase() === '100') {
											in3DEX = false;
										}
										break;
							 		case '3DMIN':
										in3DMin[0] = parseFloat(meta[j+1]);
										if (isNaN(in3DMin[0])) {
											in3DMin[0] = 0;
										} else {
											in3DMin[1] = in3DMin[0];
											in3DMin[2] = in3DMin[0];
										}
										break;
							 		case '3DMAX':
										in3DMax[0] = parseFloat(meta[j+1]);
										if (isNaN(in3DMax[0])) {
											in3DMax[0] = 1;
										} else {
											in3DMax[1] = in3DMax[0];
											in3DMax[2] = in3DMax[0];
										}
										break;
							 		case 'INTERPOLATION':
										switch (meta[j+1].trim().toLowerCase()) {
											case 'tricubic': interpolation = 0;
												break;
											case 'tetrahedral': interpolation = 1;
												break;
											case 'trilinear': interpolation = 2;
												break;
										}
										break;
				 					case 'BASEISO':
				 						if (meta[j+1].trim().toLowerCase() !== 'unknown') {
					 						baseISO = parseInt(meta[j+1].trim());
					 					}
				 						break;
								}
							}			
						} else {
							in1DTF = meta[0].trim();
							in3DCS = meta[1].trim();
						}
					} else {
						in3DCS = metaString;
					}
				}
	  			here.messages.gtTxAll(0, 4, {
					fileName: here.fileName,
					format: 'cube',
					dims: 3,
					s: dim,
					min: in3DMin,
					max: in3DMax,
					C: [ C[0].buffer, C[1].buffer, C[2].buffer ],
					meta: {
						systemCS: sysCS,
						inputTF: in3DTF,
						inputCS: in3DCS,
						inputEX: in3DEX,
						interpolation: interpolation,
						baseISO: baseISO,
						inputMatrix: inputMatrix
					}
				});
			};
		})({
			fileName: fileNames[j],
			isLE: isLE,
			messages: this
		});
		xhr.send();
	}
};
LUTMessage.prototype.takePreviewClick = function(twk) {
	if (twk === 1 && this.ui[12].sample) { // RGB Sampler wants to take charge - check if White Balance needs turning off
		this.ui[12].toggleSample();
	} else if (twk === 0 && this.ui[15].setSample) { // White Balance wants to take charge - check if sampler needs turning off
		this.ui[15].toggleSample();
	}
};
LUTMessage.prototype.previewSample = function(x,y) {
	if (this.ui[12].sample) {
		this.ui[12].previewSample(x,y);
	} else if (this.ui[15].setSample) {
		this.ui[15].previewSample(x,y);
	}
};
LUTMessage.prototype.getSamples = function(gridX,gridY) {
	return this.ui[8].rgbSamples(gridX,gridY);
};
LUTMessage.prototype.mobileOpt = function(opt) {
	this.ui[16].desktopCur(opt);
};
// Loading progress bar
if (typeof splash !== 'undefined') {
	splashProg();
}
