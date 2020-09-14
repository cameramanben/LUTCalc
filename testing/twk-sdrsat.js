/* twk-sdrsat.js
* Adjustment using gamma correction to up the saturation of HLG signals in SDR viewing
* 4th April 2019
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function TWKSDRSat(tweaksBox, inputs, messages) {
	this.tweaksBox = tweaksBox;
	this.inputs = inputs;
	this.messages = messages;
	this.io();
	this.ui();
	this.events();
}
TWKSDRSat.prototype.io = function() {
	// Tweak Checkbox
	this.tweakCheck = document.createElement('input');
	this.tweakCheck.setAttribute('type','checkbox');
	this.tweakCheck.className = 'twk-checkbox';
	this.tweakCheck.checked = false;
	// Tweak - Specific Inputs
	this.gamma = new lutSlider({
		min: 1,
		max: 2,
		value: 1.2,
		step: 0.05,
		title: false,
		lhs: 'Saturation',
		minLabel: false,
		maxLabel: false,
		input: 'number',
		reset: true
	});
	this.hdrs = [
//		'Rec2100 PQ (PQ OOTF)',
//		'Rec2100 PQ (HLG OOTF)',
		'Rec2100 HLG',
//		'PQ (EOTF Only)',
		'ITU Proposal (400%)',
		'ITU Proposal (800%)',
		'BBC WHP283 (400%)',
		'BBC WHP283 (800%)'
	];
	this.wgts = [
		'Rec2020',
		'Rec2100'
	];
};
TWKSDRSat.prototype.ui = function() {
	// General Tweak Holder (Including Checkbox)
	this.holder = document.createElement('div');
	this.holder.className = 'tweakholder-hide';
	this.tweaksBox.appendChild(this.holder);
	this.holder.appendChild(document.createElement('label').appendChild(document.createTextNode('SDR Saturation')));
	this.holder.appendChild(this.tweakCheck);
	// Tweak Box - Inputs Which Appear When the Tweak Checkbox Is Ticked
	this.box = document.createElement('div');
	this.box.className = 'tweak-hide';
	// Tweak - Specific UI Elements
	this.box.appendChild(this.gamma.element);
	// Build Box Hierarchy
	this.holder.appendChild(this.box);
};
TWKSDRSat.prototype.toggleTweaks = function() {
	// If The Overall Checkbox Is Ticked
	if (this.inputs.tweaks.checked && this.inputs.d[1].checked) { // This checks for 'Customisations' to be checked and LUT type set to '3D' (the d[1] item)
		var oG = this.inputs.outGamma.options[this.inputs.outGamma.selectedIndex].lastChild.nodeValue;
		var oGt = this.inputs.outGamut.options[this.inputs.outGamut.selectedIndex].lastChild.nodeValue;
		if (this.hdrs.indexOf(oG) > -1 && this.wgts.indexOf(oGt) > -1) {
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
TWKSDRSat.prototype.toggleTweak = function() {
	if (this.tweakCheck.checked) {
		this.box.className = 'tweak';
	} else {
		this.box.className = 'tweak-hide';
	}
};
TWKSDRSat.prototype.getTFParams = function(params) {
	// No parameters are relevent
};
TWKSDRSat.prototype.getCSParams = function(params) {
	var out = {};
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		out.doSDRSat = true;
		out.gamma = this.gamma.getValue();
	} else {
		out.doSDRSat = false;
	}
	params.twkSDRSat = out;
};
TWKSDRSat.prototype.setParams = function(params) {
	if (typeof params.twkSDRSat !== 'undefined') {
		var p = params.twkSDRSat;
		this.toggleTweaks();
	}
};
TWKSDRSat.prototype.getSettings = function(data) {
	data.sdrsat = {
		doSDRSat: this.tweakCheck.checked,
		gamma: this.gamma.getValue()
	};
};
TWKSDRSat.prototype.setSettings = function(settings) {
	if (typeof settings.SDRSAT !== 'undefined') {
		var data = settings.SDRSAT;
		if (typeof data.doSDRSat === 'boolean') {
			this.tweakCheck.checked = data.doSDRSat;
			this.gamma.setValue(parseFloat(data.gamma));
			this.toggleTweak();
		}
	}
};
TWKSDRSat.prototype.getInfo = function(info) {
	// Provides metadata to LUT formats
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		info.doSDRSat = true;
	} else {
		info.doSDRSat = false;
	}
};
TWKSDRSat.prototype.events = function() {
	this.tweakCheck.onclick = function(here){ return function(){
		here.toggleTweak();
		here.messages.gtSetParams();
	};}(this);
	this.gamma.action = function(here){ return function(){
		here.messages.gtSetParams();
	};}(this);
};
// Tweak-Specific Code
	// Methods called by event responses should go here
	// Requirements:
	//		style.display should be avoided, use className = 'value';
	//		for showing and hiding, it should be of the form className = 'twk-itemclass' and className = 'twk-itemclass-hide'
