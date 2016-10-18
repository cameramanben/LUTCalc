/* twk-gamlim.js
* A gamut limiter to avoid ugly clipping for the LUTCalc Web App.
* 10th April 2015
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function TWKGamutLim(tweaksBox, inputs, messages) {
	this.tweaksBox = tweaksBox;
	this.inputs = inputs;
	this.messages = messages;
	this.io();
	this.ui();
	this.events();
}
TWKGamutLim.prototype.io = function() {
	// Tweak Checkbox
	this.tweakCheck = document.createElement('input');
	this.tweakCheck.setAttribute('type','checkbox');
	this.tweakCheck.className = 'twk-checkbox';
	this.tweakCheck.checked = false;
	// Tweak - Specific Inputs
	this.gamSelect = document.createElement('select');
};
TWKGamutLim.prototype.ui = function() {
	// General Tweak Holder (Including Checkbox)
	this.holder = document.createElement('div');
	this.holder.className = 'tweakholder-hide';
	this.tweaksBox.appendChild(this.holder);
	this.holder.appendChild(document.createElement('label').appendChild(document.createTextNode('Gamut Limiter')));
	this.holder.appendChild(this.tweakCheck);
	// Tweak Box - Inputs Which Appear When the Tweak Checkbox Is Ticked
	this.box = document.createElement('div');
	this.box.className = 'tweak-hide';
	// Tweak - Specific UI Elements
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Display Gamut')));
	var rec709Opt = document.createElement('option');
	rec709Opt.value = 0;
	rec709Opt.innerHTML = 'Rec709 / sRGB';
	this.gamSelect.appendChild(rec709Opt);
	var rec2020Opt = document.createElement('option');
	rec2020Opt.value = 0;
	rec2020Opt.innerHTML = 'Rec2020 / Rec2100';
	this.gamSelect.appendChild(rec2020Opt);
	this.box.appendChild(this.gamSelect);
	

	// Build Box Hierarchy
	this.holder.appendChild(this.box);
};
TWKGamutLim.prototype.toggleTweaks = function() {
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
TWKGamutLim.prototype.toggleTweak = function() {
	if (this.tweakCheck.checked) {
		this.box.className = 'tweak';
	} else {
		this.box.className = 'tweak-hide';
	}
};
TWKGamutLim.prototype.getTFParams = function(params) {
	var out = {};
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		out.doGamutLim = true;
	} else {
		out.doGamutLim = false;
	}
	out.display = this.gamSelect.selectedIndex;
	params.twkGamutLim = out;
};
TWKGamutLim.prototype.getCSParams = function(params) {
	// No Relevant Parameters For This Tweak
};
TWKGamutLim.prototype.setParams = function(params) {
	if (typeof params.twkGamutLim !== 'undefined') {
		var p = params.twkGamutLim;
		this.toggleTweaks();
	}
};
TWKGamutLim.prototype.getSettings = function(data) {
	data.gamutLim = {
		doGamutLim: this.tweakCheck.checked,
		display: this.gamSelect.options[this.gamSelect.selectedIndex].innerHTML
	};
};
TWKGamutLim.prototype.setSettings = function(settings) {
	if (typeof settings.gamutLim !== 'undefined') {
		var data = settings.gamutLim;
		if (typeof data.doGamutLim === 'boolean') {
			this.tweakCheck.checked = data.doGamutLim;
			this.toggleTweak();
		}
		if (typeof data.display === 'string') {
			switch (data.display) {
				case 'Rec2020 / Rec2100': this.gamSelect.options[1].selected = true;
					break;
				case 'Rec709 / sRGB':
				default: this.gamSelect.options[0].selected = true;
					break;
			}
		}
	}
};
TWKGamutLim.prototype.getInfo = function(info) {
	// Provides metadata to LUT formats
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		info.doGamutLim = true;
	} else {
		info.doGamutLim = false;
	}
};
TWKGamutLim.prototype.isCustomGamma = function() {
	return false;
};
TWKGamutLim.prototype.isCustomGamut = function() {
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		return true;
	} else {
		return false;
	}
	return false;
};
TWKGamutLim.prototype.events = function() {
	this.tweakCheck.onclick = function(here){ return function(){
		here.toggleTweak();
		here.messages.gaSetParams();
	};}(this);
	this.gamSelect.onchange = function(here){ return function(){
		here.toggleTweak();
		here.messages.gaSetParams();
	};}(this);
};
// Tweak-Specific Code
