/* twk-sat.js
* Variable Saturation (By Luminance) object for the LUTCalc Web App.
* 2nd October 2015
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function TWKMulti(tweaksBox, inputs, messages) {
	this.tweaksBox = tweaksBox;
	this.inputs = inputs;
	this.messages = messages;
	this.io();
	this.ui();
	this.events();
}
TWKMulti.prototype.io = function() {
	// Tweak Checkbox
	this.tweakCheck = document.createElement('input');
	this.tweakCheck.setAttribute('type','checkbox');
	this.tweakCheck.className = 'twk-checkbox';
	this.tweakCheck.checked = false;
	// Tweak - Specific Inputs
	// Saturation Slider
	this.satSlider = document.createElement('input');
	this.satSlider.setAttribute('type','range');
	this.satSlider.setAttribute('min',0);
	this.satSlider.setAttribute('max',2);
	this.satSlider.setAttribute('step',0.05);
	this.satSlider.setAttribute('value',1);
	// Saturation Input
	this.satInput = document.createElement('input');
	this.satInput.setAttribute('type','text');
	this.satInput.className = 'smallinput';
	this.satInput.value = '1';
	// Stop-By-Stop Sliders;
	this.satSliders = [];
	for (var j=0; j<17; j++) {
		var slider = document.createElement('input');
		slider.setAttribute('type','range');
		slider.setAttribute('min',0);
		slider.setAttribute('max',2);
		slider.setAttribute('step',0.01);
		slider.setAttribute('value',1);
		slider.className = 'twk-range-array';
		this.satSliders.push(slider);
	}
};
TWKMulti.prototype.ui = function() {
	// General Tweak Holder (Including Checkbox)
	this.holder = document.createElement('div');
	this.holder.className = 'tweakholder-hide';
	this.tweaksBox.appendChild(this.holder);
	this.holder.appendChild(document.createElement('label').appendChild(document.createTextNode('Saturation')));
	this.holder.appendChild(this.tweakCheck);
	// Tweak Box - Inputs Which Appear When the Tweak Checkbox Is Ticked
	this.box = document.createElement('div');
	this.box.className = 'tweak-hide';
	// Tweak - Specific UI Elements
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Saturation')));
	this.box.appendChild(this.satSlider);
	this.box.appendChild(this.satInput);
	this.box.appendChild(document.createElement('br'));
	// Box for stop-by-stop slider background
	this.coloursBox = document.createElement('div');
	this.coloursBox.id = 'twk-sat-coloursbox';
	this.topBars = [];
	this.stopBars = [];
	this.bottomBars = [];
	for (var j=0; j<17; j++) {
		this.topBars[j] = document.createElement('div');
		this.topBars[j].className = 'twk-sat-colour-bars-s';
		this.coloursBox.appendChild(this.topBars[j]);
	}
	for (var j=0; j<17; j++) {
		this.stopBars[j] = document.createElement('div');
		this.stopBars[j].className = 'twk-sat-colour-bars-l';
		this.coloursBox.appendChild(this.stopBars[j]);
	}
	for (var j=0; j<17; j++) {
		this.bottomBars[j] = document.createElement('div');
		this.bottomBars[j].className = 'twk-sat-colour-bars-s';
		this.coloursBox.appendChild(this.bottomBars[j]);
	}
	this.box.appendChild(this.coloursBox);
	// Array Of Sliders
	this.sliderBox = document.createElement('div');
	this.sliderBox.className = 'sat-sliders';
	for (var j=0; j<17; j++) {
		this.sliderBox.appendChild(this.satSliders[j]);
	}
	this.box.appendChild(this.sliderBox);

	// Build Box Hierarchy
	this.holder.appendChild(this.box);
};
TWKMulti.prototype.toggleTweaks = function() {
	// If The Overall Checkbox Is Ticked
	if (this.inputs.tweaks.checked && this.inputs.d[1].checked) { // This checks for 'Customisations' to be checked and LUT type set to '3D' (the d[1] item)
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
TWKMulti.prototype.toggleTweak = function() {
	if (this.tweakCheck.checked) {
		this.box.className = 'tweak';
	} else {
		this.box.className = 'tweak-hide';
	}
};
TWKMulti.prototype.getTFParams = function(params) {
	// No parameters are relevent
};
TWKMulti.prototype.getCSParams = function(params) {
	var out = {};
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		out.doSAT = true;
	} else {
		out.doSAT = false;
	}
	params.TWKMulti = out;
};
TWKMulti.prototype.setParams = function(params) {
	if (typeof params.TWKMulti !== 'undefined') {
		var p = params.TWKMulti;
		this.toggleTweaks();
	}
	// Any changes to UI inputs coming from the gamma and gamut workers should go here
};
TWKMulti.prototype.getSettings = function(data) {
	data.saturation = {
		doSAT: this.tweakCheck.checked,
	};
};
TWKMulti.prototype.setSettings = function(settings) {
	if (typeof settings.saturation !== 'undefined') {
		var data = settings.saturation;
		if (typeof data.doSAT === 'boolean') {
			this.tweakCheck.checked = data.doSAT;
			this.toggleTweak();
		}
	}
};
TWKMulti.prototype.getInfo = function(info) {
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		info.doSAT = true;
	} else {
		info.doSAT = false;
	}
};
TWKMulti.prototype.events = function() {
	this.tweakCheck.onclick = function(here){ return function(){
		here.toggleTweak();
		here.messages.gtSetParams();
	};}(this);
};
// Tweak-Specific Code
