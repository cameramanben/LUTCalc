/* twk-psstcdl.js
* Primary / Secondary / Skin Tone CDL object for the LUTCalc Web App.
* 10th April 2015
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function TWKPSSTCDL(tweaksBox, inputs, messages) {
	this.tweaksBox = tweaksBox;
	this.inputs = inputs;
	this.messages = messages;
	this.io();
	this.ui();
}
TWKPSSTCDL.prototype.io = function() {
	// Tweak Checkbox
	this.tweakCheck = document.createElement('input');
	this.tweakCheck.setAttribute('type','checkbox');
	this.tweakCheck.className = 'twk-checkbox';
	this.tweakCheck.checked = false;

	// Base Controls / Refinement Radio Boxes
	this.basRef = [];
	this.basRef[0] = this.createRadioElement('basRefOpt',true);
	this.basRef[1] = this.createRadioElement('basRefOpt',false);
	// Colour Channel Selector
	this.channelSelect = document.createElement('select');
	this.channelSelect.className = 'twk-select';
	this.channelList();
	// SOP Arrays
	this.bS = [];
	var cS = [];
	var satS = [];
	var sS = [];
	var oS = [];
	var pS = [];
	for (var j=0; j<7; j++) {
		cS[j] = new lutSlider({
			min: -3.5,
			max: 3.5,
			value: 0,
			step: 0.01,
			title: false,
			lhs: 'Colour',
			minLabel: false,
			maxLabel: false,
			input: 'number',
			reset: true,
			resetAll: true
		});
		satS[j] = new lutSlider({
			min: 0,
			max: 2,
			value: 1,
			step: 0.01,
			title: false,
			lhs: 'Saturation',
			minLabel: false,
			maxLabel: false,
			input: 'number',
			inputLim: false,
			reset: true,
			resetAll: true
		});
		sS[j] = new lutSlider({
			min: 0,
			mid: 1,
			max: 10,
			value: 1,
			step: 0.01,
			title: false,
			lhs: 'Slope',
			minLabel: false,
			maxLabel: false,
			input: 'number',
			inputLim: false,
			reset: true,
			resetAll: true
		});
		oS[j] = new lutSlider({
			min: -0.5,
			max: 0.5,
			value: 0,
			step: 0.01,
			title: false,
			lhs: 'Offset',
			minLabel: false,
			maxLabel: false,
			input: 'number',
			inputLim: false,
			reset: true,
			resetAll: true
		});
		pS[j] = new lutSlider({
			min: 0,
			mid: 1,
			max: 10,
			value: 1,
			step: 0.01,
			title: false,
			lhs: 'Power',
			minLabel: false,
			maxLabel: false,
			input: 'number',
			inputLim: false,
			reset: true,
			resetAll: true
		});
	}
	this.bS[0] = cS;
	this.bS[1] = satS;
	this.bS[2] = sS;
	this.bS[3] = oS;
	this.bS[4] = pS;
	// Refined Data
	this.initVals();
	// Refining Sliders
	this.rSelect = document.createElement('select');
	this.rSelect.className = 'twk-select';
	this.refineList();

	var cSs = [];
	var satSs = [];
	var sSs = [];
	var oSs = [];
	var pSs = [];
	var cLs = [];
	var satLs = [];
	var sLs = [];
	var oLs = [];
	var pLs = [];
	for (var j=0; j<28; j++) {
		cLs[j] = document.createElement('input');
		cLs[j].setAttribute('type','checkbox');
		cLs[j].className = 'twk-tinycheck';
		satLs[j] = document.createElement('input');
		satLs[j].setAttribute('type','checkbox');
		satLs[j].className = 'twk-tinycheck';
		sLs[j] = document.createElement('input');
		sLs[j].setAttribute('type','checkbox');
		sLs[j].className = 'twk-tinycheck';
		oLs[j] = document.createElement('input');
		oLs[j].setAttribute('type','checkbox');
		oLs[j].className = 'twk-tinycheck';
		pLs[j] = document.createElement('input');
		pLs[j].setAttribute('type','checkbox');
		pLs[j].className = 'twk-tinycheck';
		if (j%4 === 0) {
			cSs[j] = new lutSlider({
			min: -3.5,
			max: 3.5,
			value: 0,
			step: 0.01,
			style: 'slider-bare-red',
			v: true
		});
			satSs[j] = new lutSlider({
			min: 0,
			max: 2,
			value: 1,
			step: 0.01,
			style: 'slider-bare-red',
			v: true
		});
			sSs[j] = new lutSlider({
			min: 0,
			mid: 1,
			max: 10,
			value: 1,
			step: 0.01,
			style: 'slider-bare-red',
			v: true
		});
			oSs[j] = new lutSlider({
			min: -0.5,
			max: 0.5,
			value: 0,
			step: 0.01,
			style: 'slider-bare-red',
			v: true
		});
			pSs[j] = new lutSlider({
			min: 0,
			mid: 1,
			max: 10,
			value: 1,
			step: 0.01,
			style: 'slider-bare-red',
			v: true
		});
			cLs[j].checked = true;
			cLs[j].disabled = true;
			satLs[j].checked = true;
			satLs[j].disabled = true;
			sLs[j].checked = true;
			sLs[j].disabled = true;
			oLs[j].checked = true;
			oLs[j].disabled = true;
			pLs[j].checked = true;
			pLs[j].disabled = true;
		} else {
			cSs[j] = new lutSlider({
			min: -3.5,
			max: 3.5,
			value: 0,
			step: 0.01,
			style: 'slider-bare',
			v: true
		});
			satSs[j] = new lutSlider({
			min: 0,
			max: 2,
			value: 1,
			step: 0.01,
			style: 'slider-bare',
			v: true
		});
			sSs[j] = new lutSlider({
			min: 0,
			mid: 1,
			max: 10,
			value: 1,
			step: 0.01,
			style: 'slider-bare',
			v: true
		});
			oSs[j] = new lutSlider({
			min: -0.5,
			max: 0.5,
			value: 0,
			step: 0.01,
			style: 'slider-bare',
			v: true
		});
			pSs[j] = new lutSlider({
			min: 0,
			mid: 1,
			max: 10,
			value: 1,
			step: 0.01,
			style: 'slider-bare',
			v: true
		});
			cLs[j].checked = false;
			satLs[j].checked = false;
			sLs[j].checked = false;
			oLs[j].checked = false;
			pLs[j].checked = false;
		}
	}
	this.rSs = [];
	this.rSs[0] = cSs;
	this.rSs[1] = satSs;
	this.rSs[2] = sSs;
	this.rSs[3] = oSs;
	this.rSs[4] = pSs;
	this.rLs = [];
	this.rLs[0] = cLs;
	this.rLs[1] = satLs;
	this.rLs[2] = sLs;
	this.rLs[3] = oLs;
	this.rLs[4] = pLs;
	this.rR =[];
	for (var j=0; j<5; j++) {
		this.rR[j] = document.createElement('input');
		this.rR[j].setAttribute('type','button');
		this.rR[j].setAttribute('value','Reset');
	}


	this.rLock = [];
	for (var j=0; j<28; j++) {
		this.rLock[j] = document.createElement('input');
		this.rLock[j].setAttribute('type','checkbox');
		this.rLock[j].className = 'twk-tinycheck';
		if (j%4 === 0) {
			this.rLock[j].checked = true;
			this.rLock[j].disabled = true;
		} else {
			this.rLock[j].checked = false;
		}
	}
	// Advanced Options Checkbox
	this.advancedCheck = document.createElement('input');
	this.advancedCheck.setAttribute('type','checkbox');
	this.advancedCheck.className = 'twk-checkbox';
	this.advancedCheck.checked = false;
	// Chroma Scale Checkbox
	this.chromaScaleCheck = document.createElement('input');
	this.chromaScaleCheck.setAttribute('type','checkbox');
	this.chromaScaleCheck.className = 'twk-checkbox';
	this.chromaScaleCheck.checked = true;
	// Luma Scale Checkbox
	this.lumaScaleCheck = document.createElement('input');
	this.lumaScaleCheck.setAttribute('type','checkbox');
	this.lumaScaleCheck.className = 'twk-checkbox';
	this.lumaScaleCheck.checked = false;
};
TWKPSSTCDL.prototype.ui = function() {
	// General Tweak Holder (Including Checkbox)
	this.holder = document.createElement('div');
	this.holder.className = 'tweakholder-hide';
	this.tweaksBox.appendChild(this.holder);
	this.holder.appendChild(document.createElement('label').appendChild(document.createTextNode('PSST-CDL')));
	this.holder.appendChild(this.tweakCheck);
	// Tweak Box - Inputs Which Appear When the Tweak Checkbox Is Ticked
	this.box = document.createElement('div');
	this.box.className = 'tweak-hide';
	// Advanced Box - Holds Advanced Or Experimental Inputs
	this.advancedBox = document.createElement('div');
	this.advancedBox.className = 'twk-advanced-hide';

// Tweak - Specific UI Elements
	// Base Controls / Refinement Radio Boxes
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Base Adjustments')));
	this.box.appendChild(this.basRef[0]);
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Refinements')));
	this.box.appendChild(this.basRef[1]);
	// Base Controls Box
	this.baseBox = document.createElement('div');
	this.baseBox.className = 'twk-tab';
	// Channel Selector
	this.baseBox.appendChild(this.channelSelect);
	this.baseBox.appendChild(document.createElement('br'));
	// SOP Boxes
	this.cssop = [];
	this.beforeBar1 = [];
	this.afterBar = [];
	this.beforeBar2 = [];
	for (var j=0; j<7; j++) {
		this.cssop[j] = document.createElement('div');
		if (j === this.channelSelect.options.selectedIndex) {
			this.cssop[j].className = 'twk-tab';
		} else {
			this.cssop[j].className = 'twk-tab-hide';
		}
		this.beforeBar1[j] = document.createElement('div');
		this.beforeBar1[j].className = 'twk-psst-colour-bars-s-h';
		this.cssop[j].appendChild(this.beforeBar1[j]);
		this.afterBar[j] = document.createElement('div');
		this.afterBar[j].className = 'twk-psst-colour-bars-l-h';
		this.cssop[j].appendChild(this.afterBar[j]);
		this.beforeBar2[j] = document.createElement('div');
		this.beforeBar2[j].className = 'twk-psst-colour-bars-s-h';
		this.cssop[j].appendChild(this.beforeBar2[j]);
		this.cssop[j].appendChild(document.createElement('br'));

		this.cssop[j].appendChild(this.bS[0][j].element);
		this.cssop[j].appendChild(this.bS[1][j].element);
		this.cssop[j].appendChild(this.bS[2][j].element);
		this.cssop[j].appendChild(this.bS[3][j].element);
		this.cssop[j].appendChild(this.bS[4][j].element);
		this.baseBox.appendChild(this.cssop[j]);
	}
	// Refinement Controls
	this.refineBox = document.createElement('div');
	this.refineBox.className = 'twk-tab-hide';
	this.refineBox.appendChild(this.rSelect);
	this.refineBox.appendChild(document.createElement('br'));
	// Coloured Background
	this.coloursBox = document.createElement('div');
	this.coloursBox.id = 'twk-psst-coloursbox';
	this.beforeBars1 = [];
	this.beforeBars2 = [];
	this.afterBars = [];
	for (var j=0; j<28; j++) {
		this.beforeBars1[j] = document.createElement('div');
		this.beforeBars1[j].className = 'twk-psst-colour-bars-s';
		this.coloursBox.appendChild(this.beforeBars1[j]);
	}
    this.coloursBox.appendChild(document.createElement('br'));
	for (var j=0; j<28; j++) {
		this.afterBars[j] = document.createElement('div');
		this.afterBars[j].className = 'twk-psst-colour-bars-l';
		this.coloursBox.appendChild(this.afterBars[j]);
	}
    this.coloursBox.appendChild(document.createElement('br'));
	for (var j=0; j<28; j++) {
		this.beforeBars2[j] = document.createElement('div');
		this.beforeBars2[j].className = 'twk-psst-colour-bars-s';
		this.coloursBox.appendChild(this.beforeBars2[j]);
	}
	this.refineBox.appendChild(this.coloursBox);
	// Array Of Sliders
	this.rSop = [];
	this.rLsBox = [];
	for (var j=0; j<5; j++) {
		this.rSop[j] = document.createElement('div');
		this.rLsBox[j] = document.createElement('div');
		for (var k=0; k<28; k++) {
			this.rSop[j].appendChild(this.rSs[j][k].element);
			this.rLsBox[j].appendChild(this.rLs[j][k]);
		}
		if (j === this.rSelect.selectedIndex) {
			this.rSop[j].className = 'twk-psst-spectrum';
			this.rLsBox[j].className = 'twk-tab';
			this.rR[j].className = 'small-button';
		} else {
			this.rSop[j].className = 'twk-psst-spectrum-hide';
			this.rLsBox[j].className = 'twk-tab-hide';
			this.rR[j].className = 'small-button-hide';
		}
		this.refineBox.appendChild(this.rSop[j]);
		this.refineBox.appendChild(this.rLsBox[j]);
		this.refineBox.appendChild(this.rR[j]);
	}
	// Scale Chroma / Luma options
	this.advancedBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Scale Chroma')));
	this.advancedBox.appendChild(this.chromaScaleCheck);
	this.advancedBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Scale Luma')));
	this.advancedBox.appendChild(this.lumaScaleCheck);
	// Build Box Hierarchy
	this.box.appendChild(this.baseBox);
	this.box.appendChild(this.refineBox);
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Advanced Settings')));
	this.box.appendChild(this.advancedCheck);
	this.box.appendChild(this.advancedBox);
	this.holder.appendChild(this.box);
};
TWKPSSTCDL.prototype.toggleTweaks = function() {
	// If The Overall Checkbox Is Ticked
	if (this.inputs.tweaks.checked && this.inputs.d[1].checked) {
		if (this.inputs.outGamma.options[this.inputs.outGamma.selectedIndex].lastChild.nodeValue !== 'Null') {
			this.holder.className = 'tweakholder';
		} else {
			this.holder.className = 'tweakholder-hide';
			this.tweakCheck.checked = false;
		}
	} else {
		this.holder.className = 'tweakholder-hide';
		this.tweakCheck.checked = false;
	}
	this.toggleTweak();
};
TWKPSSTCDL.prototype.toggleTweak = function() {
	if (this.tweakCheck.checked) {
		this.box.className = 'tweak';
	} else {
		this.box.className = 'tweak-hide';
	}
};
TWKPSSTCDL.prototype.getTFParams = function(params) {
	// No Relevant Parameters For This Tweak
};
TWKPSSTCDL.prototype.getCSParams = function(params) {
	var out = {};
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		out.doPSSTCDL = true;
		var c = new Float64Array(29);
		for (var j=0; j<29; j++) {
			c[j] = (this.vals[0][j]/7)%1;
		}
		out.c = c.buffer;
		out.sat = this.vals[1].buffer.slice(0);
		out.s = this.vals[2].buffer.slice(0);
		out.o = this.vals[3].buffer.slice(0);
		out.p = this.vals[4].buffer.slice(0);
		out.chromaScale = this.chromaScaleCheck.checked;
		out.lumaScale = this.lumaScaleCheck.checked;
	} else {
		out.doPSSTCDL = false;
	}
	params.twkPSSTCDL = out;
};
TWKPSSTCDL.prototype.setParams = function(params) {
	if (typeof params.twkPSSTCDL !== 'undefined') {
		this.toggleTweaks();
	}
};
TWKPSSTCDL.prototype.getSettings = function(data) {
	data.psstCDL = {
		doPSSTCDL: this.tweakCheck.checked,
		basic: this.basRef[0].checked,
		channel: this.channelSelect.options[this.channelSelect.selectedIndex].lastChild.nodeValue,
		control: this.rSelect.options[this.rSelect.selectedIndex].lastChild.nodeValue,
		colour: this.taToString(this.vals[0],7),
		colourLock: this.checksToString(this.rLs[0]),
		saturation: this.taToString(this.vals[1]),
		saturationLock: this.checksToString(this.rLs[1]),
		slope: this.taToString(this.vals[2]),
		slopeLock: this.checksToString(this.rLs[2]),
		offset: this.taToString(this.vals[3]),
		offsetLock: this.checksToString(this.rLs[3]),
		power: this.taToString(this.vals[4]),
		powerLock: this.checksToString(this.rLs[4]),
		scaleChroma: this.chromaScaleCheck.checked,
		scaleLuma: this.lumaScaleCheck.checked
	};
};
TWKPSSTCDL.prototype.setSettings = function(settings) {
	if (typeof settings.psstCDL !== 'undefined') {
		var data = settings.psstCDL;
		if (typeof data.doPSSTCDL === 'boolean') {
			this.tweakCheck.checked = data.doPSSTCDL;
			this.toggleTweak();
		}
		if (typeof data.basic === 'boolean') {
			this.basRef[0].checked = data.basic;
			this.basRef[1].checked = !data.basic;
			this.toggleBasRef();
		}
		if (typeof data.channel !== 'undefined') {
			var m = this.channelSelect.options.length;
			for (var j=0; j<m; j++) {
				if (this.channelSelect.options[j].lastChild.nodeValue === data.channel) {
					this.channelSelect.options[j].selected = true;
					break;
				}
			}
		}
		if (typeof data.control !== 'undefined') {
			var m = this.rSelect.options.length;
			for (var j=0; j<m; j++) {
				if (this.rSelect.options[j].lastChild.nodeValue === data.control) {
					this.rSelect.options[j].selected = true;
					break;
				}
			}
		}
		if (typeof data.colour !== 'undefined') {
			var m = this.vals[0].length;
			var colour = data.colour.split(',').map(Number);
			for (var j=0; j<m; j++) {
				this.vals[0][j] = colour[j]*7;
				if (j%4 === 0) {
					this.baseVals[0][parseInt(j/4)] = colour[j];
				}
				if (j === 0) {
					this.baseVals[0][7] = this.baseVals[0][0];
				}
			}
			for (var j=0; j<7; j++) {
				this.bS[0][j].setValue(this.baseVals[0][j]*7);
			}
		}
		if (typeof data.colourLock !== 'undefined') {
			var colourLock = data.colourLock.split(',').map(Number);
			for (var j=0; j<28; j++) {
				if (colourLock[j] === 1) {
					this.rLs[0][j] = true;
				} else {
					this.rLs[0][j] = false;
				}
			}
		}
		if (typeof data.saturation !== 'undefined') {
			var m = this.vals[1].length;
			var sat = data.saturation.split(',').map(Number);
			for (var j=0; j<m; j++) {
				this.vals[1][j] = sat[j];
				if (j%4 === 0) {
					var baseSat = parseInt(j/4);
					this.baseVals[1][baseSat] = sat[j];
				}
				if (j === 0) {
					this.baseVals[1][7] = sat[j];
				}
			}
			for (var j=0; j<7; j++) {
				this.bS[1][j].setValue(this.baseVals[1][j]);
			}
		}
		if (typeof data.saturationLock !== 'undefined') {
			var saturationLock = data.saturationLock.split(',').map(Number);
			for (var j=0; j<28; j++) {
				if (saturationLock[j] === 1) {
					this.rLs[1][j] = true;
				} else {
					this.rLs[1][j] = false;
				}
			}
		}
		if (typeof data.slope !== 'undefined') {
			var m = this.vals[2].length;
			var slope = data.slope.split(',').map(Number);
			for (var j=0; j<m; j++) {
				this.vals[2][j] = slope[j];
				if (j%4 === 0) {
					var baseSlope = parseInt(j/4);
					this.baseVals[2][baseSlope] = slope[j];
				}
				if (j === 0) {
					this.baseVals[2][7] = slope[j];
				}
			}
			for (var j=0; j<7; j++) {
				this.bS[2][j].setValue(this.baseVals[2][j]);
			}
		}
		if (typeof data.slopeLock !== 'undefined') {
			var slopeLock = data.slopeLock.split(',').map(Number);
			for (var j=0; j<28; j++) {
				if (slopeLock[j] === 1) {
					this.rLs[2][j] = true;
				} else {
					this.rLs[2][j] = false;
				}
			}
		}
		if (typeof data.offset !== 'undefined') {
			var m = this.vals[3].length;
			var offset = data.offset.split(',').map(Number);
			for (var j=0; j<m; j++) {
				this.vals[3][j] = offset[j];
				if (j%4 === 0) {
					var baseOffset = parseInt(j/4);
					this.baseVals[3][baseOffset] = offset[j];
				}
				if (j === 0) {
					this.baseVals[3][7] = offset[j];
				}
			}
			for (var j=0; j<7; j++) {
				this.bS[3][j].setValue(this.baseVals[3][j]);
			}
		}
		if (typeof data.offsetLock !== 'undefined') {
			var offsetLock = data.offsetLock.split(',').map(Number);
			for (var j=0; j<28; j++) {
				if (offsetLock[j] === 1) {
					this.rLs[3][j] = true;
				} else {
					this.rLs[3][j] = false;
				}
			}
		}
		if (typeof data.power !== 'undefined') {
			var m = this.vals[4].length;
			var power = data.power.split(',').map(Number);
			for (var j=0; j<m; j++) {
				this.vals[4][j] = power[j];
				if (j%4 === 0) {
					var basePower = parseInt(j/4);
					this.baseVals[4][basePower] = power[j];
				}
				if (j === 0) {
					this.baseVals[4][7] = power[j];
				}
			}
			for (var j=0; j<7; j++) {
				this.bS[4][j].setValue(this.baseVals[4][j]);
			}
		}
		if (typeof data.powerLock !== 'undefined') {
			var powerLock = data.powerLock.split(',').map(Number);
			for (var j=0; j<28; j++) {
				if (powerLock[j] === 1) {
					this.rLs[4][j] = true;
				} else {
					this.rLs[4][j] = false;
				}
			}
		}
		this.updateRef();
		if (typeof data.scaleChroma === 'boolean') {
			this.chromaScaleCheck.checked = data.scaleChroma;
		}
		if (typeof data.scaleLuma === 'boolean') {
			this.lumaScaleCheck.checked = data.scaleLuma;
		}
	}
};
TWKPSSTCDL.prototype.getInfo = function(info) {
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		info.doPSSTCDL = true;
	} else {
		info.doPSSTCDL = false;
	}
};
TWKPSSTCDL.prototype.isCustomGamma = function() {
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		return true;
	} else {
		return false;
	}
};
TWKPSSTCDL.prototype.isCustomGamut = function() {
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		return true;
	} else {
		return false;
	}
};
TWKPSSTCDL.prototype.events = function() {
	this.tweakCheck.onclick = function(here){ return function(){
		here.toggleTweak();
		here.messages.gtSetParams();
	};}(this);
	this.channelSelect.onchange = function(here){ return function(){
		here.changeChannel();
	};}(this);
	this.basRef[0].onchange = function(here){ return function(){
		here.toggleBasRef();
	};}(this);
	this.basRef[1].onchange = function(here){ return function(){
		here.toggleBasRef();
	};}(this);
	this.rSelect.onchange = function(here){ return function(){
		here.updateRef();
	};}(this);
	for (var k=0; k<5; k++) {
		for (var j=0; j<7; j++) {
			this.bS[k][j].action = function(i){ return function(){
				if (i[1] === 0) {
					i[0].baseVals[i[1]][i[2]] = i[0].bS[i[1]][i[2]].getValue()/7;
				} else {
					i[0].baseVals[i[1]][i[2]] = i[0].bS[i[1]][i[2]].getValue();
				}
				if (i[2] === 0) {
					i[0].baseVals[i[1]][7] = i[0].baseVals[i[1]][0];
				}
				i[0].updateR(i[1]);
				i[0].messages.gtSetParams();
			};}([this,k,j]);
			this.bS[k][j].resetAll = function(i){ return function(){
				for (var l=0; l<7; l++) {
					i[0].bS[i[1]][l].reset();
					if (i[1] === 0) {
						i[0].baseVals[i[1]][l] = i[0].bS[i[1]][l].getValue()/7;
					} else {
						i[0].baseVals[i[1]][l] = i[0].bS[i[1]][l].getValue();
					}
					if (l === 0) {
						i[0].baseVals[i[1]][7] = i[0].baseVals[i[1]][0];
					}
				}
				i[0].updateR(i[1]);
				i[0].messages.gtSetParams();
			};}([this,k]);
		}
		for (var j=0; j<28; j++) {
			this.rSs[k][j].action = function(i){ return function(){
				i[0].vals[i[1]][i[2]] = i[0].rSs[i[1]][i[2]].getValue();
				if (i[2]%4 === 0) {
					var l = Math.round(i[2]/4);
					i[0].bS[i[1]][l].setValue(i[0].vals[i[1]][i[2]]);
					if (i[1] === 0) {
						i[0].baseVals[i[1]][l] = i[0].vals[i[1]][i[2]]/7;
					} else {
						i[0].baseVals[i[1]][l] = i[0].vals[i[1]][i[2]];
					}
				} else {
					i[0].rLs[i[1]][i[2]].checked = true;
				}
				if (i[2] === 0) {
					i[0].vals[i[1]][28] = i[0].vals[i[1]][0];
					i[0].baseVals[i[1]][7] = i[0].baseVals[i[1]][0];
				}
				if (i[2]%4 === 0) {
					i[0].updateR(i[1]);
				}
				i[0].messages.gtSetParams();
			};}([this,k,j]);
			this.rLs[k][j].onclick = function(i){ return function(){
				if (!i[0].rLs[i[1]][i[2]].checked) {
					i[0].updateR(i[1]);
					i[0].messages.gtSetParams();
				}
			};}([this,k,j]);
		}
		this.rR[k].onclick = function(i){ return function(){
			for (var l=0; l<28; l++) {
				i[0].rSs[i[1]][l].reset();
				i[0].vals[i[1]][l] = i[0].rSs[i[1]][l].getValue();
				if (l%4 !== 0) {
					i[0].rLs[i[1]][l].checked = false;
				}
			}
			i[0].vals[i[1]][28] = i[0].vals[i[1]][0];
			for (var l=0; l<7; l++) {
				i[0].bS[i[1]][l].reset();
				if (i[1] === 0) {
					i[0].baseVals[i[1]][l] = i[0].bS[i[1]][l].getValue()/7;
				} else {
					i[0].baseVals[i[1]][l] = i[0].bS[i[1]][l].getValue();
				}
			}
			i[0].baseVals[i[1]][7] = i[0].baseVals[i[1]][0];
			i[0].messages.gtSetParams();
		};}([this,k]);
	}
	this.advancedCheck.onclick = function(here){ return function(){
		here.toggleAdvanced();
	};}(this);
	this.chromaScaleCheck.onclick = function(here){ return function(){
		here.messages.gtSetParams();
	};}(this);
	this.lumaScaleCheck.onclick = function(here){ return function(){
		here.messages.gtSetParams();
	};}(this);
};
// Tweak-Specific Code
TWKPSSTCDL.prototype.psstColours = function(p) {
	var before = new Uint8Array(p.b);
	var after = new Uint8Array(p.a);
	for (var j=0; j<28; j++) {
		this.beforeBars1[j].style.backgroundColor = 'rgb(' + before[j*3] + ',' + before[(j*3)+1] + ',' + before[(j*3)+2]+')';
		this.afterBars[j].style.backgroundColor = 'rgb(' + after[j*3] + ',' + after[(j*3)+1] + ',' + after[(j*3)+2]+')';
		this.beforeBars2[j].style.backgroundColor = 'rgb(' + before[j*3] + ',' + before[(j*3)+1] + ',' + before[(j*3)+2]+')';
		if (j%4 === 0) {
			var k = parseInt(j/4);
			this.beforeBar1[k].style.backgroundColor = 'rgb(' + before[j*3] + ',' + before[(j*3)+1] + ',' + before[(j*3)+2]+')';
			this.afterBar[k].style.backgroundColor = 'rgb(' + after[j*3] + ',' + after[(j*3)+1] + ',' + after[(j*3)+2]+')';
			this.beforeBar2[k].style.backgroundColor = 'rgb(' + before[j*3] + ',' + before[(j*3)+1] + ',' + before[(j*3)+2]+')';
		}
	}
	this.toggleTweaks();
};
TWKPSSTCDL.prototype.createRadioElement = function(name, checked) {
    var radioInput;
    try {
        var radioHtml = '<input type="radio" name="' + name + '"';
        if ( checked ) {
            radioHtml += ' checked="checked"';
        }
        radioHtml += '/>';
        radioInput = document.createElement(radioHtml);
    } catch( err ) {
        radioInput = document.createElement('input');
        radioInput.setAttribute('type', 'radio');
        radioInput.setAttribute('name', name);
        if ( checked ) {
            radioInput.setAttribute('checked', 'checked');
        }
    }
    return radioInput;
};
TWKPSSTCDL.prototype.initVals = function() {
	this.vals = [];
	this.baseRings = [];
	this.baseVals = [];
	for (var j=0; j<5; j++) {
		var valRow = new Float64Array(29);
		for (var k=0; k<29; k++) {
			if (j === 0 || j === 3) {
				valRow[k] = 0;
			} else {
				valRow[k] = 1;
			}
		}
		var baseRow = new Float64Array(8);
		for (var k=0; k<8; k++) {
			if (j === 0 || j === 3) {
				baseRow[k] = 0;
			} else {
				baseRow[k] = 1;
			}
		}
		this.vals[j] = valRow;
		this.baseVals[j] = baseRow;
		var ring = new Ring();
	  	ring.setDetails({
			title: '',
			L: baseRow.buffer,
			p: false
		});
		this.baseRings[j] = ring;
	}
};
TWKPSSTCDL.prototype.channelList = function() {
	var channels = [
		'Blue',
		'Magenta',
		'Red',
		'Skin',
		'Yellow',
		'Green',
		'Cyan'
	];
	var max = channels.length;
	for (var j=0; j<max; j++) {
		var option = document.createElement('option');
		option.value = j.toString();
		option.appendChild(document.createTextNode(channels[j]));
		if (channels[j] === 'Skin') {
			option.selected = true;
		}
		this.channelSelect.appendChild(option);
	}
};
TWKPSSTCDL.prototype.changeChannel = function() {
	var chan = this.channelSelect.selectedIndex;
	for (var j=0; j<7; j++) {
		if (j === chan) {
			this.cssop[j].className = 'twk-tab';
		} else {
			this.cssop[j].className = 'twk-tab-hide';
		}
	}
};
TWKPSSTCDL.prototype.refineList = function() {
	var controls = [
		'Colour Shift',
		'Saturation',
		'Slope',
		'Offset',
		'Power'
	];
	var max = controls.length;
	for (var j=0; j<max; j++) {
		var option = document.createElement('option');
		option.value = j.toString();
		option.appendChild(document.createTextNode(controls[j]));
		if (controls[j] === 'Saturation') {
			option.selected = true;
		}
		this.rSelect.appendChild(option);
	}
};
TWKPSSTCDL.prototype.toggleBasRef = function() {
	if (this.basRef[0].checked) {
		this.baseBox.className = 'twk-tab';
		this.refineBox.className = 'twk-tab-hide';
	} else {
		this.baseBox.className = 'twk-tab-hide';
		this.refineBox.className = 'twk-tab';
	}
	this.updateRef();
};
TWKPSSTCDL.prototype.updateR = function(control) {
	var vals = this.vals[control];
	var locks = this.rLs[control];
	var ring = this.baseRings[control];
	var rSs = this.rSs[control];
	for (var j=0; j<28; j++) {
		if (j%4 === 0 || !locks[j].checked) {
			vals[j] = ring.fCub(j/28);
			if ((control === 1 || control === 4) && vals[j] < 0) {
				vals[j] = 0;
			} else if (control === 0) {
				vals[j] *= 7;
			}
		}
		rSs[j].setValue(vals[j]);
	}
	vals[28] = ring.fCub(1);
	if ((control === 1 || control === 4) && vals[28] < 0) {
		vals[28] = 0;
	}
};
TWKPSSTCDL.prototype.updateRef = function() {
	var control = this.rSelect.selectedIndex;
	for (var j=0; j<5; j++) {
		if (j === control) {
			this.rSop[j].className = 'twk-psst-spectrum';
			this.rLsBox[j].className = 'twk-tab';
			this.rR[j].className = 'small-button';
		} else {
			this.rSop[j].className = 'twk-psst-spectrum-hide';
			this.rLsBox[j].className = 'twk-tab-hide';
			this.rR[j].className = 'small-button-hide';
		}
	}
	this.updateR(control);
};
TWKPSSTCDL.prototype.toggleAdvanced = function() {
	if (this.advancedCheck.checked) {
		this.advancedBox.className = 'twk-advanced';
	} else {
		this.advancedBox.className = 'twk-advanced-hide';
	}
};
TWKPSSTCDL.prototype.taToString = function(data,mul) {
	var out = [];
	var m = data.length;
	if (typeof mul === 'number') {
		for (var j=0; j<m; j++) {
			out[j] = data[j]/mul;
		}
	} else {
		for (var j=0; j<m; j++) {
			out[j] = data[j];
		}
	}
	return out.toString();
};
TWKPSSTCDL.prototype.checksToString = function(data) {
	var out = [];
	var m = data.length;
	for (var j=0; j<m; j++) {
		if (data[j].checked) {
			out[j] = 1;
		} else {
			out[j] = 0;
		}
	}
	return out.toString();
};
// Loading progress bar
if (typeof splash !== 'undefined') {
	splashProg();
}
