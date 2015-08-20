/* twk-blank.js
* Empty 'Tweak' template object for the LUTCalc Web App.
* 10th April 2015
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function TWKBLANK(tweaksBox, inputs, messages) {
	this.tweaksBox = tweaksBox;
	this.inputs = inputs;
	this.messages = messages;
	this.io();
	this.ui();
	this.events();
}
TWKBLANK.prototype.io = function() {
	// Tweak Checkbox
	this.tweakCheck = document.createElement('input');
	this.tweakCheck.setAttribute('type','checkbox');
	this.tweakCheck.className = 'twk-checkbox';
	this.tweakCheck.checked = false;
	// Tweak - Specific Inputs
}
TWKBLANK.prototype.ui = function() {
	// General Tweak Holder (Including Checkbox)
	this.holder = document.createElement('div');
	this.holder.className = 'tweakholder-hide';
	this.tweaksBox.appendChild(this.holder);
	this.holder.appendChild(document.createElement('label').appendChild(document.createTextNode('BLANK')));
	this.holder.appendChild(this.tweakCheck);
	// Tweak Box - Inputs Which Appear When the Tweak Checkbox Is Ticked
	this.box = document.createElement('div');
	this.box.className = 'tweak-hide';
	// Tweak - Specific UI Elements

	// Build Box Hierarchy
	this.holder.appendChild(this.box);
}
TWKBLANK.prototype.toggleTweaks = function() {
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
}
TWKBLANK.prototype.toggleTweak = function() {
	if (this.tweakCheck.checked) {
		this.box.className = 'tweak';
	} else {
		this.box.className = 'tweak-hide';
	}
}
TWKBLANK.prototype.getTFParams = function(params) {
	// Parameters to be sent to the 'Gamma' (Transfer Function) web worker go here

	// Format is:
//	var out = {};
//	var tweaks = this.inputs.tweaks.checked;
//	var tweak = this.tweakCheck.checked;
//	if (tweaks && tweak) {
//		out.doBLANK = true;
//	} else {
//		out.doBLANK = false;
//	}
//	out.widget = this.widgetinput value converted to int / float / string etc.
//	out. ... = ... etc.
//
//	params.twkBLANK = out;
	// Leave function content blank if not parameters are relevent
}
TWKBLANK.prototype.getCSParams = function(params) {
	// Parameters to be sent to the 'Gamut' (Colour Space) web worker go here

	// Format is:
//	var out = {};
//	var tweaks = this.inputs.tweaks.checked;
//	var tweak = this.tweakCheck.checked;
//	if (tweaks && tweak) {
//		out.doBLANK = true;
//	} else {
//		out.doBLANK = false;
//	}
//	out.widget = this.widgetinput value converted to int / float / string etc.
//	out. ... = ... etc.
//
//	params.twkBLANK = out;
	// Leave function content blank if not parameters are relevent
}
TWKBLANK.prototype.setParams = function(params) {
	if (typeof params.twkBLANK !== 'undefined') {
		var p = params.twkBLANK;
		this.toggleTweaks();
	}
	// Any changes to UI inputs coming from the gamma and gamut workers should go here
}
TWKBLANK.prototype.events = function() {
	this.tweakCheck.onclick = function(here){ return function(){
		here.toggleTweak();
		here.messages.gtSetParams();
	};}(this);

	// Event responses for input changes or click should go here

	// Basic format:
//	this.widget.onchange = function(here){ return function(){
//		here.widgetResponse();
//		here.messages.gtSetParams(); <- if appropriate
//	};}(this);

	// Format when extra parameters are required (eg multiple inputs in an array):
//	this.widget.onchange = function(i){ return function(){
//		i[0].widgetResponse(i[1]);
//		here.messages.gtSetParams(); <- if appropriate
//	};}([this,extra parameter]);
}
// Tweak-Specific Code
	// Methods called by event responses should go here
	// Requirements:
	//		style.display should be avoided, use className = 'value';
	//		for showing and hiding, it should be of the form className = 'twk-itemclass' and className = 'twk-itemclass-hide'
