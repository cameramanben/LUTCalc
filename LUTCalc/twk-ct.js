/* twk-ct.js
* Colour Temperature adjustment object for the LUTCalc Web App.
* 10th April 2015
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function TWKCT(tweaksBox, inputs, messages) {
	this.tweaksBox = tweaksBox;
	this.inputs = inputs;
	this.messages = messages;
	this.io();
	this.ui();
	this.events();
}
TWKCT.prototype.io = function() {
	// Tweak Checkbox
	this.tweakCheck = document.createElement('input');
	this.tweakCheck.setAttribute('type','checkbox');
	this.tweakCheck.className = 'twk-checkbox';
	this.tweakCheck.checked = false;

	// CTO / CTB Slider
	this.ctSlider = document.createElement('input');
	this.ctSlider.setAttribute('type','range');
	this.ctSlider.setAttribute('min',-2);
	this.ctSlider.setAttribute('max',2);
	this.ctSlider.setAttribute('step',0.125);
	this.ctSlider.setAttribute('value',0);
	this.ctSlider.className = 'slider';
	this.ctSliderLabel = document.createElement('label');
	this.ctSliderLabel.innerHTML = 'Clear';
	// Colour Temperature Of Recording
	this.ctCamInput = document.createElement('input');
	this.ctCamInput.setAttribute('type','number');
	this.ctCamInput.className = 'kelvininput';
	this.ctCamInput.value = '5500';
	// Desired Colour Temperature
	this.ctNewInput = document.createElement('input');
	this.ctNewInput.setAttribute('type','number');
	this.ctNewInput.className = 'kelvininput';
	this.ctNewInput.value = '5500';
	// Advanced Options Checkbox
	this.advancedCheck = document.createElement('input');
	this.advancedCheck.setAttribute('type','checkbox');
	this.advancedCheck.className = 'twk-checkbox';
	this.advancedCheck.checked = false;
	// Chromatic Adaptation Transform Model Selector
	this.catSelect = document.createElement('select');
	this.catSelect.className = 'twk-select';
	this.catList();
}
TWKCT.prototype.ui = function() {
	// General Tweak Holder (Including Checkbox)
	this.holder = document.createElement('div');
	this.holder.className = 'tweakholder-hide';
	this.tweaksBox.appendChild(this.holder);
	this.holder.appendChild(document.createElement('label').appendChild(document.createTextNode('Colour Temperature Shift')));
	this.holder.appendChild(this.tweakCheck);
	// Tweak Box - Inputs Which Appear When the Tweak Checkbox Is Ticked
	this.box = document.createElement('div');
	this.box.className = 'tweak-hide';
	// Advanced Box - Holds Advanced Or Experimental Inputs
	this.advancedBox = document.createElement('div');
	this.advancedBox.className = 'twk-advanced-hide';
// Tweak - Specific UI Elements
	// CTO / CTB Slider
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('CTO')));
	this.box.appendChild(this.ctSlider);
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('CTB')));
	this.box.appendChild(document.createElement('br'));
	this.box.appendChild(this.ctSliderLabel);
	this.box.appendChild(document.createElement('br'));
	// Recorded And Desired Colour Temperatures
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Camera White Balance')));
	this.box.appendChild(this.ctCamInput);
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('K')));
	this.box.appendChild(document.createElement('br'));
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('New White Balance')));
	this.box.appendChild(this.ctNewInput);
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('K')));
	this.box.appendChild(document.createElement('br'));
	// Advanced settings Checkbox
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Advanced Settings')));
	this.box.appendChild(this.advancedCheck);
	// Chromatic Adaptation Transform Selection
	this.advancedBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Chromatic Adaptation Model')));
	this.advancedBox.appendChild(this.catSelect);

	// Build Box Hierarchy
	this.box.appendChild(this.advancedBox);
	this.holder.appendChild(this.box);
}
TWKCT.prototype.toggleTweaks = function() {
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
}
TWKCT.prototype.toggleTweak = function() {
	if (this.tweakCheck.checked) {
		this.box.className = 'tweak';
	} else {
		this.box.className = 'tweak-hide';
	}
}
TWKCT.prototype.getTFParams = function(params) {
	// No Relevant Parameters For This Tweak
}
TWKCT.prototype.getCSParams = function(params) {
	var out = {};
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		out.doCT = true;
		out.camTemp = parseInt(this.ctCamInput.value);
		out.newTemp = parseInt(this.ctNewInput.value);
		out.CAT = this.catSelect.selectedIndex;
	} else {
		out.doCT = false;
	}
	params.twkCT = out;
}
TWKCT.prototype.setParams = function(params) {
	if (typeof params.twkCT !== 'undefined') {
		var p = params.twkCT;
		this.toggleTweaks();
	}
}
TWKCT.prototype.getInfo = function(info) {
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		info.doCT = true;
	} else {
		info.doCT = false;
	}
}
TWKCT.prototype.events = function() {
	this.tweakCheck.onclick = function(here){ return function(){
		here.toggleTweak();
		here.messages.gtSetParams();
	};}(this);
	this.ctSlider.onchange = function(here){ return function(){
		here.testSlider();
		here.messages.gtSetParams();
	};}(this);
	this.ctCamInput.onchange = function(here){ return function(){
		here.testCTCam();
		here.messages.gtSetParams();
	};}(this);
	this.ctNewInput.onchange = function(here){ return function(){
		here.testCTNew();
		here.messages.gtSetParams();
	};}(this);
	this.advancedCheck.onclick = function(here){ return function(){
		here.toggleAdvanced();
	};}(this);
	this.catSelect.onchange = function(here){ return function(){
		here.messages.gtSetParams();
	};}(this);
}
// Tweak-Specific Code
TWKCT.prototype.catList = function() {
	var CATs = [
		'Bradford Chromatic Adaptation',
		'Von Kries',
		'Sharp',
		'CMCCAT2000',
		'CAT02',
		'XYZ Scaling'
	];
	var max = CATs.length;
	for (var j=0; j<max; j++) {
		var option = document.createElement('option');
		option.value = j.toString();
		option.appendChild(document.createTextNode(CATs[j]));
		if (j === 0) {
			option.selected = true;
		}
		this.catSelect.appendChild(option);
	}
}
TWKCT.prototype.testSlider = function() {
	var val = parseFloat(this.ctSlider.value);
	var ratio = Math.exp(-val*0.5415972824);
	var ctCam = Math.round(parseFloat(this.ctCamInput.value));
	var temp = ctCam*ratio;
	if (temp < 1800) {
		this.ctCamInput.value = Math.round(1800/ratio).toString();
		this.ctNewInput.value = '1800';
	} else if (temp > 21000) {
		this.ctCamInput.value = Math.round(21000/ratio).toString();
		this.ctNewInput.value = '21000';
	} else {
		this.ctNewInput.value = Math.round(temp).toString();
	}
	if (val<0) {
		this.ctSliderLabel.innerHTML = Math.abs(val).toString() + ' CTO';
	} else if (val === 0) {
		this.ctSliderLabel.innerHTML = 'Clear';
	} else {
		this.ctSliderLabel.innerHTML = val.toString() + ' CTB';
	}
}
TWKCT.prototype.testCTCam = function() {
	var ctCam = Math.round(parseFloat(this.ctCamInput.value));
	var temp = Math.round(parseFloat(this.ctNewInput.value));
	if (ctCam < 1800) {
		this.ctCamInput.value = '1800';
	} else if (temp > 21000) {
		this.ctCamInput.value = '21000';
	} else {
		this.ctCamInput.value = ctCam.toString();
	}
	var val = Math.log(parseFloat(this.ctNewInput.value)/parseFloat(this.ctCamInput.value))/0.5415972824;
	var valEight = Math.round(8*val)/8;
	val = -val.toFixed(3);
	this.ctSlider.value = val.toString();
	if (val<0) {
		this.ctSliderLabel.innerHTML = Math.abs(val).toString() + ' CTO';
	} else if (val === 0) {
		this.ctSliderLabel.innerHTML = 'Clear';
	} else {
		this.ctSliderLabel.innerHTML = val.toString() + ' CTB';
	}
}
TWKCT.prototype.testCTNew = function() {
	var ctCam = Math.round(parseFloat(this.ctCamInput.value));
	var temp = Math.round(parseFloat(this.ctNewInput.value));
	if (temp < 1800) {
		this.ctNewInput.value = '1800';
	} else if (temp > 21000) {
		this.ctNewInput.value = '21000';
	} else {
		this.ctNewInput.value = temp.toString();
	}
	var val = Math.log(parseFloat(this.ctNewInput.value)/parseFloat(this.ctCamInput.value))/0.5415972824;
	var valEight = Math.round(8*val)/8;
	val = -val.toFixed(3);
	this.ctSlider.value = val.toString();
	if (val<0) {
		this.ctSliderLabel.innerHTML = Math.abs(val).toString() + ' CTO';
	} else if (val === 0) {
		this.ctSliderLabel.innerHTML = 'Clear';
	} else {
		this.ctSliderLabel.innerHTML = val.toString() + ' CTB';
	}
}
TWKCT.prototype.toggleAdvanced = function() {
	if (this.advancedCheck.checked) {
		this.advancedBox.className = 'twk-advanced';
	} else {
		this.advancedBox.className = 'twk-advanced-hide';
	}
}
