/* twk-fl.js
* Fluorescent / LED correction object for the LUTCalc Web App.
* 10th April 2015
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function TWKFL(tweaksBox, inputs, messages) {
	this.tweaksBox = tweaksBox;
	this.inputs = inputs;
	this.messages = messages;
	this.io();
	this.ui();
}
TWKFL.prototype.io = function() {
	// Tweak Checkbox
	this.tweakCheck = document.createElement('input');
	this.tweakCheck.setAttribute('type','checkbox');
	this.tweakCheck.className = 'twk-checkbox';
	this.tweakCheck.checked = false;

	// Plus / Minus Green Slider
	this.flSlider = document.createElement('input');
	this.flSlider.setAttribute('type','range');
	this.flSlider.setAttribute('min',-1.5);
	this.flSlider.setAttribute('max',1.5);
	this.flSlider.setAttribute('step',0.05);
	this.flSlider.setAttribute('value',0);
	this.flSliderLabel = document.createElement('label');
	this.flSliderLabel.innerHTML = 'Clear';
	// Advanced Options Checkbox
	this.advancedCheck = document.createElement('input');
	this.advancedCheck.setAttribute('type','checkbox');
	this.advancedCheck.className = 'twk-checkbox';
	this.advancedCheck.checked = false;

	// Camera White Balance Input
	this.camTempInput = document.createElement('input');
	this.camTempInput.setAttribute('type','number');
	this.camTempInput.className = 'kelvininput';
	this.camTempInput.value = '4300';
	// Lamp Colour Temperature Selector
	this.flTempSelect = document.createElement('select');
	this.flTempSelect.className = 'twk-select';
	// Lamp Colour Temperature Input
	this.flTempInput = document.createElement('input');
	this.flTempInput.setAttribute('type','number');
	this.flTempInput.className = 'kelvininput';
	this.flList();
	// Chromatic Adaptation Transform Model Selector
	this.catSelect = document.createElement('select');
	this.catSelect.className = 'twk-select';
//	this.catList();
}
TWKFL.prototype.ui = function() {
	// General Tweak Holder (Including Checkbox)
	this.holder = document.createElement('div');
	this.holder.className = 'tweakholder-hide';
	this.tweaksBox.appendChild(this.holder);
	this.holder.appendChild(document.createElement('label').appendChild(document.createTextNode('Fluori / LED Correction')));
	this.holder.appendChild(this.tweakCheck);
	// Tweak Box - Inputs Which Appear When the Tweak Checkbox Is Ticked
	this.box = document.createElement('div');
	this.box.className = 'tweak-hide';
	// Advanced Box - Holds Advanced Or Experimental Inputs
	this.advancedBox = document.createElement('div');
	this.advancedBox.className = 'twk-advanced-hide';
// Tweak - Specific UI Elements
	// Magenta / Green Slider
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Magenta')));
	this.box.appendChild(this.flSlider);
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Green')));
	this.box.appendChild(document.createElement('br'));
	this.box.appendChild(this.flSliderLabel);
	this.box.appendChild(document.createElement('br'));
	// Advanced settings Checkbox
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Advanced Settings')));
	this.box.appendChild(this.advancedCheck);
	// Camera White Balance Input
	this.advancedBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Camera White Balance')));
	this.advancedBox.appendChild(this.camTempInput);
	this.advancedBox.appendChild(document.createElement('label').appendChild(document.createTextNode('K')));
	this.advancedBox.appendChild(document.createElement('br'));
	// Lamp Nominal Colour Temperature Selector
	this.advancedBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Lamp Nominal Colour')));
	this.advancedBox.appendChild(this.flTempSelect);
	this.advancedBox.appendChild(document.createElement('br'));
	// Lamp Specific Colour Temperature Input
	this.advancedBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Lamp Colour Temperature')));
	this.advancedBox.appendChild(this.flTempInput);
	this.advancedBox.appendChild(document.createElement('label').appendChild(document.createTextNode('K')));
	this.advancedBox.appendChild(document.createElement('br'));
	// Chromatic Adaptation Transform Selection
	this.advancedBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Chromatic Adaptation Model')));
	this.advancedBox.appendChild(this.catSelect);

	// Build Box Hierarchy
	this.box.appendChild(this.advancedBox);
	this.holder.appendChild(this.box);
}
TWKFL.prototype.toggleTweaks = function() {
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
TWKFL.prototype.toggleTweak = function() {
	if (this.tweakCheck.checked) {
		this.box.className = 'tweak';
	} else {
		this.box.className = 'tweak-hide';
	}
}
TWKFL.prototype.getTFParams = function(params) {
	// No Relevant Parameters For This Tweak
}
TWKFL.prototype.getCSParams = function(params) {
	var out = {};
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		out.doFL = true;
		out.flMag = parseFloat(this.flSlider.value);
		out.flT = parseFloat(this.flTempInput.value)/parseFloat(this.camTempInput.value);
		out.CAT = this.catSelect.selectedIndex;
	} else {
		out.doFL = false;
	}
	params.twkFL = out;
}
TWKFL.prototype.setParams = function(params) {
	if (typeof params.twkFL !== 'undefined') {
		var p = params.twkFL;
		this.toggleTweaks();
	}
}
TWKFL.prototype.getInfo = function(info) {
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		info.doFL = true;
	} else {
		info.doFL = false;
	}
}
TWKFL.prototype.events = function() {
	this.tweakCheck.onclick = function(here){ return function(){
		here.toggleTweak();
		here.messages.gtSetParams();
	};}(this);
	this.flSlider.oninput = function(here){ return function(){
		here.testSlider();
		here.messages.gtSetParams();
	};}(this);
	this.advancedCheck.onclick = function(here){ return function(){
		here.toggleAdvanced();
	};}(this);
	this.camTempInput.onchange = function(here){ return function(){
		here.testCamTemp();
		here.messages.gtSetParams();
	};}(this);
	this.flTempSelect.onchange = function(here){ return function(){
		here.testFLTempSelect();
		here.messages.gtSetParams();
	};}(this);
	this.flTempInput.onchange = function(here){ return function(){
		here.testFLTemp();
		here.messages.gtSetParams();
	};}(this);
	this.catSelect.onchange = function(here){ return function(){
		here.messages.gtSetParams();
	};}(this);
}
// Tweak-Specific Code
TWKFL.prototype.gotCATs = function(CATs) {
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
TWKFL.prototype.catList = function() {
	var CATs = [
		'CIECAT02',
		'CIECAT97s',
		'Bradford Chromatic Adaptation',
		'Von Kries',
		'Sharp',
		'CMCCAT2000',
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
TWKFL.prototype.flList = function() {
	var colours = [	'Warm Comfort Light',
					'Warm White',
					'Tungsten',
					'White',
					'Cool White',
					'Daylight',
					'Cool Daylight'
	];
	var temps = [	2500,
					2800,
					3200,
					3500,
					4300,
					5500,
					6500
	];
	this.flTempL = [];
	this.flTempH = [];
	var max = colours.length;
	for (var j=0; j<max; j++) {
		var option = document.createElement('option');
		option.value = temps[j].toString();
		option.appendChild(document.createTextNode(colours[j]));
		if (colours[j] === 'Cool White') {
			option.selected = true;
			this.flTempInput.value = temps[j].toString();
		}
		if (j === 0) {
			this.flTempL[j] = 0;
			this.flTempH[j] = (temps[j] + temps[j+1])/2;
		} else if (j === max-1) {
			this.flTempL[j] = this.flTempH[j-1]+1;
			this.flTempH[j] = 99999;
		} else {
			this.flTempL[j] = this.flTempH[j-1]+1;
			this.flTempH[j] = (temps[j] + temps[j+1])/2;
		}
		this.flTempSelect.appendChild(option);
	}
}
TWKFL.prototype.testSlider = function() {
	var val = parseFloat(this.flSlider.value);
	if (val<0) {
		this.flSliderLabel.innerHTML = Math.abs(val).toString() + ' Minus Green';
	} else if (val === 0) {
		this.flSliderLabel.innerHTML = 'Clear';
	} else {
		this.flSliderLabel.innerHTML = Math.abs(val).toString() + ' Plus Green';
	}
}
TWKFL.prototype.toggleAdvanced = function() {
	if (this.advancedCheck.checked) {
		this.advancedBox.className = 'twk-advanced';
	} else {
		this.advancedBox.className = 'twk-advanced-hide';
	}
}
TWKFL.prototype.testFLTempSelect = function() {
	this.flTempInput.value = this.flTempSelect.options[this.flTempSelect.selectedIndex].value;
}
TWKFL.prototype.testFLTemp = function() {
	var temp = Math.round(parseFloat(this.flTempInput.value));
	if (temp < 1000) {
		this.flTempInput.value = '1000';
	} else if (temp > 40000) {
		this.flTempInput.value = '40000';
	} else {
		this.flTempInput.value = temp.toString();
	}
	temp = Math.round(parseFloat(this.flTempInput.value));
	var max = this.flTempL.length;
	for (var j=0; j<max; j++) {
		if (temp >= this.flTempL[j] && temp <= this.flTempH[j]) {
			this.flTempSelect.options[j].selected = true;
			break;
		}
	}
}
TWKFL.prototype.testCamTemp = function() {
	var val = Math.round(parseFloat(this.camTempInput.value));
	if (isNaN (val)) {
		this.camTempInput.value = '3200';
	} else if (val < 1000) {
		this.camTempInput.value = '1000';
	} else if (val > 40000) {
		this.camTempInput.value = '40000';
	} else {
		this.camTempInput.value = val.toString();
	}
}