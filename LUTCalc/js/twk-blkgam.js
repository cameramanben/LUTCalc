/* twk-blkgam.js
* Black gamma adjustment object for the LUTCalc Web App.
* 19th July 2016
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function TWKBlkGam(tweaksBox, inputs, messages) {
	this.tweaksBox = tweaksBox;
	this.inputs = inputs;
	this.messages = messages;
	this.io();
	this.ui();
}
TWKBlkGam.prototype.io = function() {
	// Tweak Checkbox
	this.tweakCheck = document.createElement('input');
	this.tweakCheck.setAttribute('type','checkbox');
	this.tweakCheck.className = 'twk-checkbox';
	this.tweakCheck.checked = false;
	// Tweak - Specific Inputs
	// Power
	this.gamS = new lutSlider({
		min: 0.01,
		mid: 1,
		max: 10,
		value: 1,
		step: 0.01,
		title: false,
		lhs: 'Power',
		minLabel: false,
		maxLabel: false,
		input: 'number',
		reset: true
	});
	// Limit
	this.limS = new lutSlider({
		min: -9,
		max: 2,
		value: -1.5,
		step: 0.1,
		title: false,
		lhs: 'Stop Limit',
		minLabel: false,
		maxLabel: false,
		input: 'number',
		reset: true
	});
	// Feather
	this.feaS = new lutSlider({
		min: 0,
		max: 9,
		value: 2,
		step: 0.1,
		title: false,
		lhs: 'Feather',
		minLabel: false,
		maxLabel: false,
		rhs: 'Stops',
		input: 'number',
		reset: true
	});
};
TWKBlkGam.prototype.ui = function() {
	// General Tweak Holder (Including Checkbox)
	this.holder = document.createElement('div');
	this.holder.className = 'tweakholder-hide';
	this.tweaksBox.appendChild(this.holder);
	this.holder.appendChild(document.createElement('label').appendChild(document.createTextNode('Black Gamma')));
	this.holder.appendChild(this.tweakCheck);
	// Tweak Box - Inputs Which Appear When the Tweak Checkbox Is Ticked
	this.box = document.createElement('div');
	this.box.className = 'tweak-hide';
	// Tweak - Specific UI Elements
	this.box.appendChild(this.gamS.element);
	this.box.appendChild(this.limS.element);
	this.box.appendChild(this.feaS.element);
	// Build Box Hierarchy
	this.holder.appendChild(this.box);
};
TWKBlkGam.prototype.toggleTweaks = function() {
	// If The Overall Checkbox Is Ticked
	if (this.inputs.tweaks.checked) { // This checks for 'Customisations' to be checked and LUT type set to '3D' (the d[1] item)
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
TWKBlkGam.prototype.toggleTweak = function() {
	if (this.tweakCheck.checked) {
		this.box.className = 'tweak';
	} else {
		this.box.className = 'tweak-hide';
	}
};
TWKBlkGam.prototype.getTFParams = function(params) {
	var out = {};
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		out.doBlkGam = true;
	} else {
		out.doBlkGam = false;
	}
	out.upperLim = this.limS.getValue();
	out.feather = this.feaS.getValue();
	out.power = this.gamS.getValue();
	params.twkBlkGam = out;
};
TWKBlkGam.prototype.getCSParams = function(params) {
	// No Relevant Parameters For This Tweak
};
TWKBlkGam.prototype.setParams = function(params) {
	if (typeof params.twkBlkGam !== 'undefined') {
		var p = params.twkBlkGam;
		this.toggleTweaks();
	}
};
TWKBlkGam.prototype.getSettings = function(data) {
	data.blackGamma = {
		doBlkGamma: this.tweakCheck.checked,
		stopLimit: this.limS.getValue(),
		feather: this.feaS.getValue(),
		power: this.gamS.getValue()
	};
};
TWKBlkGam.prototype.setSettings = function(settings) {
	if (typeof settings.blackGamma !== 'undefined') {
		var data = settings.blackGamma;
		if (typeof data.doBlkGamma === 'boolean') {
			this.tweakCheck.checked = data.doBlkGamma;
			this.toggleTweak();
		}
		if (typeof data.stopLimit === 'number') {
			this.limS.setValue(data.stopLimit);
		}
		if (typeof data.feather === 'number') {
			this.feaS.setValue(data.feather);
		}
		if (typeof data.power === 'number') {
			this.gamS.setValue(data.power);
		}
	}
};
TWKBlkGam.prototype.getInfo = function(info) {
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		info.doBlkGam = true;
	} else {
		info.doBlkGam = false;
	}
};
TWKBlkGam.prototype.isCustomGamma = function() {
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		return true;
	} else {
		return false;
	}
};
TWKBlkGam.prototype.isCustomGamut = function() {
	return false;
};
TWKBlkGam.prototype.events = function() {
	this.tweakCheck.onclick = function(here){ return function(){
		here.toggleTweak();
		here.messages.gaSetParams();
	};}(this);
	this.limS.action = function(here){ return function(){
		here.messages.gaSetParams();
	};}(this);
	this.feaS.action = function(here){ return function(){
		here.messages.gaSetParams();
	};}(this);
	this.gamS.action = function(here){ return function(){
		here.messages.gaSetParams();
	};}(this);
};
// Tweak-Specific Code
// Loading progress bar
if (typeof splash !== 'undefined') {
	splashProg();
}
